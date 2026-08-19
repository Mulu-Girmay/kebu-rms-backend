import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export const walletTransactionSchema = new Schema(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.WALLET,
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.ORDER,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      required: true,
      enum: ['mixed', 'credit', 'refund', 'debit'],
      index: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);
