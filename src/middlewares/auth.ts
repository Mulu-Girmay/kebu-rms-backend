import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, type Session } from '../config/auth.js';
import { APIError } from '../errors/APIError.js';

export interface AuthenticatedRequest extends Request {
  user?: Session['user'];
  session?: Session['session'];
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return next(new APIError('Unauthorized: Authentication required', 401));
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    next(new APIError('Unauthorized: Invalid or expired session', 401));
  }
};
