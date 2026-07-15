import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import { JWTSchema } from '../schemas/userSchema';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = verifyToken(token);

        const JWT = JWTSchema.safeParse(decoded);

        if (!JWT.success) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.userId = JWT.data.id;
        req.role = JWT.data.role;

        next();
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Error' });
    }
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (_error) {
        throw new AppError('Unauthorized', 401);
    }
};
