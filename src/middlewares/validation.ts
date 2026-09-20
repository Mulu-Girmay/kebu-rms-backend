import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { APIError } from '../errors/APIError.js';

export const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    if (firstError) {
      return next(new APIError(firstError.msg, 400));
    }
  }

  next();
};
