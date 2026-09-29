import type { Response } from 'express';
import { Category } from '../models/categories/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { serializeCategory } from '../utils/serializers.js';
import { cache, CACHE_KEYS, CACHE_TTL } from '../utils/cache.js';
import type { ICategory } from '../types/types.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';

// GET /api/v1/categories
export const listCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const cached = cache.get<ReturnType<typeof serializeCategory>[]>(
    CACHE_KEYS.CATEGORIES
  );
  if (cached) {
    res.status(200).json({ success: true, data: cached, cached: true });
    return;
  }
  const categories = await Category.findActive();
  const counts = await MenuItem.aggregate<{ _id: string; count: number }>([
    { $match: { isAvailable: true } },
    { $group: { _id: '$categoryId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  const data = categories.map((cat: any) =>
    serializeCategory(cat, countMap.get(cat._id.toString()) ?? 0)
  );

  cache.set(CACHE_KEYS.CATEGORIES, data, CACHE_TTL.CATEGORIES);

  res.status(200).json({ success: true, data });
};
