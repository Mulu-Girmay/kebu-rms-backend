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
