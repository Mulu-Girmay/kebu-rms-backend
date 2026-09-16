import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { Favorite } from '../models/favorites/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { APIError } from '../errors/APIError.js';

export const toggleFavorite = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const menuItemId = req.params.menuItemId as string;

  const existingFavorite = await Favorite.findOne({ userId, menuItemId });

  if (existingFavorite) {
    await Favorite.deleteOne({ userId, menuItemId });
    await MenuItem.findByIdAndUpdate(menuItemId, {
      $inc: { favoriteCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Menu item removed from favorites',
      isFavorite: false,
    });
    return;
  }

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  await Favorite.create({ userId, menuItemId });
  await MenuItem.findByIdAndUpdate(menuItemId, {
    $inc: { favoriteCount: 1 },
  });

  res.status(201).json({
    success: true,
    message: 'Menu item added to favorites',
    isFavorite: true,
  });
};

export const getUserFavorites = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const { page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [total, favorites] = await Promise.all([
    Favorite.countDocuments({ userId }),
    Favorite.find({ userId })
      .populate({
        path: 'menuItemId',
        populate: { path: 'categoryId', select: 'name isActive' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    count: favorites.length,
    data: favorites,
  });
};
