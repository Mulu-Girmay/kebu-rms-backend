import { query } from 'express-validator';

export const validateWalletTransactionsQuery = [
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

  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
    .trim(),

  query('type')
    .optional()
    .isIn(['all', 'credit', 'top_up', 'debit', 'refund', 'mixed'])
    .withMessage(
      'Type must be one of: all, credit, top_up, debit, refund, mixed'
    ),

  query('dateRange')
    .optional()
    .isIn(['today', '7days', '30days', 'all'])
    .withMessage('Date range must be one of: today, 7days, 30days, all'),

  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),

  query('userId')
    .optional()
    .isString()
    .withMessage('User ID must be a string')
    .trim()
    .notEmpty()
    .withMessage('User ID cannot be empty'),

  query('sortBy')
    .optional()
    .isIn(['date', 'amount', 'createdAt'])
    .withMessage('Sort field must be one of: date, amount, createdAt'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
];
