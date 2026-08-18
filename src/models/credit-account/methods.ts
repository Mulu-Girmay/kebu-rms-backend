import { type HydratedDocument } from 'mongoose';
import type { ICreditAccount } from './schema.js';



export interface CreditAccountMethods {
  getAvailableCredit(): number;
  hasAvailableCredit(amount: number): boolean;
  isActive(): boolean;
}

export type CreditAccountDocument =
  HydratedDocument<ICreditAccount, CreditAccountMethods>;

export const creditAccountMethods: CreditAccountMethods = {
  getAvailableCredit(this: CreditAccountDocument): number {
    return Math.max(this.creditLimit - this.usedCredit, 0);
  },

  hasAvailableCredit(
    this: CreditAccountDocument,
    amount: number,
  ): boolean {
    if (amount < 0) {
      return false;
    }

    return (
      this.status === 'active' &&
      this.usedCredit + amount <= this.creditLimit
    );
  },

  isActive(this: CreditAccountDocument): boolean {
    return this.status === 'active';
  },
};