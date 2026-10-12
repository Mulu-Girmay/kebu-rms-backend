import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  NOTIFICATION_TYPE_VALUES,
} from '../../utils/constants.js';

export const notificationSchema = new Schema(
  {
    userId: {
      type: String,
      ref: MODEL_NAMES.USER,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: NOTIFICATION_TYPE_VALUES,
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
      type: Schema.Types.Mixed,
      default: null,
    },

    redirectRoute: {
      type: String,
      default: null,
    },
    meta: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unread notifications for a user, newest first
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
