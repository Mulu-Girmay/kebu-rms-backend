import type { Request, Response } from 'express';
import { Category } from '../models/categories/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { APIError } from '../errors/APIError.js';

export const createCategory = async (
  req: Request,
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
  const filter: Record<string, unknown> = {};

  if (req.query.isActive !== undefined) {
    filter.isActive = String(req.query.isActive) === 'true';
  }

  const categories = await Category.find(filter).sort({ name: 1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
};

export const getCategoryMenuItems = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categoryId = req.params.id as string;
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new APIError('Category not found', 404);
  }

  const isAvailableOnly = req.query.available === 'true';
  const menuItems = isAvailableOnly
    ? await MenuItem.findAvailableByCategoryId(categoryId)
    : await MenuItem.findByCategoryId(categoryId);

  res.status(200).json({
    success: true,
    category: {
      id: category._id,
      name: category.name,
    },
    count: menuItems.length,
    data: menuItems,
  });
};

export const updateCategory = async (
  req: Request,
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

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: category,
  });
};

export const deleteCategory = async (
  req: Request,
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

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
};
