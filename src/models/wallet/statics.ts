import type { Model } from 'mongoose';
import type { IWallet } from './schema.js';

export interface WalletModel extends Model<IWallet> {
  findByUser(userId: string): ReturnType<Model<IWallet>['findOne']>;
  findActiveByUser(userId: string): ReturnType<Model<IWallet>['findOne']>;
}

export const walletStatics = {
  findByUser(this: WalletModel, userId: string) {
    return this.findOne({
      user: userId,
    });
  },

  findActiveByUser(this: WalletModel, userId: string) {
    return this.findOne({
      user: userId,
      isActive: true,
    });
  },
};