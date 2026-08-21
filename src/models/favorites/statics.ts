import { favoriteSchema } from './schema.js';

favoriteSchema.statics.findByUserId = async function (userId: string) {
  return this.find({ userId }).populate('menuItemId').sort({ createdAt: -1 });
};

favoriteSchema.statics.isFavorited = async function (
  userId: string,
  menuItemId: string
): Promise<boolean> {
  const exists = await this.exists({ userId, menuItemId });
  return !!exists;
};

favoriteSchema.statics.countByMenuItemId = async function (
  menuItemId: string
): Promise<number> {
  return this.countDocuments({ menuItemId });
};
