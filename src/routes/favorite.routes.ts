import { Router } from 'express';
import {
  toggleFavorite,
  getUserFavorites,
} from '../controllers/favorite.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  toggleFavoriteParamSchema,
  favoriteQuerySchema,
} from '../validators/favorite.validator.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post(
  '/:menuItemId/toggle',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ), //permission should be UPDATE and PATCH
  validateRequest(toggleFavoriteParamSchema),
  asyncHandler(toggleFavorite)
);

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
  validateRequest(favoriteQuerySchema),
  asyncHandler(getUserFavorites)
);

export default router;
