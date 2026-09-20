import { param } from 'express-validator';

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
