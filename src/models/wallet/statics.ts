import { walletSchema } from './schema.js';

walletSchema.statics.findByUser = function (userId: string) {
  return this.findOne({
    user: userId,
  });
};

walletSchema.statics.findActiveByUser = function (userId: string) {
  return this.findOne({
    user: userId,
    isActive: true,
  });
};
