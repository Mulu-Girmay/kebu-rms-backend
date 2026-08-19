import { notificationSchema } from './schema.js';

notificationSchema.methods.markAsRead = async function () {
  this.isRead = true;
  return this.save();
};
