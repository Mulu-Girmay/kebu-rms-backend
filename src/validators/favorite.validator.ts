import { param, query } from 'express-validator';

export const toggleFavoriteParamSchema = [
  param('menuItemId').isMongoId().withMessage('Invalid menu item ID format'),
];

export const favoriteQuerySchema = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
