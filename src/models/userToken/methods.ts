import { userTokenSchema } from './schema.js';

userTokenSchema.methods.isExpired = function (): boolean {
  return this.expires_at.getTime() <= Date.now();
};

userTokenSchema.methods.isUsed = function (): boolean {
  return this.isUsed_at !== null;
};

userTokenSchema.methods.markAsUsed = async function (): Promise<void> {
  this.used_at = new Date();
  await this.save();
};
