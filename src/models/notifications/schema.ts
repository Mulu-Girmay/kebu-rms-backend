import { Schema } from "mongoose";

export const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["order_update", "transaction", "system"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    redirectParams: {
      type: String,
      default: null,
    },

    redirectRoute: {
      type: String,
      default: null,
    },
  },
  {
    timestamps:true
  }
);

// Unread notifications for a user, newest first
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
