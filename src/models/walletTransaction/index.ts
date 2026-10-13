import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { walletTransactionSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';
import type {
  WalletTransactionQueryOptions,
  WalletTransactionResult,
} from '../../types/types.js';

export type WalletTransaction = InferSchemaType<typeof walletTransactionSchema>;

export interface WalletTransactionMethods {}

export interface WalletTransactionModel extends Model<
  WalletTransaction,
  {},
  WalletTransactionMethods
> {
  findByUserId(userId: string): Promise<WalletTransaction[]>;
  findByOrderId(orderId: string): Promise<WalletTransaction[]>;
  findAllWithDetails(options: WalletTransactionQueryOptions): Promise<{
    transactions: WalletTransactionResult[];
    total: number;
    stats: {
      totalAmount: number;
      successfulDepositsCount: number;
      pendingCount: number;
    };
  }>;
}

export const WalletTransaction = mongoose.model<
  WalletTransaction,
  WalletTransactionModel
>(MODEL_NAMES.WALLET_TRANSACTION, walletTransactionSchema);

export { walletTransactionSchema };
