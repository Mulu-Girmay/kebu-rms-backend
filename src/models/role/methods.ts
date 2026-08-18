import type { InferSchemaType } from "mongoose";
import type { permissionSchema } from "../permissions/schema.js";
import { roleSchema } from "./schema.js";
import { Types } from 'mongoose';


export type Permission = InferSchemaType<typeof permissionSchema>;

roleSchema.methods.hasPermission = function (resource: string, action: string): boolean {
  return this.permissions.some((permission: Permission) =>
      permission.resource === resource && permission.action === action);
};

roleSchema.methods.addPermission = function (permissionId: string | Types.ObjectId): void {
  const hasPermission = this.permissions.some((id: Types.ObjectId) => id.equals(permissionId));
  if (!hasPermission) {
    this.permissions.push(permissionId);
  }
}

roleSchema.methods.removePermission = function (permissionId: string ): void{
    this.permissions.pop(permissionId)
}
roleSchema.methods.clearPermissions = function (): void{
    this.permissions = []
}