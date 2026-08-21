import { notificationSchema } from './schema.js';

notificationSchema.statics.findByUserId = async function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

notificationSchema.statics.findUnreadByUserId = async function (
  userId: string
) {
  return this.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

notificationSchema.statics.markAllAsReadForUser = async function (
  userId: string
) {
  return this.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
};
