import type { Response } from 'express';
import { APIError } from '../errors/APIError.js';
import { Wallet } from '../models/wallet/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { CreditAccount } from '../models/creditAccount/index.js';
import { WalletTransactionType } from '../utils/constants.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';

export const getWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new APIError('Unauthorized: Authentication required', 401);
  }

  const userId = req.user.id;

  const [wallet, creditAccount] = await Promise.all([
    Wallet.findByUser(userId),
    CreditAccount.findOne({ user: userId }),
  ]);

  if (!wallet) {
    throw new APIError('Wallet not found', 404);
  }

  res.status(200).json({
    wallet: {
      balance: wallet.balance,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    },
    credit: creditAccount
      ? {
          id: creditAccount._id,
          creditLimit: creditAccount.creditLimit,
          usedCredit: creditAccount.usedCredit,
          availableCredit: creditAccount.getAvailableCredit(),
          status: creditAccount.status,
        }
      : null,
  });
};

export const getWalletTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new APIError('Unauthorized: Authentication required', 401);
  }

  const transactions = await WalletTransaction.findByUserId(req.user.id);

  res.status(200).json({
    transactions,
  });
};

export const topUpWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new APIError('Unauthorized: Authentication required', 401);
  }

  const { userId } = req.params;
  const { amount } = req.body;

  if (!userId) {
    throw new APIError('Customer user ID is required', 400);
  }

  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    throw new APIError('Amount must be a valid number', 400);
  }

  if (amount <= 0) {
    throw new APIError('Amount must be greater than zero', 400);
  }

  const wallet = await Wallet.findOne({
    user: userId,
  });

  if (!wallet) {
    throw new APIError('Customer wallet not found', 404);
  }

  if (!wallet.isActive) {
    throw new APIError('Customer wallet is inactive', 400);
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  wallet.balance = balanceAfter;

  await wallet.save();

  const transaction = await WalletTransaction.create({
    wallet: wallet._id,
    amount,
    type: WalletTransactionType.CREDIT,
    balanceBefore,
    balanceAfter,
  });

  res.status(200).json({
    message: 'Wallet topped up successfully',
    wallet: {
      id: wallet._id,
      userId: wallet.user,
      balance: wallet.balance,
      isActive: wallet.isActive,
    },
    transaction: {
      id: transaction._id,
      amount: transaction.amount,
      type: transaction.type,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      createdAt: transaction.createdAt,
    },
  });
};
