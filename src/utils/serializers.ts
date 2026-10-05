import type { Types } from 'mongoose';
import type { ICategory, IFavorite, IMenuItem } from '../types/types.js';
export const serializeUser = (user: any) => {
  const role =
    user.role_id && typeof user.role_id === 'object' && '_id' in user.role_id
      ? {
          id: user.role_id._id,
          name: user.role_id.name,
          description: user.role_id.description,
        }
      : user.role_id
        ? {
            id: user.role_id,
          }
        : null;

  return {
    id: user._id,
    name: user.name || null,
    email: user.email,
    image: user.image ?? user.image ?? null,
    status: user.status,
    settings: {
      orderStatusNotifications:
        user.settings?.orderStatusNotifications ?? 'all',
      promotionalNotifications: user.settings?.promotionalNotifications ?? true,
    },
    role,
    createdAt: user.created_at ?? user.createdAt,
    updatedAt: user.updated_at ?? user.updatedAt ?? user.updateAt ?? null,
  };
};

export const serializeCategory = (category: ICategory, itemCount = 0) => ({
  id: category._id.toString(),
  name: category.name,
  description: category.description ?? null,
  imageUrl: category.imageUrl ?? null,
  isActive: category.isActive,
  itemCount,
});

const isPopulatedCategory = (
  c: IMenuItem['categoryId']
): c is { _id: Types.ObjectId | string; name: string } =>
  typeof c === 'object' && c !== null && 'name' in c;

export const serializeMenuItem = (item: IMenuItem, isFavorited = false) => ({
  id: item._id.toString(),
  name: item.name,
  description: item.description ?? null,
  price: item.price,
  imageUrl: item.imageUrl ?? null,
  isAvailable: item.isAvailable,
  favoriteCount: item.favoriteCount,
  category: isPopulatedCategory(item.categoryId)
    ? {
        id: item.categoryId._id.toString(),
        name: item.categoryId.name,
      }
    : { id: item.categoryId.toString() },
  isFavorited,
});

export const serializeFavorite = (fav: IFavorite) => {
  const item =
    typeof fav.menuItemId === 'object' &&
    fav.menuItemId !== null &&
    'name' in fav.menuItemId
      ? (fav.menuItemId as IMenuItem)
      : null;

  return {
    id: fav._id.toString(),
    menuItemId: item ? item._id.toString() : fav.menuItemId?.toString(),
    createdAt: fav.createdAt,
    menuItem: item ? serializeMenuItem(item, true) : null,
  };
};

export interface ICreditAccount {
  _id: Types.ObjectId | string;
  user: Types.ObjectId | string | { _id: string; name: string; email: string };
  creditLimit: number;
  usedCredit: number;
  status: 'active' | 'frozen' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
}

export const serializeCreditAccount = (account: ICreditAccount) => {
  const availableCredit = Math.max(account.creditLimit - account.usedCredit, 0);

  const populatedUser =
    typeof account.user === 'object' &&
    account.user !== null &&
    'name' in account.user
      ? account.user
      : null;

  return {
    id: account._id.toString(),
    userId: populatedUser
      ? populatedUser._id.toString()
      : account.user.toString(),
    user: populatedUser,
    creditLimit: account.creditLimit,
    usedCredit: account.usedCredit,
    availableCredit,
    status: account.status,
    isUsable: account.status === 'active' && availableCredit > 0,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  };
};
