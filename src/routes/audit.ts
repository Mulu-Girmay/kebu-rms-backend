import { Router } from 'express';
import {
  exportAudits,
  getAllAudits,
  getAuditById,
  getAuditStats,
  getMyAudits,
} from '../controllers/audit.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ACTIONS, RESOURCES } from '../utils/constants.js';
import { validateRequest } from '../validators/errors.parser.js';
import {
  validateAuditIdParam,
  validateAuditQuery,
} from '../validators/audit.validator.js';

export const auditAdminRouter = Router();

auditAdminRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.AUDITS, ACTIONS.READ),
  ...validateAuditQuery,
  validateRequest,
  asyncHandler(getAllAudits)
);

auditAdminRouter.get(
  '/export',
  requireAuth,
  requirePermission(RESOURCES.AUDITS, ACTIONS.READ),
  ...validateAuditQuery,
  validateRequest,
  asyncHandler(exportAudits)
);

auditAdminRouter.get(
  '/stats',
  requireAuth,
  requirePermission(RESOURCES.AUDITS, ACTIONS.READ),
  ...validateAuditQuery,
  validateRequest,
  asyncHandler(getAuditStats)
);

auditAdminRouter.get(
  '/me',
  requireAuth,
  requirePermission(RESOURCES.AUDITS, ACTIONS.READ),
  ...validateAuditQuery,
  validateRequest,
  asyncHandler(getMyAudits)
);

auditAdminRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.AUDITS, ACTIONS.READ),
  ...validateAuditIdParam,
  validateRequest,
  asyncHandler(getAuditById)
);
