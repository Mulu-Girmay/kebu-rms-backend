import { roleSchema } from './schema.js';
import { Schema } from 'mongoose';

roleSchema.statics.findSystemRoles = function () {
  return this.find({
    is_system_role: true,
  });
};

roleSchema.statics.findCustomRoles = function () {
  return this.find({
    is_system_role: false,
  });
};

roleSchema.statics.findWithPermissions = function (role_id: string) {
  return this.findById(role_id).populate('permissions');
};

roleSchema.statics.assignPermission = async function (
  role_id: string,
  permissionId: Schema.Types.ObjectId
): Promise<any> {
  return this.findByIdAndUpdate(
    role_id,
    { $addToSet: { permissions: permissionId } }, //Assign a permission to a role (adds to the array if not already present)
    { new: true }
  ).populate('permissions');
};

roleSchema.statics.revokePermission = async function (
  role_id: string,
  permissionId: Schema.Types.ObjectId
): Promise<any> {
  return this.findByIdAndUpdate(
    role_id,
    { $pull: { permissions: permissionId } },
    { new: true }
  ).populate('permissions');
};

roleSchema.statics.roleHasPermission = async function (
  role_id: Schema.Types.ObjectId,
  permissionId: Schema.Types.ObjectId
): Promise<boolean> {
  const role = await this.findById(role_id);
  if (!role) return false;
  return role.permissions.some((id: any) => id.equals(permissionId)); // Corrected
};

roleSchema.statics.isSystemRole = async function (
  role_id: string
): Promise<boolean> {
  const role = await this.findById(role_id);
  return role ? role.is_system_role : false;
};
