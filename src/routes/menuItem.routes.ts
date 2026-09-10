import { Router } from 'express';
import {
  createMenuItem,
  getMenuItems,
  getPopularMenuItems,
  getMenuItemById,
  updateMenuItem,
  toggleMenuItemAvailability,
  deleteMenuItem,
} from '../controllers/menuItem.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { createUploadMiddleware } from '../middlewares/upload.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  menuItemIdParamSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  toggleAvailabilitySchema,
  menuItemQuerySchema,
} from '../validators/menuItem.validator.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024,
});

router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.CREATE),
  upload.single('image'),
  validateRequest(createMenuItemSchema),
  asyncHandler(createMenuItem)
);

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
  validateRequest(menuItemQuerySchema),
  asyncHandler(getMenuItems)
);

router.get(
  '/popular',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
  asyncHandler(getPopularMenuItems)
);

router.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
  validateRequest(menuItemIdParamSchema),
  asyncHandler(getMenuItemById)
);

router.put(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
  upload.single('image'),
  validateRequest(menuItemIdParamSchema),
  validateRequest(updateMenuItemSchema),
  asyncHandler(updateMenuItem)
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
  upload.single('image'),
  validateRequest(menuItemIdParamSchema),
  validateRequest(updateMenuItemSchema),
  asyncHandler(updateMenuItem)
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.DELETE),
  validateRequest(menuItemIdParamSchema),
  asyncHandler(deleteMenuItem)
);

router.patch(
  '/:id/availability',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
  validateRequest(menuItemIdParamSchema),
  validateRequest(toggleAvailabilitySchema),
  asyncHandler(toggleMenuItemAvailability)
);

export default router;
