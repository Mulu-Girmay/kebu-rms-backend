import type { Types } from 'mongoose';
import type { UserStatus } from '../utils/constants.js';

export interface IUser {
  _id: string;
  role_id?: Types.ObjectId | string;
  fullName: string;
  email: string;
  is_email_verified?: boolean;
  email_verified_at?: Date | null;
  profileImage?: string | null;
  status?: UserStatus;
  must_change_password?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  is_system_role: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMenuItem {
  _id: Types.ObjectId;
  categoryId:
    Types.ObjectId | string | { _id: Types.ObjectId | string; name: string };
  name: string;
  description?: string;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
  favoriteCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFavorite {
  _id: Types.ObjectId;
  userId: Types.ObjectId | string;
  menuItemId?: Types.ObjectId | string | IMenuItem;
  createdAt?: Date;
}

export interface FindAvailableOptions {
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

export interface CursorPaginationResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
