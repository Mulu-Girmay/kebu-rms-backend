import { userTokenSchema } from './schema.js';
import './methods.js';
import './statics.js';
import type { UserToken } from './index.js';

userTokenSchema.statics.findValidBytokenHash = function (
  tokenHash: string
): Promise<UserToken | null> {
  return this.findOne({
    token_hash: tokenHash,
    used_at: null,
    expires_at: {
      $gt: new Date(),
    },
  });
};

userTokenSchema.statics.findByUserId = function (
  userId: string
): Promise<UserToken[]> {
  return this.find({ user_id: userId }).sort({ created_at: -1 });
};

userTokenSchema.statics.invalidateForuser = function (
  userId: string
): Promise<any> {
  return this.updateMany(
    {
      user_id: userId,
      used_at: null,
    },
    {
      $set: {
        used_at: new Date(),
      },
    }
  );
};
