import { Request, Response, NextFunction, CookieOptions } from 'express';
import { loginSchema, registerSchema, updateGoalsSchema, updateImageUrlSchema } from '../schemas/userSchema';
import { registerUser, loginUser, getUserById, updateGoalsService, updateImageUrl } from '../services/userService';
import { AppError } from '../utils/AppError';

// Single source of truth for auth-cookie attributes, shared by login (set) and
// logout (clear) so they can never drift apart. Excludes maxAge on purpose —
// that is login-specific; clearCookie deletes by expiring the cookie itself.
const getCookieOptions = (): CookieOptions => {
    return {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        secure: process.env.NODE_ENV === 'production',
    };
};

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
                ...getCookieOptions(),
                maxAge: 60 * 60 * 1000 * 5,
            })
            .json({ message: 'User logged in', user: userData });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: Request, res: Response) => {
    return res.clearCookie('token', getCookieOptions()).json({ message: 'User logged out' });
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

export const updateGoals = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const validation = updateGoalsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.issues });
        }

        const { dailyCaloriesGoal, dailyProteinGoal, dailyCarbsGoal, dailyFatGoal } = validation.data;
        const updated = await updateGoalsService(
            userId,
            dailyCaloriesGoal,
            dailyProteinGoal,
            dailyCarbsGoal,
            dailyFatGoal,
        );
        // Serwis zwraca całego usera (z zagnieżdżonym userGoals), ale kontrakt (OpenAPI)
        // deklaruje `updated` jako sam obiekt celów — odsyłamy więc tylko userGoals.
        return res.status(200).json({ message: 'Goals updated', updated: updated.userGoals });
    } catch (error) {
        next(error);
    }
};

export const updateImageUrlController = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const validation = updateImageUrlSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ message: validation.error.issues });
        }

        const { imageUrl } = validation.data;
        const updated = await updateImageUrl(userId, imageUrl);
        return res.status(200).json({ message: 'Image URL updated', updated });
    } catch (error) {
        next(error);
    }
};
