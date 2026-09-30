import { Router } from 'express';
import {
  createRating,
  createBatchRatings,
  updateRating,
  deleteRating,
  getMenuItemRatings,
} from '../controllers/rating.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  createRatingSchema,
  createBatchRatingSchema,
  updateRatingSchema,
  ratingIdParamSchema,
  menuItemIdParamSchema,
  ratingQuerySchema,
} from '../validators/rating.validator.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.CREATE),
  createRatingSchema,
  validateRequest,
  asyncHandler(createRating)
);

router.post(
  '/batch',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.CREATE),
  createBatchRatingSchema,
  validateRequest,
  asyncHandler(createBatchRatings)
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.UPDATE),
  ratingIdParamSchema,
  updateRatingSchema,
  validateRequest,
  asyncHandler(updateRating)
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.DELETE),
  ratingIdParamSchema,
  validateRequest,
  asyncHandler(deleteRating)
);

router.get(
  '/menu-item/:menuItemId',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.READ),
  menuItemIdParamSchema,
  ratingQuerySchema,
  validateRequest,
  asyncHandler(getMenuItemRatings)
);

export default router;
