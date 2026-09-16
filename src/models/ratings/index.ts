import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { ratingSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type Rating = InferSchemaType<typeof ratingSchema>;

export interface RatingMethods {}

export interface RatingModel extends Model<Rating, {}, RatingMethods> {
  findByMenuItemId(menuItemId: string): Promise<Rating[]>;
  findByUserId(userId: string): Promise<Rating[]>;
  findByOrderId(orderId: string): Promise<Rating[]>;
}

export const Rating = mongoose.model<Rating, RatingModel>(
  MODEL_NAMES.RATING,
  ratingSchema
);
export { ratingSchema };
