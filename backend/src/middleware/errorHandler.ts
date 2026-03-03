import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): Response => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
};
