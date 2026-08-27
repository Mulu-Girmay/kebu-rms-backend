import type { NextFunction, Request, Response } from 'express';
import { validationResult, type ValidationError } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",

            errors: errors.array().map((error: ValidationError) => { 

                if (error.type === 'field') {
                    return {
                        field: error.path,
                        location: error.location,
                        message: error.msg,
                    };
                }
                
                // Fallback for generic/custom object-level errors
                return {
                    field: 'root',
                    message: error.msg,
                };
            }),
        });
    }
    
    return next();
};
