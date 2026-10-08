import type { Response } from 'express';
import { APIError } from '../errors/APIError.js';
import { Wallet } from '../models/wallet/index.js';

import { AuditAction, MODEL_NAMES } from '../utils/constants.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import mongoose from 'mongoose';
import { PaymentService } from '../services/payment.js';
import { Audit } from '../models/audits/index.js';

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

export const topUpWallet = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params as { userId: string };
  const { amount } = req.body;

  const session = await mongoose.startSession();
  let result;
  console.log('fREAXCH HERE');
  try {
    await session.withTransaction(async () => {
      result = await PaymentService.topUp(userId, amount, session);
      await Audit.create(
        [
          {
            userId: req.user!.id,
            action: AuditAction.UPDATE,
            tableName: MODEL_NAMES.WALLET,
            recordId: userId,
            meta: {
              action: 'top_up_with_credit_repayment',
              amount,
              creditRepaid: result.creditRepaid,
              walletCredited: result.walletCredited,
              walletBalanceAfter: result.walletBalanceAfter,
              creditUsedAfter: result.creditUsedAfter,
            },
          },
        ],
        { session }
      );
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
  console.log('fREfH HERE');
  console.log('fREvHERE');

  res.status(200).json({
    success: true,
    message:
      result!.creditRepaid > 0
        ? `Wallet topped up. ${result!.creditRepaid} applied to outstanding credit.`
        : 'Wallet topped up successfully',
    data: result,
  });
};
