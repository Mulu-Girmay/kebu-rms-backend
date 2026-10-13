import logger from '../config/winston.js';
import { Notification } from '../models/notifications/index.js';
import type { NotifyUserParams } from '../services/types.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import { socketManager } from '../socket/manager.js';
import { NotificationType } from '../utils/constants.js';

export function shouldNotify(
  user: { settings?: Record<string, unknown> },
  type: NotificationType,
  meta?: Record<string, unknown>
): boolean {
  const settings = (user.settings as Record<string, unknown>) || {};
  switch (type) {
    case NotificationType.ORDER_UPDATE: {
      const pref = (settings.orderStatusNotifications as string) ?? 'all';
      if (pref === 'none') return false;
      if (pref === 'rejected_ready_only') {
        const trigger = meta?.triggerStatus as string | undefined;
        return trigger === 'rejected' || trigger === 'ready';
      }
      return true;
    }
    case NotificationType.PROMOTION:
      return settings.promotionalNotifications !== false;

    // Transactions, staff alerts, system messages always go through
    default:
      return true;
  }
}

export async function persistAndEmit(
  userId: string,
  params: Omit<NotifyUserParams, 'userId'>
): Promise<void> {
  const notification = await Notification.create({
    userId,
    type: params.type,
    message: params.message,
    redirectRoute: params.redirectRoute ?? null,
    redirectParams: params.redirectParams ?? null,
    meta: params.meta ?? {},
    isRead: false,
  });

  // Emit socket event (best-effort — don't fail if user is offline)
  try {
    socketManager.emitToUser(
      userId,
      SOCKET_EVENTS.NOTIFICATION_CREATED,
      notification.toObject()
    );
  } catch (error) {
    logger.warn(`Failed to emit socket notification to user ${userId}:`, error);
  }
}

export default shouldNotify;
