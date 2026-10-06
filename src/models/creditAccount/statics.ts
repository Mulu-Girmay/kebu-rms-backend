import { creditAccountSchema } from './schema.js';
import type { CreditAccount } from './index.js';

creditAccountSchema.statics.findByUser = async function (
  userId: string
): Promise<CreditAccount | null> {
  return this.findOne({ user: userId });
};

creditAccountSchema.statics.findActiveByUser = async function (
  userId: string
): Promise<CreditAccount | null> {
  return this.findOne({ user: userId, status: 'active' });
};

creditAccountSchema.statics.findOrCreateByUser = async function (
  userId: string
): Promise<CreditAccount> {
  return this.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: {
        user: userId,
        creditLimit: 0,
        usedCredit: 0,
        status: 'active',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};
