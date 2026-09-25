import type { Response } from 'express';
import { APIError } from '../errors/APIError.js';
import { Wallet } from '../models/wallet/index.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import { WalletTransactionType } from '../utils/constants.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import mongoose from 'mongoose';

export const getWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user!.id;

  const [wallet] = await Promise.all([Wallet.findOrCreateByUser(userId)]);

  res.status(200).json({
    wallet: {
      balance: wallet.balance,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    },
  });
};

export const getUserWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params as { userId: string };

  const wallet = await Wallet.findOne({
    user: userId,
  });

  if (!wallet) {
    throw new APIError('Wallet not found for this user', 404);
  }

  res.status(200).json({
    wallet: {
      id: wallet._id,
      userId: wallet.user,
      balance: wallet.balance,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    },
  });
};

export const getWalletTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const transactions = await WalletTransaction.findByUserId(req.user!.id);

  res.status(200).json({
    transactions,
  });
};

export const topUpWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const { amount } = req.body;

  const session = await mongoose.startSession();
  let wallet;
  let transaction;

  try {
    await session.withTransaction(async () => {
      wallet = await Wallet.findOneAndUpdate(
        { user: userId, isActive: true },
        { $inc: { balance: amount } },
        { new: true, session }
      );

      if (!wallet) {
        const exists = await Wallet.exists({ user: userId }).session(session);
        if (!exists) {
          throw new APIError('Customer wallet not found', 404);
        }
        throw new APIError('Customer wallet is inactive', 400);
      }

      const balanceAfter = wallet.balance;
      const balanceBefore = balanceAfter - amount;

      const [created] = await WalletTransaction.create(
        [
          {
            wallet: wallet._id,
            amount,
            type: WalletTransactionType.CREDIT,
            balanceBefore,
            balanceAfter,
          },
        ],
        { session }
      );

      transaction = created;
    });
  } finally {
    await session.endSession();
  }

  res.status(200).json({
    message: 'Wallet topped up successfully',
    wallet: {
      id: wallet!._id,
      userId: wallet!.user,
      balance: wallet!.balance,
      isActive: wallet!.isActive,
    },
    transaction: {
      id: transaction!._id,
      amount: transaction!.amount,
      type: transaction!.type,
      balanceBefore: transaction!.balanceBefore,
      balanceAfter: transaction!.balanceAfter,
      createdAt: transaction!.createdAt,
    },
  });
};
