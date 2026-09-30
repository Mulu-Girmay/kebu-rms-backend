import { body, param, query } from 'express-validator';

const SORT_FIELDS = ['price', 'name', 'favoriteCount', 'createdAt'] as const;
const SORT_ORDERS = ['asc', 'desc'] as const;

const isBase64 = (value: string): boolean => {
  try {
    return Buffer.from(value, 'base64').toString('base64') === value;
  } catch {
    return false;
  }
};

export const validateListMenuItems = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),

  query('cursor')
    .optional()
    .isString()
    .custom(isBase64)
    .withMessage('cursor must be a valid base64 string'),

  query('category')
    .optional()
    .isMongoId()
    .withMessage('category must be a valid ID'),

  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('search must be 1-100 characters'),

  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number')
    .toFloat(),

  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number')
    .toFloat()
    .custom((maxPrice, { req }) => {
      const minPrice = req.query?.minPrice;
      if (minPrice && Number(maxPrice) < Number(minPrice)) {
        throw new Error('maxPrice must be greater than or equal to minPrice');
      }
      return true;
    }),

  query('sortBy')
    .optional()
    .isIn(SORT_FIELDS as unknown as string[])
    .withMessage(`sortBy must be one of: ${SORT_FIELDS.join(', ')}`),

  query('order')
    .optional()
    .isIn(SORT_ORDERS as unknown as string[])
    .withMessage(`order must be one of: ${SORT_ORDERS.join(', ')}`),
];

export const validateGetPopularItems = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('limit must be between 1 and 50')
    .toInt(),
];

export const validateMenuItemId = [
  param('id').isMongoId().withMessage('id must be a valid menu item ID'),
];
