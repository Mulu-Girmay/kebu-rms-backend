import { Server } from 'socket.io';
import { type Server as HttpServer } from 'node:http';
import { config } from '../config/environments.js';
import { socketManager } from './manager.js';
import { registerSockethandlers } from './handler.js';
import { socketAuthMiddleware } from './middleware.js';
import logger from '../config/winston.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketServer,
} from '../types/socket.types.js';

export const initializeSocket = (server: HttpServer): SocketServer => {
  const allowedOrigins = new Set([
    new URL(config.clientUrl).origin,
    ...(config.env === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173']
      : []),
  ]);
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    Record<never, never>,
    SocketData
  >(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.has(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Origin not allowed'));
      },
      credentials: true,
    },
  });

  socketManager.initialize(io);
  io.use(socketAuthMiddleware);
  registerSockethandlers(io);
  logger.info('Socket.IO initialized with authentication');

  return io;
};
