import { Router } from 'express';

import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { handleValidationErrors } from '../middlewares/validation.js';

import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import rolesController from '../controllers/roles.js';

import {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRolePermission,
} from '../validators/role.validator.js';

const router = Router();

router.post(
  '/roles',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.CREATE),
  validateCreateRole,
  handleValidationErrors,
  asyncHandler(rolesController.createRole)
);

router.get(
  '/roles',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.READ),
  asyncHandler(rolesController.listRoles)
);

router.get(
  '/roles/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.READ),
  validateRoleId,
  handleValidationErrors,
  asyncHandler(rolesController.getRole)
);

router.patch(
  '/roles/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateUpdateRole,
  handleValidationErrors,
  asyncHandler(rolesController.updateRole)
);

router.delete(
  '/roles/:id',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.DELETE),
  validateRoleId,
  handleValidationErrors,
  asyncHandler(rolesController.deleteRole)
);

router.get(
  '/permissions',
  requireAuth,
  requirePermission(RESOURCES.PERMISSIONS, ACTIONS.READ),
  asyncHandler(rolesController.listPermissions)
);

router.post(
  '/roles/:id/permissions/:permissionId',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateRolePermission,
  handleValidationErrors,
  asyncHandler(rolesController.assignPermission)
);

router.delete(
  '/roles/:id/permissions/:permissionId',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  validateRolePermission,
  handleValidationErrors,
  asyncHandler(rolesController.revokePermission)
);

export default router;
