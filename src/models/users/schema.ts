import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export const userSchema = new Schema(
  {
    role_id: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.ROLE,
      required: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
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
      enum: [
        "active",
        "inactive",
        "suspended",
      ],
      default: "active",
    },    
    must_change_password: {
        type: Boolean,
        default: false,
},
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

userSchema.index(
  { email: 1 },
  { unique: true }
);