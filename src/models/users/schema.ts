import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  USER_STATUS_VALUES,
  UserStatus,
} from '../../utils/constants.js';
import type { IUser } from '../../types/types.js';

export const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
    },
    role_id: {
      type: String,
      ref: MODEL_NAMES.ROLE,
      required: false,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    image: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: UserStatus.ACTIVE,
    },
    settings: {
      type: {
        orderStatusNotifications: {
          type: String,
          enum: ['all', 'rejected_ready_only', 'none'],
          default: 'all',
        },
        promotionalNotifications: {
          type: Boolean,
          default: true,
        },
      },
      default: {
        orderStatusNotifications: 'all',
        promotionalNotifications: true,
      },
    },
    must_change_password: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);
