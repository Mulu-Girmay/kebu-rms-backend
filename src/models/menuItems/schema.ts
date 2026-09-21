import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';
import type { IMenuItem } from '../../types/types.js';

export const menuItemSchema = new Schema<IMenuItem>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.CATEGORY,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: null,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Browse-by-category, filtered to what's currently sellable
menuItemSchema.index({ categoryId: 1, isAvailable: 1 });
