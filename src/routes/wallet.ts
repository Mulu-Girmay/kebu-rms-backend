import express, { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  getAllWalletTransactions,
  getUserWallet,
  getWallet,
  getWalletTransactions,
  topUpWallet,
} from '../controllers/wallet.js';

import {
  validateAmount,
  validateUserIdParam,
  validateWalletTransactionsQuery,
} from '../validators/wallet.validator.js';
import { validateRequest } from '../validators/errors.parser.js';

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
  '/transactions/all',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READALL),
  ...validateWalletTransactionsQuery,
  validateRequest,
  asyncHandler(getAllWalletTransactions)
);

router.get(
  '/:userId',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.READALL),
  validateUserIdParam,
  validateRequest,
  asyncHandler(getUserWallet)
);

router.post(
  '/:userId/top-up',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.UPDATE),
  validateUserIdParam,
  validateAmount,
  validateRequest,
  asyncHandler(topUpWallet)
);

export default router;
