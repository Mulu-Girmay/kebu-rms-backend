import { body, param } from 'express-validator';

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
