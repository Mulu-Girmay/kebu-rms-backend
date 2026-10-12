import { param, body, query } from 'express-validator';
import {
  CREDIT_ACCOUNT_STATUS_VALUES,
  CreditAccountStatus,
} from '../utils/constants.js';
import { validateIdParam } from './user.validator.js';

export const validateUpdateLimit = [
  ...validateIdParam,
  body('creditLimit')
    .exists({ checkNull: true })
    .withMessage('creditLimit is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('creditLimit must be a non-negative number')
    .toFloat(),
];

export const validateAdjustUsercredit = [
  ...validateIdParam,
  body('usedCredit')
    .exists({ checkNull: true })
    .withMessage('usercredit is required')
    .isFloat({ min: 0 })
    .withMessage('usercredit must be a non-negative number')
    .toFloat(),
  body('reason')
    .exists()
    .withMessage('reason is required')
    .isString()
    .withMessage('reason must be string')
    .trim()
    .isLength({ min: 8, max: 500 })
    .withMessage('reason must be between 8 and 500 characters'),
];

export const validateReason = [
  ...validateIdParam,
  body('reason')
    .optional()
    .exists()
    .withMessage('reason is required')
    .isString()
    .withMessage('reason must be string')
    .trim()
    .isLength({ min: 8, max: 500 })
    .withMessage('reason must be between 8 and 500 characters'),
];

export const validateListCreditAccounts = [
  query('status')
    .optional()
    .isIn(CREDIT_ACCOUNT_STATUS_VALUES)
    .withMessage('Invalid status'),
  query('hasUsage')
    .optional()
    .isBoolean()
    .withMessage('hasUsage must be boolean')
    .toBoolean(),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'creditLimit', 'usedCredit'])
    .withMessage('invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];
