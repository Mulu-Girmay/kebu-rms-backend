import type { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/events.js';

export interface SocketData {
  userId: string;
  status: string;
  sessionExpiresAt: number;
  canAccessKitchen: boolean;
}

export interface ServerToClientEvents {
  [SOCKET_EVENTS.SESSION_EXPIRED]: () => void;
  [SOCKET_EVENTS.ORDER_CREATED]: (payload: unknown) => void;
  [SOCKET_EVENTS.ORDER_STATUS_CHANGED]: (payload: unknown) => void;
  [SOCKET_EVENTS.SERVICE_PAUSE_TOGGLED]: (payload: {
    isOrdersPaused: boolean;
    pausedAt: Date | null;
    pauseReason: string | null;
  }) => void;
}

export interface ClientToServerEvents {
  [SOCKET_EVENTS.ROOM_JOIN]: (room: string) => void;
  [SOCKET_EVENTS.ROOM_LEAVE]: (room: string) => void;
}

type InterServerEvents = Record<never, never>;

export type SocketServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
