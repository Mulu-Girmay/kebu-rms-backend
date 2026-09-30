import { Types } from 'mongoose';

import { roleSchema } from './schema.js';

roleSchema.methods.hasPermission = async function (
  resource: string,
  action: string
): Promise<boolean> {
  const { Permission } = await import('../permissions/index.js');

  const permission = await Permission.findOne({
    resource,
    action,
  });

  if (!permission) {
    return false;
  }

  return this.permissions.some((permissionId: Types.ObjectId) =>
    permissionId.equals(permission._id)
  );
};

roleSchema.methods.addPermission = function (
  permissionId: string | Types.ObjectId
): void {
  const objectId =
    typeof permissionId === 'string'
      ? new Types.ObjectId(permissionId)
      : permissionId;

  const alreadyExists = this.permissions.some((id: Types.ObjectId) =>
    id.equals(objectId)
  );

  if (!alreadyExists) {
    this.permissions.push(objectId);
  }
};

roleSchema.methods.removePermission = function (permissionId: string): void {
  this.permissions = this.permissions.filter(
    (id: Types.ObjectId) => id.toString() !== permissionId
  );
};

roleSchema.methods.clearPermissions = function (): void {
  this.permissions = [];
};
