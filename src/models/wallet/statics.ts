import type { Wallet } from './index.js';
import { walletSchema } from './schema.js';

walletSchema.statics.findByUser = async function (userId: string): Promise<Wallet> {
  return this.findOne({
    user: userId,
  });
};

walletSchema.statics.findActiveByUser = async function (userId: string):Promise<Wallet> {
  return this.findOne({
    user: userId,
    isActive: true,
  });
};
