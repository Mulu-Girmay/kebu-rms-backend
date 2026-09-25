import type { Socket } from 'socket.io';
import { parseCookie } from 'cookie';

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
  };
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication required'));
    }
    const cookies = parseCookie(cookieHeader);
    const token = cookies.access_token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    // const payload = verifyAccessToken(token);
    const payload = undefined as { sub?: string } | undefined;

    if (!payload?.sub) {
      return next(new Error('Invalid authentication token'));
    }

    socket.data.userId = String(payload.sub);

    next();
  } catch {
    next(new Error('Socket authentication failed'));
  }
};
