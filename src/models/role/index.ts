import type { InferSchemaType, Model, Types } from 'mongoose';
import { roleSchema } from './schema.js';
import mongoose from 'mongoose';
import { MODEL_NAMES } from '../../utils/constants.js';

export type Role = InferSchemaType<typeof roleSchema>;

export interface RoleMethods {
  hasPermission(resource: string, action: string): Promise<boolean>;
  addPermission(permissionId: string | Types.ObjectId): void;
  removePermission(permissionId: string): void;
  clearPermissions(): void;
}
export interface RoleModel extends Model<Role, {}, RoleMethods> {
  assignPermission(
    role_id: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<Role>;
  revokePermission(
    role_id: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<Role>;

  findSystemRoles(): Promise<Role[]>;
  findCustomRoles(): Promise<Role[]>;
  findWithPermissions(role_id: string): Promise<Role>;
  roleHasPermission(
    role_id: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<boolean>;
  isSystemRole(role_id: string | Types.ObjectId): Promise<boolean>;
}

export const Role = mongoose.model<Role, RoleModel>(
  MODEL_NAMES.ROLE,
  roleSchema
);
export { roleSchema };
