import type { Response } from 'express';
import { Notification } from '../models/notifications/index.js';
import { APIError } from '../errors/APIError.js';
import type { AuthenticatedRequest } from '../middlewares/auth.js';
import mongoose from 'mongoose';
import logger from '../config/winston.js';

//   GET /api/v1/notifications
export const listNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const {
    limit = 20,
    isRead,
    type,
    nextCursor,
  } = req.query as Record<string, string | undefined>;

  const filter: Record<string, unknown> = { userId: req.user!.id };
  if (isRead === 'true') filter.isRead = true;
  if (isRead === 'false') filter.isRead = false;
  if (type) filter.type = type;

  if (nextCursor) {
    try {
      const decodedCursor = Buffer.from(nextCursor, 'base64').toString('ascii');
      const [cursorCreatedAt, cursorId] = decodedCursor.split('_');

      if (cursorCreatedAt && cursorId) {
        filter.$or = [
          { createdAt: { $lt: new Date(cursorCreatedAt) } },
          {
            createdAt: new Date(cursorCreatedAt),
            _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
          },
        ];
      }
    } catch (err) {
      logger.log('MID', 'unable to send notification');
    }
  }

  const limitNum = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const [unreadCount, notifications] = await Promise.all([
    Notification.countDocuments({ userId: req.user!.id, isRead: false }),
    Notification.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitNum + 1)
      .lean(),
  ]);

  const hasNextPage = notifications.length > limitNum;
  if (hasNextPage) {
    notifications.pop();
  }

  let newCursor: string | null = null;
  if (hasNextPage && notifications.length > 0) {
    const lastItem = notifications[notifications.length - 1];
    const rawCursorToken = `${new Date((lastItem as any).createdAt).toISOString()}_${(lastItem as any)._id}`;
    newCursor = Buffer.from(rawCursorToken).toString('base64');
  }

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      limit: limitNum,
      nextCursor: newCursor,
      hasNextPage,
    },
  });
};

/**
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const unreadCount = await Notification.countDocuments({
    userId: req.user!.id,
    isRead: false,
  });

  res.status(200).json({ success: true, data: { unreadCount } });
};

/**
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) throw new APIError('Notification not found', 404);

  if (notification.userId !== req.user!.id) {
    throw new APIError('Forbidden: Not your notification', 403);
  }

  if (!notification.isRead) {
    notification.isRead = true;
    await notification.save();
  }

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: notification,
  });
};

/**
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const result = await Notification.updateMany(
    { userId: req.user!.id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read`,
    data: { updated: result.modifiedCount },
  });
};

/**
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) throw new APIError('Notification not found', 404);

  if (notification.userId !== req.user!.id) {
    throw new APIError('Forbidden: Not your notification', 403);
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted',
  });
};

/**
 * DELETE /api/v1/notifications
 */
export const clearAllNotifications = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const result = await Notification.deleteMany({ userId: req.user!.id });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} notification(s) cleared`,
    data: { deleted: result.deletedCount },
  });
};
