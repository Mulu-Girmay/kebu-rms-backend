import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { walletSchema } from './schema.js';
import './methods.js';
import './statics.js';

export type Wallet = InferSchemaType<typeof walletSchema>;

export interface WalletModel extends Model<Wallet> {
  findByUser(userId: string): ReturnType<Model<Wallet>['findOne']>;
  findActiveByUser(userId: string): ReturnType<Model<Wallet>['findOne']>;
}

export const Wallet = mongoose.model<Wallet, WalletModel>(
  'Wallet',
  walletSchema,
);
export { walletSchema };
