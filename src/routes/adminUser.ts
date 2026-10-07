import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listUsers,
  getUser,
  deleteUser,
  activateUser,
  deactivateUser,
  suspendUser,
  updateRole,
  createStaffaccount,
} from '../controllers/adminUser.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { ACTIONS, RESOURCES } from '../utils/constants.js';
import {
  validateIdParam,
  updateroleValidator,
  validateUsersQuery,
  createUserValidator,
} from '../validators/user.validator.js';
import { validateRequest } from '../validators/errors.parser.js';
import { createUploadMiddleware } from '../middlewares/upload.js';

const upload = createUploadMiddleware({
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

const router = Router();

/** User management */
router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.READ),
  ...validateUsersQuery,
  validateRequest,
  asyncHandler(listUsers)
);
router.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.READ),
  ...validateIdParam,
  validateRequest,
  asyncHandler(getUser)
);
router.delete(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.DELETE),
  ...validateIdParam,
  validateRequest,
  asyncHandler(deleteUser)
);

router.post(
  '/',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.CREATE),
  createUserValidator,
  validateRequest,
  asyncHandler(createStaffaccount)
);
/** Account state management */
router.patch(
  '/:id/activate',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE),
  ...validateIdParam,
  validateRequest,
  asyncHandler(activateUser)
);
router.patch(
  '/:id/deactivate',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE),
  ...validateIdParam,
  validateRequest,
  asyncHandler(deactivateUser)
);
router.patch(
  '/:id/suspend',
  requireAuth,
  requirePermission(RESOURCES.USERS, ACTIONS.UPDATE),
  ...validateIdParam,
  validateRequest,
  asyncHandler(suspendUser)
);

/** Role management */
router.patch(
  '/:id/role',
  requireAuth,
  requirePermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  ...validateIdParam,
  ...updateroleValidator,
  validateRequest,
  asyncHandler(updateRole)
);

export default router;
