import express, { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/authorize.js';
import { RESOURCES, ACTIONS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';

import {
  getUserWallet,
  getWallet,
  topUpWallet,
} from '../controllers/wallet.js';

import {
  validateAmount,
  validateUserIdParam,
} from '../validators/wallet.validator.js';
import { validateRequest } from '../validators/errors.parser.js';

export const walletAdminRouter = Router();
export const walletSelfRouter = Router();

walletSelfRouter.get(
  '/',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.READ),
  asyncHandler(getWallet)
);

walletAdminRouter.get(
  '/:userId',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.READALL),
  validateUserIdParam,
  validateRequest,
  asyncHandler(getUserWallet)
);

walletAdminRouter.post(
  '/:userId/top-up',
  requireAuth,
  requirePermission(RESOURCES.WALLETS, ACTIONS.UPDATE),
  validateUserIdParam,
  validateAmount,
  validateRequest,
  asyncHandler(topUpWallet)
);
