import { Request, Response, NextFunction } from 'express';
import { loginSchema, registerSchema } from '../schemas/userSchema';
import { registerUser, loginUser, getUserById } from '../services/userService';
import { AppError } from '../utils/AppError';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues });
    }

    try {
        const { email, username, password } = result.data;

        const user = await registerUser({
            email,
            username,
            password,
        });

        if (!user) {
            throw new AppError('User not added', 500);
        }

        return res.status(201).json({ message: 'User added', user });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: result.error.issues });
    }

    try {
        const { email, password } = result.data;

        const user = await loginUser(email, password);

        const { token, ...userData } = user;

        return res
            .cookie('token', token, {
                httpOnly: true,
                maxAge: 60 * 60 * 1000,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
            })
            .json({ message: 'User logged in', user: userData });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response) => {
    return res.clearCookie('token').json({ message: 'User logged out' });
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await getUserById(userId);
        return res.status(200).json({ message: 'User found', user });
    } catch (error) {
        next(error);
    }
};
