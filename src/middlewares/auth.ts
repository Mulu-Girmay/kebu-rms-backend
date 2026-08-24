import type { Request, Response, NextFunction } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { auth, type Session } from '../config/auth.js';

export interface AuthenticatedRequest extends Request {
  user?: Session['user'];
  session?: Session['session'];
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
      return;
    }

    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session',
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
