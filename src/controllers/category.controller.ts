import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { Category } from '../models/categories/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { Audit } from '../models/audits/index.js';
import { APIError } from '../errors/APIError.js';
import { AuditAction, MODEL_NAMES } from '../utils/constants.js';
import { cache, CACHE_KEYS } from '../utils/cache.js';

// In-memory cache store for category queries
const categoryCache = new Map<string, unknown>();

export const clearCategoryCache = (): void => {
  categoryCache.clear();
  cache.del(CACHE_KEYS.CATEGORIES);
};

export const createCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { name, description, isActive } = req.body;

  const existingCategory = await Category.findByName(name);
  if (existingCategory) {
    throw new APIError(`Category with name '${name}' already exists`, 409);
  }

  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : req.body.imageUrl || null;

  const category = await Category.create({
    name,
    description,
    imageUrl,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  // Invalidate stale cache on mutation
  clearCategoryCache();

  // Create audit log for category creation
  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.CREATE,
      tableName: MODEL_NAMES.CATEGORY,
      recordId: category._id.toString(),
      meta: {
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
};

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cacheKey = `categories:${req.query.isActive !== undefined ? String(req.query.isActive) : 'all'}`;

  if (categoryCache.has(cacheKey)) {
    const cachedData = categoryCache.get(cacheKey);
    res.status(200).json(cachedData);
    return;
  }

  const filter: Record<string, unknown> = {};

  if (req.query.isActive !== undefined) {
    filter.isActive = String(req.query.isActive) === 'true';
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  const responseData = {
    success: true,
    count: categories.length,
    data: categories,
  };

  categoryCache.set(cacheKey, responseData);

  res.status(200).json(responseData);
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const cacheKey = `category:${categoryId}`;

  if (categoryCache.has(cacheKey)) {
    const cachedData = categoryCache.get(cacheKey);
    res.status(200).json(cachedData);
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const responseData = {
    success: true,
    data: category,
  };

  categoryCache.set(cacheKey, responseData);

  res.status(200).json(responseData);
};

export const getCategoryMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const isAvailableOnly = req.query.available === 'true';
  const cacheKey = `categoryMenuItems:${categoryId}:${isAvailableOnly}`;

  if (categoryCache.has(cacheKey)) {
    const cachedData = categoryCache.get(cacheKey);
    res.status(200).json(cachedData);
    return;
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const menuItems = isAvailableOnly
    ? await MenuItem.findAvailableByCategoryId(categoryId)
    : await MenuItem.findByCategoryId(categoryId);

  const responseData = {
    success: true,
    category: {
      id: category._id,
      name: category.name,
    },
    count: menuItems.length,
    data: menuItems,
  };

  categoryCache.set(cacheKey, responseData);

  res.status(200).json(responseData);
};

export const updateCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const { name, description, isActive } = req.body;

  if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const duplicate = await Category.findByName(name);
    if (duplicate) {
      throw new APIError(`Category with name '${name}' already exists`, 409);
    }
    category.name = name.trim();
  }

  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = Boolean(isActive);

  if (req.file) {
    category.imageUrl = `/uploads/${req.file.filename}`;
  } else if (req.body.imageUrl !== undefined) {
    category.imageUrl = req.body.imageUrl;
  }

  await category.save();

  // Invalidate stale cache on mutation
  clearCategoryCache();

  // Create audit log for category update
  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.UPDATE,
      tableName: MODEL_NAMES.CATEGORY,
      recordId: category._id.toString(),
      meta: {
        name: category.name,
        description: category.description,
        isActive: category.isActive,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
};

export const deleteCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const linkedItemsCount = await MenuItem.countDocuments({
    categoryId,
  });

  if (linkedItemsCount > 0) {
    throw new APIError(
      `Cannot delete category. It currently contains ${linkedItemsCount} menu item(s). Please reassign or delete them first.`,
      400
    );
  }

  await category.deleteOne();

  // Invalidate stale cache on mutation
  clearCategoryCache();

  // Create audit log for category deletion
  if (req.user?.id) {
    await Audit.create({
      userId: req.user.id,
      action: AuditAction.DELETE,
      tableName: MODEL_NAMES.CATEGORY,
      recordId: categoryId,
      meta: {
        name: category.name,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
};
