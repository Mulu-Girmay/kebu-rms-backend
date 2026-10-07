import {
  getAllWalletTransactions,
  getWalletTransactions,
} from '../controllers/wallet.js';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ACTIONS, RESOURCES } from '../utils/constants.js';
import { validateRequest } from '../validators/errors.parser.js';
import { validateWalletTransactionsQuery } from '../validators/wallet.validator.js';
import { Router } from 'express';

export const transactionAdminRouter = Router();
export const transactionSelfRouter = Router();

transactionAdminRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READ),
  asyncHandler(getWalletTransactions)
);

transactionSelfRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLET_TRANSACTIONS, ACTIONS.READALL),
  ...validateWalletTransactionsQuery,
  validateRequest,
  asyncHandler(getAllWalletTransactions)
);
