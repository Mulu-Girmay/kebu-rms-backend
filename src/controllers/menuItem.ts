import type { Response } from 'express';
import { type QueryFilter } from 'mongoose';
import { MenuItem } from '../models/menuItems/index.js';
import { Favorite } from '../models/favorites/index.js';
import { APIError } from '../errors/APIError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeMenuItem } from '../utils/serializers.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';
import type { FindAvailableOptions, IMenuItem } from '../types/types.js';

const BASE_FILTER: QueryFilter<unknown> = { isAvailable: true };

//  GET /api/v1/menu-items
export const listMenuItems = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    cursor,
    limit = 20,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query as Record<string, string | undefined>;

  const limitNum = Math.min(
    Math.max(parseInt(String(limit), 10) || 20, 1),
    100
  );
  let cursorId: string | null = null;
  if (cursor) {
    try {
      cursorId = Buffer.from(cursor, 'base64').toString('utf-8');
    } catch {
      throw new APIError('Invalid cursor format', 400);
    }
  }
  const filter: QueryFilter<unknown> = { ...BASE_FILTER };

  if (category) filter.categoryId = category;

  if (search) {
    const words = search.trim().split(/\s+/);
    const nameConditions = words.map((word) => ({
      name: { $regex: word, $options: 'i' },
    }));
    const descConditions = words.map((word) => ({
      description: { $regex: word, $options: 'i' },
    }));

    filter.$or = [{ $and: nameConditions }, { $and: descConditions }];
  }

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    filter.price = priceFilter;
    console.log('MIN and MAX IS SET55555555555555');
  }

  const allowedSort = ['price', 'name', 'favoriteCount', 'createdAt'];
  const sortField = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
  const sortDirection = order === 'asc' ? 1 : -1;
  const sortObj: Record<string, 1 | -1> = {
    [sortField]: sortDirection,
    _id: sortDirection, //  ensures stable pagination
  };
  if (cursorId) {
    try {
      const cursorItem = await MenuItem.findById(cursorId).lean();
      if (cursorItem) {
        const cursorValue = (cursorItem as any)[sortField];

        if (sortDirection === 1) {
          filter.$or = [
            { [sortField]: { $gt: cursorValue } },
            {
              [sortField]: cursorValue,
              _id: { $gt: cursorId },
            },
          ];
        } else {
          filter.$or = [
            { [sortField]: { $lt: cursorValue } },
            {
              [sortField]: cursorValue,
              _id: { $lt: cursorId },
            },
          ];
        }
      }
    } catch {
      throw new APIError('Invalid cursor', 400);
    }
  }
  const items = await MenuItem.find(filter)
    .populate('categoryId', 'name')
    .sort(sortObj)
    .limit(limitNum + 1)
    .lean<IMenuItem[]>();
  const hasMore = items.length > limitNum;
  const pageItems = hasMore ? items.slice(0, limitNum) : items;

  const lastItem = pageItems[pageItems.length - 1];
  const nextCursor =
    hasMore && lastItem
      ? Buffer.from(lastItem._id.toString()).toString('base64')
      : null;
  let favoritedIds = new Set<any>();
  if (req.user) {
    const favs = await Favorite.find({
      userId: req.user.id,
      menuItemId: { $in: items.map((i) => i._id) },
    })
      .select('menuItemId')
      .lean();
    favoritedIds = new Set(favs.map((f) => f.menuItemId));
  }

  const data = items.map((item) =>
    serializeMenuItem(item, favoritedIds.has(item._id.toString()))
  );

  res.status(200).json({
    success: true,
    data,
    pagination: {
      limit: limitNum,
      hasMore,
      nextCursor,
    },
  });
};

//  GET /api/v1/menu-items/popular?limit=10
export const getPopularItems = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const limitNum = Math.min(
    Math.max(parseInt(String(req.query.limit ?? 10), 10) || 10, 1),
    50
  );

  const cacheKey = CACHE_KEYS.popularItems(limitNum);
  let items = cache.get<IMenuItem[]>(cacheKey);

  if (!items) {
    const options: FindAvailableOptions = {
      limit: limitNum,
      sort: { favoriteCount: -1 },
    };
    items = await MenuItem.findAvailable(options);

    cache.set(cacheKey, items, CACHE_TTL.POPULAR_ITEMS);
  }

  let favoritedIds = new Set<any>();
  if (req.user) {
    const favs = await Favorite.find({
      userId: req.user.id,
      menuItemId: { $in: items.map((i) => i._id) },
    })
      .select('menuItemId')
      .lean();
    favoritedIds = new Set(favs.map((f) => f.menuItemId));
  }

  const data = items.map((item) =>
    serializeMenuItem(item, favoritedIds.has(item._id.toString()))
  );

  res.status(200).json({ success: true, data });
};

//   GET /api/v1/menu-items/:id
export const getMenuItem = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const item = await MenuItem.findById(req.params.id)
    .populate('categoryId', 'name')
    .lean<IMenuItem>();

  if (!item) {
    throw new APIError('Menu item not found', 404);
  }

  let isFavorited = false;
  if (req.user) {
    isFavorited = await Favorite.isFavorited(req.user.id, item._id.toString());
  }

  res.status(200).json({
    success: true,
    data: serializeMenuItem(item, isFavorited),
  });
};
