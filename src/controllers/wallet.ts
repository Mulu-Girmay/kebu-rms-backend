import type { Response } from 'express';
import { APIError } from '../errors/APIError.js';
import { Wallet } from '../models/wallet/index.js';

import { AuditAction, MODEL_NAMES } from '../utils/constants.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import mongoose from 'mongoose';
import { PaymentService } from '../services/payment.js';
import { Audit } from '../models/audits/index.js';
import { NotificationService } from '../services/notification.js';
import { NotificationTemplates } from '../utils/templates/notification.templates.js';
import logger from '../config/winston.js';

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
  if (req.user!.role!.name === 'customer')
    throw new APIError(
      'Forbidden:You do not have permission to access this resource ',
      403
    );

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
  try {
    await NotificationService.notifyUser({
      userId,
      ...NotificationTemplates.walletTopUp(
        amount,
        result!.walletCredited,
        result!.creditRepaid
      ),
    });
  } catch (error) {
    logger.warn(`Failed to notify user ${userId} about wallet top-up`, error);
  }

  res.status(200).json({
    success: true,
    message:
      result!.creditRepaid > 0
        ? `Wallet topped up. ${result!.creditRepaid} applied to outstanding credit.`
        : 'Wallet topped up successfully',
    data: result,
  });
};
