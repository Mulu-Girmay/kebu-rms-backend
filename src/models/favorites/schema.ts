import { Schema } from "mongoose";

export const favoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: false,
    },
  }
);

// Prevent duplicate favorites & enable fast lookups
favoriteSchema.index({ userId: 1, menuItemId: 1 }, { unique: true });
