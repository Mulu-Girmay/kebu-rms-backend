import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { validateRequest } from '../validators/errors.parser.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getMyCreditAccount,
  listCreditAccounts,
  getUserCreditAccount,
  updateCreditLimit,
  adjustUsedCredit,
  freezCreditAccount,
  activateCreditAccount,
  closeCreditAccount,
} from '../controllers/creditAccount.js';
import {
  validateUpdateLimit,
  validateReason,
  validateListCreditAccounts,
} from '../validators/creditAccount.validator.js';
import { validateIdParam } from '../validators/user.validator.js';

export const creditAccountSelfRouter = Router();

creditAccountSelfRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.READ),
  asyncHandler(getMyCreditAccount)
);

// ---------------- Admin Router ----------------
export const creditAccountAdminRouter = Router();

creditAccountAdminRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.READ),
  validateListCreditAccounts,
  validateRequest,
  asyncHandler(listCreditAccounts)
);

creditAccountAdminRouter.get(
  '/:id',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.READ),
  validateIdParam,
  validateRequest,
  asyncHandler(getUserCreditAccount)
);

creditAccountAdminRouter.patch(
  '/:id/limit',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.UPDATE),
  validateUpdateLimit,
  validateRequest,
  asyncHandler(updateCreditLimit)
);

creditAccountAdminRouter.patch(
  '/:id/used-credit',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.UPDATE),
  validateReason,
  validateRequest,
  asyncHandler(adjustUsedCredit)
);

creditAccountAdminRouter.patch(
  '/:id/freeze',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.UPDATE),
  validateReason,
  validateRequest,
  asyncHandler(freezCreditAccount)
);

creditAccountAdminRouter.patch(
  '/:id/activate',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.UPDATE),
  validateReason,
  validateRequest,
  asyncHandler(activateCreditAccount)
);

creditAccountAdminRouter.patch(
  '/:id/close',
  requireAuth,
  requirePermission(RESOURCES.CREDIT_ACCOUNTS, ACTIONS.UPDATE),
  validateReason,
  validateRequest,
  asyncHandler(closeCreditAccount)
);
