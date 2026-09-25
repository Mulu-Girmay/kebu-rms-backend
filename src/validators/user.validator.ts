import { USER_STATUS_VALUES } from '../utils/constants.js';
import { body, param, query } from 'express-validator';

export const validateIdParam = [
  param('id')
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('Invalid user ID'),
];

// Admin update
export const updateroleValidator = [
  body('role_id').exists().withMessage('Invalid role ID').bail(),
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
      'name',
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

export const passwordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),
];

export const settingsValidator = [
  body('orderStatusNotifications')
    .optional()
    .isIn(['all', 'rejected_ready_only', 'none'])
    .withMessage(
      'orderStatusNotifications must be "all", "rejected_ready_only", or "none"'
    ),

  body('promotionalNotifications')
    .optional()
    .isBoolean()
    .withMessage('promotionalNotifications must be a boolean'),
];
