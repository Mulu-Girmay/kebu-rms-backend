import type { Types } from 'mongoose';
import type { UserStatus } from '../utils/constants.js';
export interface IUserSettings {
  orderStatusNotifications: 'all' | 'rejected_ready_only' | 'none';
  promotionalNotifications: boolean;
  pushNotificaitons: boolean;
}
export interface IUser {
  _id: string;
  name: string;
  email: string;
  image: string;
  role_id?: Types.ObjectId | string;
  status: UserStatus;
  settings: IUserSettings;
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

export interface BetterAuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
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

export interface PaymentBreakdown {
  walletAmount: number;
  creditAmount: number;
}

export interface TopUpResult {
  walletCredited: number;
  creditRepaid: number;
  walletBalanceAfter: number;
  creditUsedAfter: number;
}
