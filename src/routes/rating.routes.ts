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
  validateRequest(createRatingSchema),
  asyncHandler(createRating)
);

router.post(
  '/batch',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.CREATE),
  validateRequest(createBatchRatingSchema),
  asyncHandler(createBatchRatings)
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.UPDATE),
  validateRequest(ratingIdParamSchema),
  validateRequest(updateRatingSchema),
  asyncHandler(updateRating)
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.DELETE),
  validateRequest(ratingIdParamSchema),
  asyncHandler(deleteRating)
);

router.get(
  '/menu-item/:menuItemId',
  requireAuth,
  requirePermission(RESOURCES.RATINGS, ACTIONS.READ),
  validateRequest(menuItemIdParamSchema),
  validateRequest(ratingQuerySchema),
  asyncHandler(getMenuItemRatings)
);

export default router;
