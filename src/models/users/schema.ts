import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  USER_STATUS_VALUES,
  UserStatus,
} from '../../utils/constants.js';
import { Types } from 'mongoose';

export const userSchema = new Schema(
  {
    _id: {
      type: String,
      trim: true,
      default: () => `user_${new Types.ObjectId().toString()}`, // Match Better Auth format
    },
    role_id: {
      type: String,
      ref: MODEL_NAMES.ROLE,
      required: false,
    },

    fullName: {
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
    is_email_verified: {
      type: Boolean,
      default: false,
    },

    email_verified_at: {
      type: Date,
      default: null,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    profileImage: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: USER_STATUS_VALUES,
      default: UserStatus.ACTIVE,
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
