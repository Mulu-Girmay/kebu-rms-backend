import mongoose from 'mongoose';
import type { InferSchemaType } from 'mongoose';
import { permissionSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';

export type Permission = InferSchemaType<typeof permissionSchema>;

export const Permission = mongoose.model<Permission>(
  MODEL_NAMES.PERMISSION,
  permissionSchema,
);
export { permissionSchema };