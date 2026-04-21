import { User } from '../generated/prisma';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            role: User['role'];
        }
    }
}

export {};
