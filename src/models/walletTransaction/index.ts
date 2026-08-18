import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { walletTransactionSchema } from './schema.js';
import './methods.js';
import './statics.js';

export type WalletTransaction = InferSchemaType<
  typeof walletTransactionSchema
>;

export interface WalletTransactionMethods {}

export interface WalletTransactionModel
  extends Model<WalletTransaction, {}, WalletTransactionMethods> {
  findByUserId(userId: string): Promise<WalletTransaction[]>;
  findByOrderId(orderId: string): Promise<WalletTransaction[]>;
}

export const WalletTransaction = mongoose.model<
  WalletTransaction,
  WalletTransactionModel
>(
  'WalletTransaction',
  walletTransactionSchema,
);

export { walletTransactionSchema };