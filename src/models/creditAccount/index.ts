import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { creditAccountSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type CreditAccount = InferSchemaType<typeof creditAccountSchema>;

export interface CreditAccountMethods {
  getAvailableCredit(): number;
  hasAvailableCredit(amount: number): boolean;
}

export interface CreditAccountModel extends Model<
  CreditAccount,
  {},
  CreditAccountMethods
> {
  findByUser(userId: string): Promise<CreditAccount | null>;
  findActiveByUser(userId: string): Promise<CreditAccount | null>;
  findOrCreateByUser(userId: string): Promise<CreditAccount>;
}

export const CreditAccount = mongoose.model<CreditAccount, CreditAccountModel>(
  MODEL_NAMES.CREDIT_ACCOUNT,
  creditAccountSchema
);

export { creditAccountSchema };
