import type { HydratedDocument } from 'mongoose';
import type { IWallet } from './schema.js';

export interface WalletMethods {
  hasSufficientBalance(amount: number): boolean;
  isActive(): boolean;
  canDebit(amount: number): boolean;
}

export type WalletDocument = HydratedDocument<
  IWallet,
  WalletMethods
>;

export const walletMethods: WalletMethods = {
  hasSufficientBalance(
    this: WalletDocument,
    amount: number,
  ): boolean {
    if (amount < 0) {
      return false;
    }

    return this.balance >= amount;
  },

  isActive(this: WalletDocument): boolean {
    return this.isActive();
  },

  canDebit(
    this: WalletDocument,
    amount: number,
  ): boolean {
    return (
      this.isActive() &&
      amount > 0 &&
      this.balance >= amount
    );
  },
};