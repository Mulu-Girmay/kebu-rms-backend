import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '../config/auth.js';
import { Role } from '../models/role/index.js';
import { User } from '../models/users/index.js';
import { evaluateRolePermission } from '../config/authorization.js';
import { ACTIONS, RESOURCES } from '../utils/constants.js';
import logger from '../config/winston.js';
import type { AppSocket } from '../types/socket.types.js';

export const socketAuthMiddleware = async (
  socket: AppSocket,
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

    const user = await User.findById(session.user.id).select('status role_id');

    if (!user) {
      return next(new Error('User not found'));
    }

    if (user.status !== 'active') {
      return next(
        new Error(`Account is ${user.status}. Please contact support.`)
      );
    }

    const expiresAt = session.session.expiresAt.getTime();
    if (expiresAt <= Date.now()) {
      return next(new Error('Authentication required'));
    }

    let canAccessKitchen = false;
    if (user.role_id) {
      const role = await Role.findById(user.role_id).select('name');
      if (role) {
        canAccessKitchen = await evaluateRolePermission(
          role.name,
          RESOURCES.ORDERS,
          ACTIONS.READ
        );
      }
    }

    socket.data.userId = session.user.id;
    socket.data.status = user.status;
    socket.data.sessionExpiresAt = expiresAt;
    socket.data.canAccessKitchen = canAccessKitchen;

    logger.info(`Socket authenticated: ${session.user.id} (${socket.id})`);

    next();
  } catch (error) {
    logger.warn(
      `Socket auth failed for ${socket.id}: ${
        error instanceof Error ? error.message : 'unknown'
      }`
    );
    next(new Error('Authentication failed'));
  }
};
