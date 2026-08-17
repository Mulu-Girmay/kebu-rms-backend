import type{ NextFunction, Request, Response } from "express";

export type AsyncHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

export const asyncHandler = (handler:AsyncHandler) =>
     (req: Request, res:Response, next:NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next)
     }