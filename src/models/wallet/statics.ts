import type { Wallet } from './index.js';
import { walletSchema } from './schema.js';

walletSchema.statics.findByUser = async function (
  userId: string
): Promise<Wallet> {
  return this.findOne({
    user: userId,
  });
};

walletSchema.statics.findActiveByUser = async function (
  userId: string
): Promise<Wallet> {
  return this.findOne({
    user: userId,
    isActive: true,
  });
};

walletSchema.statics.findOrCreateByUser = async function (
  userId: string
): Promise<Wallet> {
  return this.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, balance: 0, isActive: true } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};
