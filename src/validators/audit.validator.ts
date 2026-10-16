import { query, body, param } from 'express-validator';

export const validateAuditQuery = [
  query('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('User ID cannot be empty'),

  query('action')
    .optional()
    .isString()
    .withMessage('Action must be a string')
    .trim()
    .notEmpty()
    .withMessage('Action cannot be empty'),

  query('tableName')
    .optional()
    .isString()
    .withMessage('Table name must be a string')
    .trim()
    .notEmpty()
    .withMessage('Table name cannot be empty'),

  query('recordId')
    .optional()
    .isString()
    .withMessage('Record ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('Record ID cannot be empty'),

  query('from')
    .optional()
    .isISO8601()
    .withMessage('From must be a valid ISO 8601 date'),

  query('to')
    .optional()
    .isISO8601()
    .withMessage('To must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer >= 1')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),

  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'action', 'tableName'])
    .withMessage(
      'Sort field must be one of: createdAt, updatedAt, action, tableName'
    ),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either asc or desc'),
];

export const validateAuditExportQuery = [
  ...validateAuditQuery,
  query('saving')
    .isEmpty()
    .isFloat({ min: 0 })
    .withMessage('Saving must be a number greater than or equal to 0')
    .toFloat(),
  query('change')
    .isEmpty()
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Change must be a number greater than or equal to 0')
    .toFloat(),
  query('salary')
    .isEmpty()
    .isFloat({ min: 0 })
    .withMessage('Salary must be a number greater than or equal to 0')
    .toFloat(),
];

export const validateAuditIdParam = [
  param('id').isMongoId().withMessage('Audit ID must be a valid MongoDB ID'),
];
