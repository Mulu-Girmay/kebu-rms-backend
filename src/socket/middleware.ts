import type { Socket } from 'socket.io';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { Role } from '../models/role/index.js';
import logger from '../config/winston.js';
import { Types } from 'mongoose';

interface RolePermission {
  resource?: string;
  action?: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    canAccessKitchen?: boolean;
    sessionExpiresAt?: number;
  };
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(socket.handshake.headers),
      query: { disableCookieCache: true },
    });

    if (!session?.user.id) {
      return next(new Error('Authentication required'));
    }

    socket.data.userId = session.user.id;
    socket.data.sessionExpiresAt = session.session.expiresAt.getTime();
    if (
      typeof session.user.role_id === 'string' &&
      Types.ObjectId.isValid(session.user.role_id)
    ) {
      const role = await Role.findById(session.user.role_id)
        .populate<{ permissions: RolePermission[] }>(
          'permissions',
          'resource action'
        )
        .select('name permissions')
        .lean();
      if (role) {
        socket.data.canAccessKitchen =
          ['admin', 'super_admin', 'kitchen_admin'].includes(role.name) ||
          role.permissions.some(
            (permission) =>
              permission.resource === 'orders' &&
              (permission.action === 'read' || permission.action === 'read_all')
          );
      }
    }

    next();
  } catch (error) {
    logger.warn('Socket authentication failed', error);
    next(new Error('Socket authentication failed'));
  }
};
