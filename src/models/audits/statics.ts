import { auditSchema } from './schema.js';

auditSchema.statics.findByRecord = async function (
  tableName: string,
  recordId: string
) {
  return this.find({ tableName, recordId }).sort({ createdAt: -1 });
};

auditSchema.statics.findByUserId = async function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};
