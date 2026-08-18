import { roleSchema } from "./schema.js";
import { Schema } from "mongoose";


roleSchema.statics.assignPermission = async function (roleId: string,permissionId: Schema.Types.ObjectId):Promise<any> {
  return this.findByIdAndUpdate(
    roleId,
    { $addToSet: { permissions: permissionId } },  //Assign a permission to a role (adds to the array if not already present)
    { new: true }
  ).populate("permissions");
};


roleSchema.statics.revokePermission = async function (roleId: string, permissionId: Schema.Types.ObjectId):Promise<any> {
  return this.findByIdAndUpdate(
    roleId,
    { $pull: { permissions: permissionId } },
    { new: true }
  ).populate("permissions");
};

roleSchema.statics.roleHasPermission = async function (roleId: Schema.Types.ObjectId, permissionId: Schema.Types.ObjectId):Promise<boolean>{
    const role = await this.findById(roleId);
    if (!role) return false;
    return role.permissions.some((id:any) => id.equals(permissionId))  // Corrected
}

roleSchema.statics.isSystemRole = async function (roleId: string): Promise<boolean> {
  const role = await this.findById(roleId);
  return role ? role.is_system_role : false;
};
