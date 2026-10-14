import { Notification } from '../models/notifications/index.js';
import { User } from '../models/users/index.js';
import { Role } from '../models/role/index.js';
import { Permission } from '../models/permissions/index.js';
import { socketManager } from '../socket/manager.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import type {
  NotifyPermissionParams,
  NotifyRoleParams,
  NotifyUserParams,
} from './types.js';
import logger from '../config/winston.js';
import shouldNotify, { persistAndEmit } from '../helpers/notification.js';
import { UserStatus } from '../utils/constants.js';

export const NotificationService = {
  /**
   * Notify a single user.
   * Respects user settings for order_update and promotion types.
   * Returns the notification if created, null if suppressed.
   */
  async notifyUser(params: NotifyUserParams): Promise<unknown | null> {
    const user = await User.findById(params.userId).select('settings status');
    if (!user) {
      logger.warn(`notifyUser: user ${params.userId} not found`);
      return null;
    }

    const shouldPushNotif = shouldNotify(
      user.settings as any,
      params.type,
      params.meta
    );

    await persistAndEmit(params.userId, params, shouldPushNotif);

    const latest = await Notification.findOne({ userId: params.userId })
      .sort({ createdAt: -1 })
      .lean();

    return latest;
  },

  /**
   * Notify all active users who have a specific permission.
   * Uses role → permission mapping.
   * Returns the count of notifications created.
   */
  async notifyPermission(params: NotifyPermissionParams): Promise<number> {
    // 1. Find the permission document
    const permission = await Permission.findOne({
      resource: params.resource,
      action: params.action,
    });
    if (!permission) {
      logger.warn(
        `notifyPermission: permission ${params.resource}:${params.action} not found`
      );
      return 0;
    }

    // 2. Find all roles that have this permission
    const roles = await Role.find({
      permissions: permission._id.toString(),
    }).select('_id');
    if (roles.length === 0) return 0;

    const roleIds = roles.map((r) => r._id.toString());

    // 3. Find all active users with those roles
    const users = await User.find({
      role_id: { $in: roleIds },
      status: UserStatus.ACTIVE,
    }).select('_id settings');

    if (users.length === 0) return 0;

    // 4. Filter by user settings + create notifications
    const eligible = users.filter((u) =>
      shouldNotify(u as any, params.type, params.meta)
    );

    if (eligible.length === 0) return 0;

    const docs = eligible.map((u) => ({
      userId: u._id.toString(),
      type: params.type,
      message: params.message,
      redirectRoute: params.redirectRoute ?? null,
      redirectParams: params.redirectParams ?? null,
      meta: params.meta ?? {},
      isRead: false,
    }));

    const created = await Notification.insertMany(docs);

    // 5. Emit socket events in parallel (best-effort)
    await Promise.all(
      created.map(async (n) => {
        try {
          socketManager.emitToUser(
            n.userId,
            SOCKET_EVENTS.NOTIFICATION_CREATED,
            n.toObject()
          );
        } catch (error) {
          logger.warn(
            `Failed to emit socket notification to user ${n.userId}:`,
            error
          );
        }
      })
    );

    return created.length;
  },

  /**
   * Notify all active users with a specific role name.
   */
  async notifyRole(params: NotifyRoleParams): Promise<number> {
    const role = await Role.findOne({ name: params.roleName });
    if (!role) {
      logger.warn(`notifyRole: role ${params.roleName} not found`);
      return 0;
    }

    const users = await User.find({
      role_id: role._id.toString(),
      status: UserStatus.ACTIVE,
    }).select('_id settings');

    const eligible = users.filter((u) =>
      shouldNotify(u as any, params.type, params.meta)
    );

    if (eligible.length === 0) return 0;

    const docs = eligible.map((u) => ({
      userId: u._id.toString(),
      type: params.type,
      message: params.message,
      redirectRoute: params.redirectRoute ?? null,
      redirectParams: params.redirectParams ?? null,
      meta: params.meta ?? {},
      isRead: false,
    }));

    const created = await Notification.insertMany(docs);

    await Promise.all(
      created.map(async (n) => {
        try {
          socketManager.emitToUser(
            n.userId,
            SOCKET_EVENTS.NOTIFICATION_CREATED,
            n.toObject()
          );
        } catch (error) {
          logger.warn(`Socket emit failed for ${n.userId}:`, error);
        }
      })
    );

    return created.length;
  },

  /**
   * Notify an explicit list of users.
   */
  async notifyMany(
    userIds: string[],
    params: Omit<NotifyUserParams, 'userId'>
  ): Promise<number> {
    if (userIds.length === 0) return 0;

    const users = await User.find({
      _id: { $in: userIds },
      status: UserStatus.ACTIVE,
    }).select('_id settings');

    const eligible = users.filter((u) =>
      shouldNotify(u as any, params.type, params.meta)
    );

    if (eligible.length === 0) return 0;

    const docs = eligible.map((u) => ({
      userId: u._id.toString(),
      type: params.type,
      message: params.message,
      redirectRoute: params.redirectRoute ?? null,
      redirectParams: params.redirectParams ?? null,
      meta: params.meta ?? {},
      isRead: false,
    }));

    const created = await Notification.insertMany(docs);

    await Promise.all(
      created.map(async (n) => {
        try {
          socketManager.emitToUser(
            n.userId,
            SOCKET_EVENTS.NOTIFICATION_CREATED,
            n.toObject()
          );
        } catch (error) {
          logger.warn(`Socket emit failed for ${n.userId}:`, error);
        }
      })
    );

    return created.length;
  },
};
