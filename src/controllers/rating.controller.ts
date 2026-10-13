import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import { Rating } from '../models/ratings/index.js';
import { Order } from '../models/orders/index.js';
import { MenuItem } from '../models/menuItems/index.js';
import { APIError } from '../errors/APIError.js';
import { OrderStatus } from '../utils/constants.js';

export const createRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const { orderId, menuItemId, score, comment } = req.body as {
    orderId?: string;
    menuItemId: string;
    score: number;
    comment?: string;
  };

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  let isVerifiedPurchase = false;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new APIError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new APIError('Forbidden: Access to this order is denied', 403);
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new APIError(
        'Ratings tied to an order are only allowed for completed orders',
        400
      );
    }

    const itemInOrder = order.items.some(
      (i) => i.menuItemId.toString() === menuItemId
    );
    if (!itemInOrder) {
      throw new APIError('Specified menu item was not part of this order', 400);
    }

    const existingRating = await Rating.findOne({
      orderId,
      menuItemId,
      userId,
    });

    if (existingRating) {
      throw new APIError(
        'You have already rated this item for this order',
        400
      );
    }

    isVerifiedPurchase = true;
  } else {
    // Direct rating without an order
    const existingDirectRating = await Rating.findOne({
      orderId: null,
      menuItemId,
      userId,
    });

    if (existingDirectRating) {
      throw new APIError(
        'You have already reviewed this menu item. You can update your existing review.',
        400
      );
    }
  }

  const ratingData: Record<string, unknown> = {
    userId,
    orderId: orderId ?? null,
    menuItemId,
    score,
    isVerifiedPurchase,
  };
  if (comment?.trim()) {
    ratingData.comment = comment.trim();
  }

  const rating = await Rating.create(ratingData);

  res.status(201).json({
    success: true,
    message: 'Rating submitted successfully',
    data: rating,
  });
};

export const createBatchRatings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const { orderId, ratings } = req.body as {
    orderId?: string;
    ratings: Array<{ menuItemId: string; score: number; comment?: string }>;
  };

  let orderMenuItemIds: Set<string> | null = null;
  let isVerifiedPurchase = false;

  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new APIError('Order not found', 404);
    }

    if (order.userId !== userId) {
      throw new APIError('Forbidden: Access to this order is denied', 403);
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new APIError(
        'Ratings tied to an order are only allowed for completed orders',
        400
      );
    }

    orderMenuItemIds = new Set(order.items.map((i) => i.menuItemId.toString()));
    isVerifiedPurchase = true;
  }

  const createdRatings: unknown[] = [];
  const errors: string[] = [];

  for (const itemRating of ratings) {
    if (orderMenuItemIds && !orderMenuItemIds.has(itemRating.menuItemId)) {
      errors.push(
        `Menu item ID "${itemRating.menuItemId}" was not part of this order`
      );
      continue;
    }

    const existing = await Rating.findOne({
      orderId: orderId ?? null,
      menuItemId: itemRating.menuItemId,
      userId,
    });

    if (existing) {
      errors.push(
        orderId
          ? `Item "${itemRating.menuItemId}" has already been rated for this order`
          : `Item "${itemRating.menuItemId}" has already been reviewed by you`
      );
      continue;
    }

    const ratingData: Record<string, unknown> = {
      userId,
      orderId: orderId ?? null,
      menuItemId: itemRating.menuItemId,
      score: itemRating.score,
      isVerifiedPurchase,
    };
    if (itemRating.comment?.trim()) {
      ratingData.comment = itemRating.comment.trim();
    }

    const newRating = await Rating.create(ratingData);
    createdRatings.push(newRating);
  }

  if (createdRatings.length === 0 && errors.length > 0) {
    throw new APIError(`Failed to submit ratings: ${errors.join('; ')}`, 400);
  }

  res.status(201).json({
    success: true,
    message: `Submitted ${createdRatings.length} rating(s) successfully`,
    count: createdRatings.length,
    errors: errors.length > 0 ? errors : undefined,
    data: createdRatings,
  });
};

export const updateRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const ratingId = req.params.id as string;
  const { score, comment } = req.body as { score?: number; comment?: string };

  const rating = await Rating.findById(ratingId);
  if (!rating) {
    throw new APIError('Rating not found', 404);
  }

  if (rating.userId !== userId) {
    throw new APIError('Forbidden: Access to this rating is denied', 403);
  }

  if (score !== undefined) {
    rating.score = score;
  }
  if (comment !== undefined) {
    rating.comment = comment.trim();
  }

  await rating.save();

  res.status(200).json({
    success: true,
    message: 'Rating updated successfully',
    data: rating,
  });
};

export const deleteRating = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    throw new APIError('Unauthorized: User ID not found', 401);
  }

  const ratingId = req.params.id as string;

  const rating = await Rating.findById(ratingId);
  if (!rating) {
    throw new APIError('Rating not found', 404);
  }
  const isAuthor = rating.userId === userId;
  const isAdmin = ['super_admin'].includes(req.user!.role!.name);
  if (!isAuthor && !isAdmin) {
    throw new APIError('Forbidden: You can only delete your own reviews', 403);
  }
  await Rating.deleteOne({ _id: rating._id });

  res.status(200).json({
    success: true,
    message: 'Rating deleted successfully',
  });
};

export const getMenuItemRatings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const menuItemId = req.params.menuItemId as string;

  const menuItem = await MenuItem.findById(menuItemId);
  if (!menuItem) {
    throw new APIError('Menu item not found', 404);
  }

  const { page = 1, limit = 20, orderId, hasComment } = req.query;

  const filter: Record<string, unknown> = { menuItemId };
  if (orderId) {
    filter.orderId = orderId;
  }
  if (hasComment !== undefined && String(hasComment) === 'true') {
    filter.comment = { $exists: true, $ne: null };
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Math.min(100, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [total, ratings, aggResult] = await Promise.all([
    Rating.countDocuments(filter),
    Rating.find(filter)
      .populate('userId', 'name image email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Rating.aggregate([
      { $match: { menuItemId: menuItem._id } },
      {
        $group: {
          _id: '$menuItemId',
          averageScore: { $avg: '$score' },
          totalRatings: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats =
    aggResult.length > 0
      ? {
          averageScore: Number(aggResult[0].averageScore.toFixed(2)),
          totalRatings: aggResult[0].totalRatings,
        }
      : {
          averageScore: 0,
          totalRatings: 0,
        };

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    success: true,
    stats,
    pagination: {
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
    count: ratings.length,
    data: ratings,
  });
};
