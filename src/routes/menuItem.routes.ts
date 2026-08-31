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
import { createUploadMiddleware } from '../middlewares/upload.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  menuItemIdParamSchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  toggleAvailabilitySchema,
  menuItemQuerySchema,
} from '../validators/menuItem.validator.js';

const router = Router();

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024,
});

router
  .route('/')
  .post(
    requireAuth,
    upload.single('image'),
    validateRequest(createMenuItemSchema, 'body'),
    createMenuItem
  )
  .get(validateRequest(menuItemQuerySchema, 'query'), getMenuItems);

router.get('/popular', getPopularMenuItems);

router
  .route('/:id')
  .get(validateRequest(menuItemIdParamSchema, 'params'), getMenuItemById)
  .put(
    requireAuth,
    upload.single('image'),
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(updateMenuItemSchema, 'body'),
    updateMenuItem
  )
  .patch(
    requireAuth,
    upload.single('image'),
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(updateMenuItemSchema, 'body'),
    updateMenuItem
  )
  .delete(
    requireAuth,
    validateRequest(menuItemIdParamSchema, 'params'),
    deleteMenuItem
  );

router
  .route('/:id/availability')
  .patch(
    requireAuth,
    validateRequest(menuItemIdParamSchema, 'params'),
    validateRequest(toggleAvailabilitySchema, 'body'),
    toggleMenuItemAvailability
  );

export default router;
