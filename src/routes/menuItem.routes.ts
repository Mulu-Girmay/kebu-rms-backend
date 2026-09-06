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

const router = Router();

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024,
});

router
  .route('/')
  .post(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.CREATE),
    upload.single('image'),
    validateRequest(createMenuItemSchema, 'body'),
    createMenuItem
  )
  .get(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
    validateRequest(menuItemQuerySchema, 'query'),
    getMenuItems
  );

router.get(
  '/popular',
  requireAuth,
  requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
  getPopularMenuItems
);

router
  .route('/:id')
  .get(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.READ),
    validateRequest(menuItemIdParamSchema, 'params'),
    getMenuItemById
  )
  .put(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
    upload.single('image'),
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(updateMenuItemSchema, 'body'),
    updateMenuItem
  )
  .patch(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
    upload.single('image'),
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(updateMenuItemSchema, 'body'),
    updateMenuItem
  )
  .delete(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.DELETE),
    validateRequest(menuItemIdParamSchema, 'params'),
    deleteMenuItem
  );

router
  .route('/:id/availability')
  .patch(
    requireAuth,
    requirePermission(RESOURCES.MENU_ITEMS, ACTIONS.UPDATE),
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(toggleAvailabilitySchema, 'body'),
    toggleMenuItemAvailability
  );

export default router;
