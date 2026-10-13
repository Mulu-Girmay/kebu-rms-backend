import { body, query } from 'express-validator';
import { CREDIT_ACCOUNT_STATUS_VALUES } from '../utils/constants.js';
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

export const validateBatchUpdateLimit = [
  body().custom((_, { req }) => {
    const list = Array.isArray(req.body)
      ? req.body
      : req.body?.updates ||
        req.body?.items ||
        req.body?.accounts ||
        req.body?.data;

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(
        'An array of credit limit updates is required and cannot be empty'
      );
    }

    for (let i = 0; i < list.length; i++) {
      const item = list[i];
      if (!item || typeof item !== 'object') {
        throw new Error(`Item at index ${i} must be an object`);
      }
      const userId = item.userId ?? item.id;
      const creditLimit = item.creditLimit ?? item.limit;

      if (!userId || typeof userId !== 'string' || !userId.trim()) {
        throw new Error(
          `Item at index ${i}: userId is required and must be a non-empty string`
        );
      }

      const num =
        typeof creditLimit === 'number' ? creditLimit : Number(creditLimit);
      if (
        creditLimit === undefined ||
        creditLimit === null ||
        isNaN(num) ||
        num < 0
      ) {
        throw new Error(
          `Item at index ${i}: creditLimit must be a non-negative number`
        );
      }
    }

    return true;
  }),
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
