import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { APIError } from '../errors/APIError.js';

export const handleValidationErrors: RequestHandler = (
  req,
  _res,
  next
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];

    next(new APIError(firstError?.msg ?? 'Validation failed', 400));
    return;
  }

  next();
};
