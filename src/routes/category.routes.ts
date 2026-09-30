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
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFileSize: 5 * 1024 * 1024,
});

router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.CREATE),
  upload.single('image'),
  createCategorySchema,
  validateRequest,
  asyncHandler(createCategory)
);

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  categoryQuerySchema,
  validateRequest,
  asyncHandler(getCategories)
);

router.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  categoryIdParamSchema,
  validateRequest,
  asyncHandler(getCategoryById)
);

router.put(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.UPDATE),
  upload.single('image'),
  categoryIdParamSchema,
  updateCategorySchema,
  validateRequest,
  asyncHandler(updateCategory)
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.UPDATE),
  upload.single('image'),
  categoryIdParamSchema,
  updateCategorySchema,
  validateRequest,
  asyncHandler(updateCategory)
);
// Duplicate Both PUT and PATCH call the same handler, but:
// PUT = full replacement (should validate all required fields)
// PATCH = partial update (should allow partial fields)
router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.DELETE),
  categoryIdParamSchema,
  validateRequest,
  asyncHandler(deleteCategory)
);

router.get(
  '/:id/menu-items',
  requireAuth,
  requirePermission(RESOURCES.CATEGORIES, ACTIONS.READ),
  categoryIdParamSchema,
  validateRequest,
  asyncHandler(getCategoryMenuItems)
);

export default router;
