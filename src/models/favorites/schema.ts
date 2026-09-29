import { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';
import { type IFavorite } from '../../types/types.js';

export const favoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: String,
      ref: MODEL_NAMES.USER,
      required: true,
      index: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.MENU_ITEM,
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: false,
    },
  }
);

// Prevent duplicate favorites & enable fast lookups
favoriteSchema.index({ userId: 1, menuItemId: 1 }, { unique: true });
