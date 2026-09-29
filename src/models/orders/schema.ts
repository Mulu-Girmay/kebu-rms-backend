import { Schema } from 'mongoose';
import {
  MODEL_NAMES,
  ORDER_STATUS_VALUES,
  OrderStatus,
} from '../../utils/constants.js';

export const orderItemSchema = new Schema(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: MODEL_NAMES.MENU_ITEM,
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [0.01, 'Quantity must be at least 0.01'],
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

export const orderSchema = new Schema(
  {
    userId: {
      type: String,
      ref: MODEL_NAMES.USER,
      required: true,
      index: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: OrderStatus.PLACED,
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },

    customerNotes: {
      type: String,
      trim: true,
      default: null,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one item.',
      },
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    placedAt: {
      type: Date,
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },

    favoriteLabel: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, isFavorite: 1, createdAt: -1 });
