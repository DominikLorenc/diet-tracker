import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): Response => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Unexpected errors are not surfaced to the client (500 only), so log them
    // here or they vanish without a trace. Include method/url to match them
    // up with the failing request in Render logs.
    console.error(`[${req.method}] ${req.originalUrl} ->`, err);

    return res.status(500).json({ message: 'Internal server error' });
};
