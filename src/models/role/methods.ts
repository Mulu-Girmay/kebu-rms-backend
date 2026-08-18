import type { InferSchemaType } from "mongoose";
import type { permissionSchema } from "../permissions/schema.js";
import { roleSchema } from "./schema.js";
import { Types } from 'mongoose';


export type Permission = InferSchemaType<typeof permissionSchema>;

roleSchema.methods.hasPermission = async function (resource: string, action: string): Promise<boolean> {

  const {Permission} = await import('../permissions/index.js')
  const permission = await Permission.findOne({ resource, action });
  if (!permission) return false;

  return this.permissions.some((p: any) =>
      p.toString()  === permission._id.toString()
  )
};

roleSchema.methods.addPermission = function (permissionId: string | Types.ObjectId): void {
  const hasPermission = this.permissions.some((id: Types.ObjectId) => id.equals(permissionId));
  if (!hasPermission) {
    this.permissions.push(permissionId);
  }
}

roleSchema.methods.removePermission = function (permissionId: string ): void{
   const idString = permissionId.toString();
    this.permissions = this.permissions.filter(
         (p: any) => p.toString() !== idString
  );
}
roleSchema.methods.clearPermissions = function (): void{
    this.permissions = []
}
 