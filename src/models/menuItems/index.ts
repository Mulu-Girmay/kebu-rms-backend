import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { menuItemSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';
import type { FindAvailableOptions } from '../../types/types.js';

export type MenuItem = InferSchemaType<typeof menuItemSchema>;

export interface MenuItemMethods {}

export interface MenuItemModel extends Model<MenuItem, {}, MenuItemMethods> {
  findByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findAvailableByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findAvailable(options: FindAvailableOptions): Promise<MenuItem[]>;
  findPopular(limit?: number): Promise<MenuItem[]>;
}

export const MenuItem = mongoose.model<MenuItem, MenuItemModel>(
  MODEL_NAMES.MENU_ITEM,
  menuItemSchema
);
export { menuItemSchema };
