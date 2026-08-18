import { walletTransactionSchema } from './schema.js';
import { Wallet } from '../wallet/index.js';

walletTransactionSchema.statics.findByUserId = async function (
  userId: string,
) {
  const wallet = await Wallet.findOne({
    user: userId,
  });

  if (!wallet) {
    return [];
  }

  return this.find({
    wallet: wallet._id,
  }).sort({ createdAt: -1 });
};

walletTransactionSchema.statics.findByOrderId = async function (
  orderId: string,
) {
  return this.find({
    order: orderId,
  }).sort({ createdAt: -1 });
};