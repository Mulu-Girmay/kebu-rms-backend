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
import { createUploadMiddleware } from '../middlewares/upload.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '../validators/category.validator.js';

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
    validateRequest(createCategorySchema, 'body'),
    createCategory
  )
  .get(validateRequest(categoryQuerySchema, 'query'), getCategories);

router
  .route('/:id')
  .get(validateRequest(categoryIdParamSchema, 'params'), getCategoryById)
  .put(
    requireAuth,
    upload.single('image'),
    validateRequest(categoryIdParamSchema, 'params'),
    validateRequest(updateCategorySchema, 'body'),
    updateCategory
  )
  .patch(
    requireAuth,
    upload.single('image'),
    validateRequest(categoryIdParamSchema, 'params'),
    validateRequest(updateCategorySchema, 'body'),
    updateCategory
  )
  .delete(
    requireAuth,
    validateRequest(categoryIdParamSchema, 'params'),
    deleteCategory
  );

router
  .route('/:id/menu-items')
  .get(validateRequest(categoryIdParamSchema, 'params'), getCategoryMenuItems);

export default router;
