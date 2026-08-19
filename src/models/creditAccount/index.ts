import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { creditAccountSchema } from './schema.js';
import './methods.js';

export type CreditAccount = InferSchemaType<typeof creditAccountSchema>;

export interface CreditAccountMethods {
  getAvailableCredit(): number;
  hasAvailableCredit(amount: number): boolean;
}

export interface CreditAccountModel extends Model<
  CreditAccount,
  {},
  CreditAccountMethods
> {}

export const CreditAccount = mongoose.model<CreditAccount, CreditAccountModel>(
  'CreditAccount',
  creditAccountSchema
);

export { creditAccountSchema };
