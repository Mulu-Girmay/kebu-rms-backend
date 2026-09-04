import { USER_STATUS_VALUES } from '../utils/constants.js';
import { body, param, query } from 'express-validator';

export const validateIdParam = [
  param('id')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('Invalid user ID'),
];

export const updateSelfValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),

  body().custom((_, { req }) => {
    const hasBodyFields = Object.keys(req.body).length > 0;
    const hasFileField = !!(
      req.file ||
      (req.files && Object.keys(req.files).length > 0)
    );
    if (!hasBodyFields && !hasFileField) {
      throw new Error('At least one field must be provided for update');
    }

    return true;
  }),
];

// Admin update
export const updateUserValidator = [
  body('role_id').optional().isString().withMessage('Invalid role ID'),

  body('status')
    .optional()
    .isIn(USER_STATUS_VALUES)
    .withMessage('Invalid status'),
];

export const validateUsersQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer >= 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be an integer between 1 and 20')
    .toInt(),

  query('status')
    .optional()
    .isIn(USER_STATUS_VALUES)
    .withMessage('Invalid status value'),

  query('role_id').optional().isString().withMessage('Invalid role ID'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term cannot exceed 100 characters'),

  query('sortBy')
    .optional()
    .isIn([
      'fullName',
      'email',
      'status',
      'createdAt',
      'created_at',
      'updated_at',
      'updatedAt',
    ])
    .withMessage('Invalid sort field'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];
