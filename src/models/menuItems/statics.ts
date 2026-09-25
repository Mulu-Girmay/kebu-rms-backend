import type { FindAvailableOptions } from '../../types/types.js';
import { menuItemSchema } from './schema.js';

menuItemSchema.statics.findByCategoryId = async function (categoryId: string) {
  return this.find({ categoryId });
};

menuItemSchema.statics.findAvailableByCategoryId = async function (
  categoryId: string
) {
  return this.find({ categoryId, isAvailable: true });
};

menuItemSchema.statics.findAvailable = async function (
  options?: FindAvailableOptions
) {
  return this.find({ isAvailable: true })
    .populate('categoryId', 'name')
    .sort(options?.sort)
    .limit(options?.limit);
};

menuItemSchema.statics.findPopular = async function (limit: number = 10) {
  return this.find({ isAvailable: true })
    .sort({ favoriteCount: -1 })
    .limit(limit);
};
