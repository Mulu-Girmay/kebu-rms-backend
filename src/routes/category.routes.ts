import { Router } from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  getCategoryMenuItems,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { createUploadMiddleware } from '../middlewares/upload.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../validators/category.validator.js';
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
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.CREATE),
    upload.single('image'),
    validateRequest(createCategorySchema, 'body'),
    createCategory
  )
  .get(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
    validateRequest(categoryQuerySchema, 'query'),
    getCategories
  );

router
  .route('/:id')
  .get(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
    validateRequest(categoryIdParamSchema, 'params'),
    getCategoryById
  )
  .put(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.UPDATE),
    upload.single('image'),
    validateRequest(categoryIdParamSchema, 'params'),
    validateRequest(updateCategorySchema, 'body'),
    updateCategory
  )
  .patch(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.UPDATE),
    upload.single('image'),
    validateRequest(categoryIdParamSchema, 'params'),
    validateRequest(updateCategorySchema, 'body'),
    updateCategory
  )
  .delete(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.DELETE),
    validateRequest(categoryIdParamSchema, 'params'),
    deleteCategory
  );

router
  .route('/:id/menu-items')
  .get(
    requireAuth,
    requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
    validateRequest(categoryIdParamSchema, 'params'),
    getCategoryMenuItems
  );

export default router;
