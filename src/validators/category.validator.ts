import { body, param, query } from 'express-validator';

export const categoryIdParamSchema = [
  param('id').isMongoId().withMessage('Invalid category ID format'),
];

export const createCategorySchema = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('imageUrl').optional().trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];

export const updateCategorySchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().trim(),
  body('imageUrl').optional().trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
  body().custom((_, { req }) => {
    const { name, description, imageUrl, isActive } = req.body || {};
    if (
      name === undefined &&
      description === undefined &&
      imageUrl === undefined &&
      isActive === undefined
    ) {
      throw new Error('At least one field must be provided to update');
    }
    return true;
  }),
];

export const categoryQuerySchema = [
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
    .toBoolean(),
];
