import { Schema } from 'mongoose';

export const creditAccountSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
      enum: ['active', 'frozen', 'closed'],
      default: 'active',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
