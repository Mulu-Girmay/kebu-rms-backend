import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { listCategories } from '../controllers/category.js';

const router = Router();

router.get('/', asyncHandler(listCategories));

export default router;
