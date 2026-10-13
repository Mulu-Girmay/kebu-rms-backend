import { SOCKET_EVENTS } from './events.js';
import { KITCHEN_ROOM, USER_ROOM } from './rooms.js';
import { socketManager } from './manager.js';
import type { SocketServer } from '../types/socket.types.js';
import logger from '../config/winston.js';

export const registerSockethandlers = (io: SocketServer): void => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    const userId = socket.data.userId;
    const sessionExpiresAt = socket.data.sessionExpiresAt;
    if (
      typeof userId !== 'string' ||
      !userId ||
      typeof sessionExpiresAt !== 'number' ||
      sessionExpiresAt <= Date.now()
    ) {
      socket.disconnect(true);
      return;
    }

    logger.info(`Socket connected: ${socket.id} (user ${userId})`);
    let sessionTimer: ReturnType<typeof setTimeout> | undefined;
    const disconnectExpiredSession = () => {
      const remainingTime = sessionExpiresAt - Date.now();
      if (remainingTime <= 0) {
        logger.info(
          `Socket emit: ${SOCKET_EVENTS.SESSION_EXPIRED} to ${socket.id}`
        );
        socket.emit(SOCKET_EVENTS.SESSION_EXPIRED);
        socket.disconnect(true);
        return;
      }
      sessionTimer = setTimeout(
        disconnectExpiredSession,
        Math.min(remainingTime, 2 ** 31 - 1)
      );
      sessionTimer.unref();
    };
    socketManager.addUserSocket(userId, socket.id);
    socket.join(USER_ROOM(userId));

    socket.on(SOCKET_EVENTS.ROOM_JOIN, (room: unknown) => {
      logger.info(
        `Socket received: ${SOCKET_EVENTS.ROOM_JOIN} from ${socket.id}`
      );
      if (room === KITCHEN_ROOM && socket.data.canAccessKitchen) {
        socketManager.joinRoom(socket, KITCHEN_ROOM);
        logger.info(`Socket ${socket.id} joined room ${KITCHEN_ROOM}`);
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (room: unknown) => {
      logger.info(
        `Socket received: ${SOCKET_EVENTS.ROOM_LEAVE} from ${socket.id}`
      );
      if (room === KITCHEN_ROOM) {
        socketManager.leaveRoom(socket, KITCHEN_ROOM);
        logger.info(`Socket ${socket.id} left room ${KITCHEN_ROOM}`);
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      logger.info(`Socket disconnected: ${socket.id} (user ${userId})`);
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      socketManager.removeUserSocket(socket.id);
    });

    disconnectExpiredSession();
  });
};
