import { body, param, query } from 'express-validator';

export const menuItemIdParamSchema = [
  param('id').isMongoId().withMessage('Invalid menu item ID format'),
];

export const createMenuItemSchema = [
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Menu item name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Menu item name must be between 2 and 150 characters'),
  body('description').optional().trim(),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative')
    .toFloat(),
  body('imageUrl').optional().trim(),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
    .toBoolean(),
];

export const updateMenuItemSchema = [
  body().custom((_, { req }) => {
    const { categoryId, name, description, price, imageUrl, isAvailable } =
      req.body || {};
    if (
      categoryId === undefined &&
      name === undefined &&
      description === undefined &&
      price === undefined &&
      imageUrl === undefined &&
      isAvailable === undefined
    ) {
      throw new Error('At least one field must be provided to update');
    }
    return true;
  }),
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Menu item name must be between 2 and 150 characters'),
  body('description').optional().trim(),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price cannot be negative')
    .toFloat(),
  body('imageUrl').optional().trim(),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
    .toBoolean(),
];

export const toggleAvailabilitySchema = [
  body('isAvailable')
    .notEmpty()
    .withMessage('isAvailable boolean is required')
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
    .toBoolean(),
];

export const menuItemQuerySchema = [
  query('q').optional().trim(),
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Category ID format'),
  query('isAvailable').optional().isBoolean().toBoolean(),
  query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy')
    .optional()
    .isIn(['name', 'price', 'createdAt', 'favoriteCount'])
    .withMessage('Invalid sortBy field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Invalid sortOrder value'),
];
