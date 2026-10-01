import { body, param, query } from 'express-validator';

export const validateAmount = [
  body('amount')
    .exists({ checkNull: true })
    .withMessage('Amount is required')
    .bail()
    .custom((value) => typeof value === 'number' && Number.isFinite(value))
    .withMessage('Amount must be a valid number')
    .bail()
    .custom((value) => value > 0)
    .withMessage('Amount must be greater than zero'),
];

export const validateUserIdParam = [
  param('userId')
    .exists()
    .withMessage('User ID is required')
    .bail()
    .isString()
    .withMessage('Invalid user ID')
    .notEmpty()
    .withMessage('User ID cannot be empty'),
];

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

  query('dateRange')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Date range must be an integer >= 1')
    .toInt(),
];
