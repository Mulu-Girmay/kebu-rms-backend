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
    roleId: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<Role>;
  revokePermission(
    roleId: string | Types.ObjectId,
    permissionId: Types.ObjectId
  ): Promise<Role>;
  findSystemRoles(): Promise<Role>;
  findCustomRoles(): Promise<Role>;
  findWithPermissions(roleId: string): Promise<Role>;
}
export const Role = mongoose.model<Role, RoleModel>(
  MODEL_NAMES.ROLE,
  roleSchema
);
export { roleSchema };
