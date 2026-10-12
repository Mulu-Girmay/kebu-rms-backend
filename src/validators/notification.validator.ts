import { param, query } from 'express-validator';
import { NOTIFICATION_TYPE_VALUES } from '../utils/constants.js';

export const validateNotificationId = [
  param('id').isMongoId().withMessage('Invalid notification ID'),
];

export const validateListQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be an integer between 1 and 100')
    .toInt(),
  query('nextCursor')
    .optional()
    .isString()
    .trim()
    .withMessage('nextCursor must be a valid string identifier'),
  query('isRead')
    .optional()
    .isBoolean()
    .withMessage('isRead must be a boolean'),
  query('type')
    .optional()
    .isIn(NOTIFICATION_TYPE_VALUES)
    .withMessage('Invalid notification type'),
];
