import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { dashboardStatsQuerySchema } from '../validators/dashboard.validator.js';
import { validateRequest } from '../validators/errors.parser.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/stats',
  requireAuth,
  dashboardStatsQuerySchema,
  validateRequest,
  asyncHandler(getDashboardStats)
);

export default router;
