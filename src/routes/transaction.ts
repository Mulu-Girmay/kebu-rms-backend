import {
  getAllWalletTransactions,
  getUserWalletTransactions,
  getWalletTransactions,
} from '../controllers/walletTransaction.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ACTIONS, RESOURCES } from '../utils/constants.js';
import { validateRequest } from '../validators/errors.parser.js';
import { validateWalletTransactionsQuery } from '../validators/transaction.validator.js';
import { validateUserIdParam } from '../validators/wallet.validator.js';
import { Router } from 'express';

export const transactionAdminRouter = Router();
export const transactionSelfRouter = Router();

transactionSelfRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READ),
  asyncHandler(getWalletTransactions)
);

transactionAdminRouter.get(
  '/:userId/transactions',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READ),
  ...validateUserIdParam,
  ...validateWalletTransactionsQuery,
  validateRequest,
  asyncHandler(getUserWalletTransactions)
);

transactionAdminRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READ),
  ...validateWalletTransactionsQuery,
  validateRequest,
  asyncHandler(getAllWalletTransactions)
);
