import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { WalletTransaction } from '../models/walletTransaction/index.js';
import type { Response } from 'express';
import type {
  WalletTransactionDateRange,
  WalletTransactionSortBy,
  WalletTransactionType,
} from '../types/types.js';
import { APIError } from '../errors/APIError.js';

export const getUserWalletTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { userId } = req.params as { userId: string };
  if (req.user!.role!.name === 'customer')
    throw new APIError(
      'Forbidden:You do not have permission to access this resource ',
      403
    );
  const {
    page = 1,
    limit = 10,
    type = 'all',
    dateRange = 'all',
  } = req.query as {
    page?: number;
    limit?: number;
    type?: WalletTransactionType;
    dateRange?: WalletTransactionDateRange;
  };

  const { transactions, total, stats } =
    await WalletTransaction.findAllWithDetails({
      page,
      limit,
      userId,
      ...(type !== undefined && { type }),
      ...(dateRange !== undefined && { dateRange }),
    });

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    stats,
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

export const getAllWalletTransactions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user!.role!.name === 'customer')
    throw new APIError(
      'Forbidden:You do not have permission to access this resource ',
      403
    );

  const {
    search,
    type,
    dateRange = 'all',
    startDate,
    endDate,
    userId,
    sortBy = 'date',
    sortOrder = 'desc',
  } = req.query as {
    search?: string;
    type?: WalletTransactionType;
    dateRange?: WalletTransactionDateRange;
    startDate?: string;
    endDate?: string;
    userId?: string;
    sortBy?: WalletTransactionSortBy;
    sortOrder?: 'asc' | 'desc';
  };

  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  const { transactions, total, stats } =
    await WalletTransaction.findAllWithDetails({
      page,
      limit,
      ...(search !== undefined && { search }),
      ...(type !== undefined && { type }),
      ...(dateRange !== undefined && { dateRange }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(userId !== undefined && { userId }),
      ...(sortBy !== undefined && { sortBy }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

  const totalPages = Math.ceil(total / limit) || 1;

  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    stats,
  });
};
