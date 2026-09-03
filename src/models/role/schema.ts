import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';
import type { IRole } from '../../types/types.js';

export const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    is_system_role: {
      type: Boolean,
      default: false,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: MODEL_NAMES.PERMISSION,
      },
    ],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);
