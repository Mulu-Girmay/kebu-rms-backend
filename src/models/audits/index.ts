import mongoose from 'mongoose';
import type { InferSchemaType, Model } from 'mongoose';
import { auditSchema } from './schema.js';
import { MODEL_NAMES } from '../../utils/constants.js';
import './methods.js';
import './statics.js';

export type Audit = InferSchemaType<typeof auditSchema>;

export interface AuditMethods {}

export interface AuditModel extends Model<Audit, {}, AuditMethods> {
  findByRecord(tableName: string, recordId: string): Promise<Audit[]>;
  findByUserId(userId: string): Promise<Audit[]>;
}

export const Audit = mongoose.model<Audit, AuditModel>(
  MODEL_NAMES.AUDIT,
  auditSchema
);
export { auditSchema };
