import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { validateRequest } from '../validators/errors.parser.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notification.js';
import {
  validateNotificationId,
  validateListQuery,
} from '../validators/notification.validator.js';

const router = Router();

router.use(requireAuth);
router.get(
  '/',
  validateListQuery,
  validateRequest,
  asyncHandler(listNotifications)
);
router.get('/unread-count', asyncHandler(getUnreadCount));
router.patch('/read-all', asyncHandler(markAllAsRead));
router.patch(
  '/:id/read',
  validateNotificationId,
  validateRequest,
  asyncHandler(markAsRead)
);
router.delete('/', asyncHandler(clearAllNotifications));
router.delete(
  '/:id',
  validateNotificationId,
  validateRequest,
  asyncHandler(deleteNotification)
);

export default router;
