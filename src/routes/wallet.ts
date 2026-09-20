import express, { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import {
  requirePermission,
  requirePermissions,
} from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  getUserWallet,
  getWallet,
  getWalletTransactions,
  topUpWallet,
} from '../controllers/wallet.js';
import { validateUserIdParam } from '../validators/user.validator.js';
import { validateAmount } from '../validators/wallet.validator.js';
import { handleValidationErrors } from '../middlewares/validation.js';

const router: Router = express.Router();

router.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.READ),
  asyncHandler(getWallet)
);

router.get(
  '/transactions',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READ),
  asyncHandler(getWalletTransactions)
);

router.get(
  '/:userId',
  requireAuth,
  requirePermissions([
    { resource: RESOURCES.WALLETS, action: ACTIONS.READ },
    { resource: RESOURCES.WALLETS, action: ACTIONS.UPDATE },
  ]),
  validateUserIdParam,
  handleValidationErrors,
  asyncHandler(getUserWallet)
);

router.post(
  '/:userId/top-up',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.UPDATE),
  validateUserIdParam,
  validateAmount,
  handleValidationErrors,
  asyncHandler(topUpWallet)
);

export default router;
