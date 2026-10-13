import { body, param, query } from 'express-validator';

export const ratingIdParamSchema = [
  param('id').isMongoId().withMessage('Invalid rating ID format'),
];

export const menuItemIdParamSchema = [
  param('menuItemId').isMongoId().withMessage('Invalid menu item ID format'),
];

export const createRatingSchema = [
  body('orderId').optional().isMongoId().withMessage('Invalid Order ID format'),
  body('menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required')
    .isMongoId()
    .withMessage('Invalid Menu item ID format'),
  body('score')
    .notEmpty()
    .withMessage('Rating score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score must be an integer between 1 and 5')
    .toInt(),
  body('comment').optional().trim().isString(),
];

export const createBatchRatingSchema = [
  body('orderId').optional().isMongoId().withMessage('Invalid Order ID format'),
  body('ratings')
    .isArray({ min: 1 })
    .withMessage(
      'Ratings array is required and must contain at least one item'
    ),
  body('ratings.*.menuItemId')
    .notEmpty()
    .withMessage('Menu item ID is required for each rating')
    .isMongoId()
    .withMessage('Invalid Menu item ID format'),
  body('ratings.*.score')
    .notEmpty()
    .withMessage('Rating score is required for each rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Score must be an integer between 1 and 5')
    .toInt(),
  body('ratings.*.comment').optional().trim().isString(),
];

export const updateRatingSchema = [
  body('score')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Score must be an integer between 1 and 5')
    .toInt(),
  body('comment').optional().trim().isString(),
  body().custom((_, { req }) => {
    const { score, comment } = req.body || {};
    if (score === undefined && comment === undefined) {
      throw new Error('At least one field (score or comment) must be provided');
    }
    return true;
  }),
];

export const ratingQuerySchema = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Order ID format'),
  query('hasComment').optional().isBoolean().toBoolean(),
  // what does  the hascomment hold
  // ?hasComment=false, JavaScript evaluates the string "false" as truthy.
];
