import { NextFunction, Request, Response } from 'express';

import { Role } from '../generated/prisma';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.userId && req.role === Role.ADMIN) {
        next();
    } else {
        res.status(403).json({ message: 'You are not authorized to access this resource.' });
    }
};
