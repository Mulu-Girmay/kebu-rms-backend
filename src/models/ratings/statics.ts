import { ratingSchema } from './schema.js';

ratingSchema.statics.findByMenuItemId = async function (menuItemId: string) {
  return this.find({ menuItemId });
};

ratingSchema.statics.findByUserId = async function (userId: string) {
  return this.find({ userId });
};

ratingSchema.statics.findByOrderId = async function (orderId: string) {
  return this.find({ orderId });
};
