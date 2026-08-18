import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { notificationSchema } from "./schema.js";
import "./methods.js";
import "./statics.js";

export type Notification = InferSchemaType<typeof notificationSchema>;

export interface NotificationMethods {
  markAsRead(): Promise<Notification>;
}

export interface NotificationModel extends Model<Notification, {}, NotificationMethods> {
  findByUserId(userId: string): Promise<Notification[]>;
  findUnreadByUserId(userId: string): Promise<Notification[]>;
  markAllAsReadForUser(userId: string): Promise<mongoose.UpdateWriteOpResult>;
}

export const Notification = mongoose.model<Notification, NotificationModel>(
  "Notification",
  notificationSchema
);
export { notificationSchema };
