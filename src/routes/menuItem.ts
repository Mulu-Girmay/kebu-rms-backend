import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../validators/errors.parser.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listMenuItems,
  getPopularItems,
  getMenuItem,
} from '../controllers/menuItem.js';
import { param } from 'express-validator';
import {
  validateGetPopularItems,
  validateListMenuItems,
  validateMenuItemId,
} from '../validators/menu.validator.js';

const router = Router();

router.get(
  '/',
  ...validateListMenuItems,
  validateRequest,
  asyncHandler(listMenuItems)
);
router.get(
  '/popular',
  validateGetPopularItems,
  validateRequest,
  asyncHandler(getPopularItems)
);
router.get(
  '/:id',
  validateMenuItemId,
  validateRequest,
  asyncHandler(getMenuItem)
);

export default router;
