import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { favoriteSchema } from './schema.js';
import './methods.js';
import './statics.js';

export type Favorite = InferSchemaType<typeof favoriteSchema>;

export interface FavoriteMethods {}

export interface FavoriteModel extends Model<Favorite, {}, FavoriteMethods> {
  findByUserId(userId: string): Promise<Favorite[]>;
  isFavorited(userId: string, menuItemId: string): Promise<boolean>;
  countByMenuItemId(menuItemId: string): Promise<number>;
}

export const Favorite = mongoose.model<Favorite, FavoriteModel>(
  'Favorite',
  favoriteSchema
);
export { favoriteSchema };
