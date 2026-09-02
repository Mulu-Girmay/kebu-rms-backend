import { Types } from 'mongoose';

import { roleSchema } from './schema.js';

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

roleSchema.statics.findWithPermissions = function (roleId: string) {
  return this.findById(roleId).populate('permissions');
};

roleSchema.statics.assignPermission = async function (
  roleId: string | Types.ObjectId,
  permissionId: Types.ObjectId
) {
  return this.findByIdAndUpdate(
    roleId,
    {
      $addToSet: {
        permissions: permissionId,
      },
    },
    {
      new: true,
    }
  ).populate('permissions');
};

roleSchema.statics.revokePermission = async function (
  roleId: string | Types.ObjectId,
  permissionId: Types.ObjectId
) {
  return this.findByIdAndUpdate(
    roleId,
    {
      $pull: {
        permissions: permissionId,
      },
    },
    {
      new: true,
    }
  ).populate('permissions');
};

roleSchema.statics.roleHasPermission = async function (
  roleId: Types.ObjectId,
  permissionId: Types.ObjectId
): Promise<boolean> {
  const role = await this.findById(roleId);

  if (!role) {
    return false;
  }

  return role.permissions.some((id: Types.ObjectId) => id.equals(permissionId));
};

roleSchema.statics.isSystemRole = async function (
  roleId: string
): Promise<boolean> {
  const role = await this.findById(roleId);

  return role?.is_system_role ?? false;
};
