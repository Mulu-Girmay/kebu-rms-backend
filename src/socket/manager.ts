import type { Server, Socket } from 'socket.io';
import logger from '../config/winston.js';

class SocketManager {
  private io: Server | null = null;

  private readonly userSockets = new Map<string, Set<string>>();
  private readonly socketUsers = new Map<string, string>();

  initialize(io: Server): void {
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

  emitToUser(userId: string, event: string, paylod: unknown): void {
    this.ensureInitialized();

    this.io!.to(`user:${userId}`).emit(event, paylod);
  }

  emitToRoom(room: string, event: string, paylod: unknown): void {
    this.ensureInitialized();
    this.io!.to(room).emit(event, paylod);
  }

  joinRoom(socket: Socket, room: string): void {
    socket.join(room);
  }

  leavRoom(socket: Socket, room: string): void {
    socket.leave(room);
  }
  private ensureInitialized(): void {
    if (!this.io) {
      logger.error('SocketManager has not been initialized');
    }
  }
}

export const socketManager = new SocketManager();
