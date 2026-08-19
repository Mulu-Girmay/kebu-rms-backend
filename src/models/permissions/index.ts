import mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { permissionSchema } from './schema.js';

export type Permission = InferSchemaType<typeof permissionSchema>;

export const Permission = mongoose.model<Permission>(
  'Permission',
  permissionSchema
);
