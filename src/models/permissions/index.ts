import mongoose from 'mongoose';
import type {InferSchemaType,Model, } from "mongoose";

import { permissionSchema } from "./schema.js";
 
export type Permission = InferSchemaType<typeof permissionSchema>;

export interface PermissionModel
  extends Model<Permission> {
  findByResourceAction(
    resource: string,
    action: string
  ): Promise<Permission | null>;

  existsByResourceAction(
    resource: string,
    action: string
  ): Promise<boolean>;

  findByResource(
    resource: string
  ): Promise<Permission[]>;
}

export const PermissionModel =
  (mongoose.models.Permission as PermissionModel) ||
  mongoose.model<Permission, PermissionModel>(
    "Permission",
    permissionSchema
  );