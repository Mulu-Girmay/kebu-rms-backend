import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { MenuItem } from '../models/menuItems/index.js';
import { Category } from '../models/categories/index.js';
import { Audit } from '../models/audits/index.js';
import { APIError } from '../errors/APIError.js';
import { AuditAction, MODEL_NAMES } from '../utils/constants.js';

export const createMenuItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { categoryId, name, description, price, isAvailable } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imageUrl || null;

  const menuItem = await MenuItem.create({
    categoryId,
    name,
    description,
    price,
    imageUrl,
    isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
  });

  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.CREATE,
      tableName: MODEL_NAMES.MENU_ITEM,
      recordId: menuItem._id.toString(),
      meta: {
        name: menuItem.name,
        price: menuItem.price,
        categoryId: menuItem.categoryId,
        isAvailable: menuItem.isAvailable,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem,
  });
};

export const getMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    q,
    categoryId,
    isAvailable,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;
  // as Record<string, string | undefined>;
  //  No type annotation; all are `any`prevents runtime errors from invalid inputs.
  const filter: Record<string, unknown> = {};

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  if (isAvailable !== undefined) {
    filter.isAvailable = String(isAvailable) === 'true';
  }

  if (q && typeof q === 'string' && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    filter.$or = [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined) {
      priceFilter.$lte = Number(maxPrice);
    }
    filter.price = priceFilter;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt';
  const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

  const [total, items] = await Promise.all([
    MenuItem.countDocuments(filter),
    MenuItem.find(filter)
      .populate('categoryId', 'name isActive')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    count: items.length,
    data: items,
  });
};

export const getPopularMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const limit = req.query.limit ? Number(req.query.limit) : 10;
  const popularItems = await MenuItem.findPopular(limit);

  res.status(200).json({
    success: true,
    count: popularItems.length,
    data: popularItems,
  });
};

export const getMenuItemById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const menuItemId = req.params.id as string;
  const menuItem = await MenuItem.findById(menuItemId).populate(
    'categoryId',
    'name isActive'
  );

  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  res.status(200).json({
    success: true,
    data: menuItem,
  });
};

export const updateMenuItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const menuItemId = req.params.id as string;
  const menuItem = await MenuItem.findById(menuItemId);

  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  const { categoryId, name, description, price, isAvailable } = req.body;

  if (categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new APIError('Category not found', 404);
    }
    menuItem.categoryId = categoryId;
  }

  if (name !== undefined) menuItem.name = name;
  if (description !== undefined) menuItem.description = description;
  if (price !== undefined) menuItem.price = Number(price);
  if (isAvailable !== undefined) menuItem.isAvailable = Boolean(isAvailable);

  if (req.file) {
    menuItem.imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl !== undefined) {
    menuItem.imageUrl = req.body.imageUrl;
  }

  await menuItem.save();

  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.UPDATE,
      tableName: MODEL_NAMES.MENU_ITEM,
      recordId: menuItem._id.toString(),
      meta: {
        name: menuItem.name,
        price: menuItem.price,
        categoryId: menuItem.categoryId,
        isAvailable: menuItem.isAvailable,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem,
  });
};

export const toggleMenuItemAvailability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const menuItemId = req.params.id as string;
  const { isAvailable } = req.body;

  const menuItem = await MenuItem.findByIdAndUpdate(
    menuItemId,
    { isAvailable: Boolean(isAvailable) },
    { new: true, runValidators: true }
  );

  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.UPDATE,
      tableName: MODEL_NAMES.MENU_ITEM,
      recordId: menuItem._id.toString(),
      meta: {
        isAvailable: menuItem.isAvailable,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: `Menu item availability updated to ${isAvailable ? 'available' : 'unavailable'}`,
    data: menuItem,
  });
};

export const deleteMenuItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const menuItemId = req.params.id as string;
  const menuItem = await MenuItem.findById(menuItemId);

  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  await menuItem.deleteOne();

  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.DELETE,
      tableName: MODEL_NAMES.MENU_ITEM,
      recordId: menuItemId,
      meta: {
        name: menuItem.name,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Menu item deleted successfully',
  });
};
