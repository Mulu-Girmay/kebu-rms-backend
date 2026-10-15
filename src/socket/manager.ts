import logger from '../config/winston.js';
import { USER_ROOM } from './rooms.js';
import type {
  AppSocket,
  ServerToClientEvents,
  SocketServer,
} from '../types/socket.types.js';

class SocketManager {
  private io: SocketServer | null = null;

  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();

  initialize(io: SocketServer): void {
    this.io = io;
  }
  addUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);

    if (sockets) {
      sockets.add(socketId);
    } else {
      this.userSockets.set(userId, new Set([socketId]));
    }
    this.socketUsers.set(socketId, userId);
  }

  removeUserSocket(socketId: string): void {
    const userId = this.socketUsers.get(socketId);

    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);

      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.socketUsers.delete(socketId);
  }

  getUserSockets(userId: string): string[] {
    return [...(this.userSockets.get(userId) ?? [])];
  }

  getSocketUser(socketId: string): string | undefined {
    return this.socketUsers.get(socketId);
  }

  isUserOnline(userId: string): boolean {
    return (
      this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0
    );
  }

  emitToAll<E extends keyof ServerToClientEvents>(
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    logger.info(
      `Socket emit broadcast: ${String(event)} to all connected users`
    );
    this.getServer().emit(event, ...args);
  }
  emitToUser<E extends keyof ServerToClientEvents>(
    userId: string,
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    logger.info(`Socket emit: ${String(event)} to user ${userId}`);
    this.getServer()
      .to(USER_ROOM(userId))
      .emit(event, ...args);
  }

  emitToRoom<E extends keyof ServerToClientEvents>(
    room: string,
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ): void {
    logger.info(`Socket emit: ${String(event)} to room ${room}`);
    this.getServer()
      .to(room)
      .emit(event, ...args);
  }

  joinRoom(socket: AppSocket, room: string): void {
    socket.join(room);
  }

  leaveRoom(socket: AppSocket, room: string): void {
    socket.leave(room);
  }
  private getServer(): SocketServer {
    if (!this.io) {
      const error = new Error('SocketManager has not been initialized');
      logger.error(error.message);
      throw error;
    }
    return this.io;
  }
}

export const socketManager = new SocketManager();
