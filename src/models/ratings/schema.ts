import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export const ratingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.USER,
      required: true,
      index: true,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.ORDER,
      required: true,
      index: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.MENU_ITEM,
      required: true,
      index: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps:true
  }
);

// One rating per menu item, per order, per user (prevents duplicate/replay ratings)
ratingSchema.index({ orderId: 1, menuItemId: 1, userId: 1 }, { unique: true });
