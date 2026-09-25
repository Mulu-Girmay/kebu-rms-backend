import type { Request, Response, NextFunction } from 'express';
import { validationResult, type ValidationChain } from 'express-validator';
import { APIError } from '../errors/APIError.js';

export const validateRequest = (
  validations: ValidationChain | ValidationChain[]
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    const chainList = Array.isArray(validations) ? validations : [validations];

    await Promise.all(chainList.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessage = errors
        .array()
        .map((err) => err.msg)
        .join(', ');
      return next(new APIError(errorMessage, 400));
    }

    next();
  };
};
