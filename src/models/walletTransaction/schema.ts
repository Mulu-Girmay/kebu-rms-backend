import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  WALLET_TRANSACTION_TYPE_VALUES,
} from '../../utils/constants.js';

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
      enum: WALLET_TRANSACTION_TYPE_VALUES,
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
