import { Router } from 'express';

import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import rolesController from '../controllers/roles.js';

import {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRolePermission,
} from '../validators/role.validator.js';
import { validateRequest } from '../validators/errors.parser.js';

const router = Router();
router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.CREATE),
  validateCreateRole,
  validateRequest,
  asyncHandler(rolesController.createRole)
);

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.READ),
  asyncHandler(rolesController.listRoles)
);

router.get(
  '/permissions',
  requireAuth,
  requirePermission(RESOURCES.PERMISSIONS, ACTIONS.READ),
  asyncHandler(rolesController.listPermissions)
);

router.delete(
  '/:id/permissions/:permissionId',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateRolePermission,
  validateRequest,
  asyncHandler(rolesController.revokePermission)
);

router.post(
  '/:id/permissions/:permissionId',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateRolePermission,
  validateRequest,
  asyncHandler(rolesController.assignPermission)
);

router.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.READ),
  validateRoleId,
  validateRequest,
  asyncHandler(rolesController.getRole)
);

router.patch(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateUpdateRole,
  validateRequest,
  asyncHandler(rolesController.updateRole)
);

router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.DELETE),
  validateRoleId,
  validateRequest,
  asyncHandler(rolesController.deleteRole)
);

export default router;
