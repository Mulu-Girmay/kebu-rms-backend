import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  CREDIT_ACCOUNT_STATUS_VALUES,
  CreditAccountStatus,
} from '../../utils/constants.js';

export const creditAccountSchema = new Schema(
  {
    user: {
      type: String,
      ref: MODEL_NAMES.USER,
      required: true,
      unique: true,
      index: true,
    },

    creditLimit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    usedCredit: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: CREDIT_ACCOUNT_STATUS_VALUES,
      default: CreditAccountStatus.ACTIVE,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
