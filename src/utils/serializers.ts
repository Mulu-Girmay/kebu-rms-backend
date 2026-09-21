import type { Types } from 'mongoose';
import type { ICategory, IFavorite, IMenuItem } from '../types/types.js';

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
