import { body, param, query } from 'express-validator';
import { ORDER_STATUS_VALUES } from '../utils/constants.js';

export const orderIdParamSchema = [
  param('id').isMongoId().withMessage('Invalid order ID format'),
];

export const createOrderSchema = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid Menu item ID format'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ gt: 0 })
    .withMessage('Quantity must be a positive number')
    .toFloat(),
  body('items.*.notes')
    .optional()
    .trim()
    .isString()
    .withMessage('Item notes must be a string'),
  body('items.*.customizations')
    .optional()
    .isArray()
    .withMessage('Customizations must be an array of strings'),
  body('items.*.customizations.*')
    .optional()
    .trim()
    .isString()
    .withMessage('Each customization must be a string'),
  body('customerNotes').optional().trim().isString(),
];

export const orderQuerySchema = [
  query('filter')
    .optional()
    .isIn(['active', 'history'])
    .withMessage('Filter must be either "active" or "history"'),
  query('status')
    .optional()
    .isIn(ORDER_STATUS_VALUES)
    .withMessage('Invalid order status'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortBy')
    .optional()
    .isIn(['placedAt', 'createdAt', 'totalAmount', 'status'])
    .withMessage('Invalid sortBy field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Invalid sortOrder value'),
];

export const cancelOrderSchema = [
  body('rejectionReason').optional().trim().isString(),
];

export const favoriteOrderSchema = [
  body('favoriteLabel').optional().trim().isString(),
];

export const updateOrderStatusSchema = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(ORDER_STATUS_VALUES)
    .withMessage(`Status must be one of: ${ORDER_STATUS_VALUES.join(', ')}`),
  body('rejectionReason')
    .optional()
    .trim()
    .isString()
    .withMessage('Rejection reason must be a string'),
];

export const pauseOrdersSchema = [
  body('isOrdersPaused')
    .notEmpty()
    .withMessage('isOrdersPaused is required')
    .isBoolean()
    .withMessage('isOrdersPaused must be a boolean'),
  body('pauseReason')
    .optional()
    .trim()
    .isString()
    .withMessage('pauseReason must be a string'),
];

export const kitchenOrderQuerySchema = [
  query('status')
    .optional()
    .isIn(ORDER_STATUS_VALUES)
    .withMessage('Invalid order status'),
  query('stage')
    .optional()
    .isIn(['pending', 'preparing', 'ready', 'all'])
    .withMessage('Stage must be "pending", "preparing", "ready", or "all"'),
];
