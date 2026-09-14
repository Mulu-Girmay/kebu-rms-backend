import type { InferSchemaType, Model, Types } from 'mongoose';
import mongoose from 'mongoose';

import { MODEL_NAMES } from '../../utils/constants.js';
import { roleSchema } from './schema.js';

import './methods.js';
import './statics.js';

export type Role = InferSchemaType<typeof roleSchema>;

export interface RoleMethods {
  hasPermission(resource: string, action: string): Promise<boolean>;

  addPermission(permissionId: string | Types.ObjectId): void;

  removePermission(permissionId: string): void;

  clearPermissions(): void;
}

export interface RoleModel extends Model<Role, {}, RoleMethods> {
  assignPermission(
    roleId: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): ReturnType<Model<Role>['findByIdAndUpdate']>;

  revokePermission(
    roleId: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): ReturnType<Model<Role>['findByIdAndUpdate']>;

  findSystemRoles(): ReturnType<Model<Role[]>['find']>;

  findCustomRoles(): ReturnType<Model<Role[]>['find']>;

  findWithPermissions(roleId: string): ReturnType<Model<Role>['findById']>;

  roleHasPermission(
    roleId: Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<boolean>;

  isSystemRole(roleId: string): Promise<boolean>;
}

export const Role = mongoose.model<Role, RoleModel>(
  MODEL_NAMES.ROLE,
  roleSchema
);

export { roleSchema };
