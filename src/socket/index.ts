import { Server } from 'socket.io';
import { type Server as HttpServer } from 'node:http';
import { config } from '../config/environments.js';
import { socketManager } from './manager.js';
import { registerSockethandlers } from './handler.js';
import { socketAuthMiddleware } from './middleware.js';

export const initializeSocket = (server: HttpServer): Server => {
  const allowedOrigins = new Set([
    new URL(config.clientUrl).origin,
    ...(config.env === 'development'
      ? ['http://localhost:5173', 'http://127.0.0.1:5173']
      : []),
  ]);
  const io = new Server(server, {
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
  return io;
};
