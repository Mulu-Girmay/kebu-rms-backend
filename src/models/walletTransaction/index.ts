import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { walletTransactionSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type WalletTransaction = InferSchemaType<typeof walletTransactionSchema>;

export interface WalletTransactionMethods {}

export interface WalletTransactionModel extends Model<
  WalletTransaction,
  {},
  WalletTransactionMethods
> {
  findByUserId(userId: string): Promise<WalletTransaction[]>;
  findByOrderId(orderId: string): Promise<WalletTransaction[]>;
  findAllWithDetails(options: {
    page: number;
    limit: number;
    dateRange?: number;
  }): Promise<{
    transactions: {
      id: unknown;
      date: Date;
      amount: number;
      type: string;
      balanceBefore: number;
      balanceAfter: number;
      user: {
        id: string;
        name: string;
        email: string;
        image: string;
      };
      order: {
        id: unknown;
        orderNumber: string;
        status: string;
        items: unknown[];
        totalAmount: number;
        placedAt: Date;
      } | null;
    }[];
    total: number;
  }>;
}

export const WalletTransaction = mongoose.model<
  WalletTransaction,
  WalletTransactionModel
>(MODEL_NAMES.WALLET_TRANSACTION, walletTransactionSchema);

export { walletTransactionSchema };
