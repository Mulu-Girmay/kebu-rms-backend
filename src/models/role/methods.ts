import { Permission } from '../permissions/index.js';
import { roleSchema } from './schema.js';
import { Types } from 'mongoose';

roleSchema.methods.hasPermission = async function (
  resource: string,
  action: string
): Promise<boolean> {
  const permission = await Permission.findOne({ resource, action });

  if (!permission) return false;

  return this.permissions.some((permissionId: Types.ObjectId) =>
    permissionId.equals(permission._id)
  );
};

roleSchema.methods.addPermission = function (
  permissionId: string | Types.ObjectId
): void {
  const hasPermission = this.permissions.some((id: Types.ObjectId) =>
    id.equals(permissionId)
  );
  if (!hasPermission) {
    this.permissions.push(permissionId);
  }
};

roleSchema.methods.removePermission = function (permissionId: string): void {
  const idString = permissionId.toString();
  this.permissions = this.permissions.filter(
    (p: any) => p.toString() !== idString
  );
};
roleSchema.methods.clearPermissions = function (): void {
  this.permissions = [];
};
