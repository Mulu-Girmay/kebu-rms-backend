import { Server } from 'socket.io';
import { SOCKET_EVENTS } from './events.js';
import { KITCHEN_ROOM, userRoom } from './rooms.js';
import { socketManager } from './manager.js';

export const registerSockethandlers = (io: Server): void => {
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

    let sessionTimer: ReturnType<typeof setTimeout> | undefined;
    const disconnectExpiredSession = () => {
      const remainingTime = sessionExpiresAt - Date.now();
      if (remainingTime <= 0) {
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
    socket.join(userRoom(userId));

    socket.on(SOCKET_EVENTS.ROOM_JOIN, (room: unknown) => {
      if (room === KITCHEN_ROOM && socket.data.canAccessKitchen) {
        socketManager.joinRoom(socket, KITCHEN_ROOM);
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_LEAVE, (room: unknown) => {
      if (room === KITCHEN_ROOM) {
        socketManager.leaveRoom(socket, KITCHEN_ROOM);
      }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      if (sessionTimer) {
        clearTimeout(sessionTimer);
      }
      socketManager.removeUserSocket(socket.id);
    });

    disconnectExpiredSession();
  });
};
