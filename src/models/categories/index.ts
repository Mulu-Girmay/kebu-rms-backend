import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { categorySchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type Category = InferSchemaType<typeof categorySchema>;

export interface CategoryMethods {}

export interface CategoryModel extends Model<Category, {}, CategoryMethods> {
  findByName(name: string): Promise<Category | null>;
  findActive(): Promise<Category[]>;
}

export const Category = mongoose.model<Category, CategoryModel>(
  MODEL_NAMES.CATEGORY,
  categorySchema
);
export { categorySchema };
