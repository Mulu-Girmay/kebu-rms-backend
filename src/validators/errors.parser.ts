import type { Schema } from 'joi';
import type { Request, Response, NextFunction } from 'express';
import { APIError } from '../errors/APIError.js';

export const validateRequest = (
  schema: Schema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message.replace(/['"]/g, ''))
        .join(', ');
      return next(new APIError(errorMessage, 400));
    }

    req[property] = value;
    next();
  };
};
