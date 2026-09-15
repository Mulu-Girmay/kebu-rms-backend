import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { walletSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type Wallet = InferSchemaType<typeof walletSchema>;

export interface WalletMethods {
  hasSufficientBalance(amount: number): boolean;
  canDebit(amount: number): boolean;
  getStatus(): boolean;
}

export interface WalletModel extends Model<Wallet, {}, WalletMethods> {
  findByUser(userId: string): Promise<Wallet>;
  findActiveByUser(userId: string): Promise<Wallet>;
}

export const Wallet = mongoose.model<Wallet, WalletModel>(
  MODEL_NAMES.WALLET,
  walletSchema
);
export { walletSchema };
