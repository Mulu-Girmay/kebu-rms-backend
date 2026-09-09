import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { userSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type User = InferSchemaType<typeof userSchema>;

export interface UserMethods {
  comparePassword(password: string): Promise<boolean>;
  verifyEmail(): Promise<void>;
  suspend(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  isActive(): boolean;
}

export interface UserModel extends Model<User, {}, UserMethods> {
  findByEmail(email: string): Promise<User | null>;
  emailExists(email: string): Promise<boolean>;
  findByRole(role_id: string): Promise<User[]>;
  findByEmailWithPassword(email: string): Promise<User>;
}

export const User = mongoose.model<User, UserModel>(
  MODEL_NAMES.USER,
  userSchema
);
export { userSchema };
