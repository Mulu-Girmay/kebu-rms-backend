import { USER_STATUS_VALUES } from '../utils/constants.js';
import { body, param, query } from 'express-validator';

export const validateIdParam = [
  param('id')
    .exists()
    .withMessage('ID  required')
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

export const createUserValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),

  body('role_id')
    .trim()
    .notEmpty()
    .withMessage('Role Id cannot be empty')
    .isString()
    .withMessage('Invalid Id format'),
];
