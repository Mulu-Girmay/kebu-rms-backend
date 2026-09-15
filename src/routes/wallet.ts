import express, { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  getWallet,
  getWalletTransactions,
  topUpWallet,
} from '../controllers/wallet.js';

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

router.post(
  '/:userId/top-up',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.UPDATE),
  asyncHandler(topUpWallet)
);

export default router;
