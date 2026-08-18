import mongoose from "mongoose";
import type { InferSchemaType, Model } from "mongoose";
import { menuItemSchema } from "./schema.js";
import "./methods.js";
import "./statics.js";

export type MenuItem = InferSchemaType<typeof menuItemSchema>;

export interface MenuItemMethods {}

export interface MenuItemModel extends Model<MenuItem, {}, MenuItemMethods> {
  findByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findAvailableByCategoryId(categoryId: string): Promise<MenuItem[]>;
  findAvailable(): Promise<MenuItem[]>;
}

export const MenuItem = mongoose.model<MenuItem, MenuItemModel>("MenuItem", menuItemSchema);
export { menuItemSchema };
