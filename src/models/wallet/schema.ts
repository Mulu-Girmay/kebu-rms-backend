import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.USER,
      required: true,
      unique: true,
      index: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
