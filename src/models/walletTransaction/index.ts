import mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { walletTransactionSchema } from './schema.js';
import './methods.js';
import './statics.js';

export type WalletTransaction = InferSchemaType<typeof walletTransactionSchema>;

export const WalletTransaction = mongoose.model<WalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema,
);

export { walletTransactionSchema };
