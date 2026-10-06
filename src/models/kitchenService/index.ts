import mongoose, { Schema } from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export interface IKitchenService {
  isOrdersPaused: boolean;
  pausedAt: Date | null;
  pausedBy: string | null;
  pauseReason: string | null;
  updatedAt: Date;
  createdAt: Date;
}

const kitchenServiceSchema = new Schema<IKitchenService>(
  {
    isOrdersPaused: {
      type: Boolean,
      default: false,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    pausedBy: {
      type: String,
      default: null,
    },
    pauseReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

export const KitchenService = mongoose.model<IKitchenService>(
  MODEL_NAMES.KITCHEN_SERVICE,
  kitchenServiceSchema
);

export const getKitchenServiceStatus = async (): Promise<IKitchenService> => {
  let service = await KitchenService.findOne();
  if (!service) {
    service = await KitchenService.create({ isOrdersPaused: false });
  }
  return service;
};
