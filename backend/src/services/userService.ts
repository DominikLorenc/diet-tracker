import { Prisma, User, UserGoal } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userExists = async (email: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });
    return !!user;
};

export const registerUser = async (user: Prisma.UserCreateInput): Promise<User> => {
    const exists = await userExists(user.email);
    if (exists) {
        throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await prisma.user.create({
        data: {
            ...user,
            password: hashedPassword,
        },
    });

    return newUser;
};

export const loginUser = async (
    email: string,
    password: string,
): Promise<Pick<User, 'email' | 'username' | 'role'> & { token: string }> => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
        omit: {
            password: false,
        },
    });
    if (!user) {
        throw new AppError('Invalid email or password', 401);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
        throw new AppError('Invalid email or password', 401);
    }

    const { username, role } = user;

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET!, {
        expiresIn: '5h',
    });

    return {
        username,
        role,
        email,
        token,
    };
};

export const getUserById = async (id: string): Promise<User & { userGoals: UserGoal | null }> => {
    const user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        include: {
            userGoals: true,
        },
    });
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

export const updateGoalsService = async (
    userId: string,
    dailyCaloriesGoal: number,
    dailyProteinGoal: number,
    dailyCarbsGoal: number,
    dailyFatGoal: number,
): Promise<User & { userGoals: UserGoal | null }> => {
    const updated = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            userGoals: {
                upsert: {
                    update: {
                        dailyCaloriesGoal,
                        dailyProteinGoal,
                        dailyCarbsGoal,
                        dailyFatGoal,
                    },
                    create: {
                        dailyCaloriesGoal,
                        dailyProteinGoal,
                        dailyCarbsGoal,
                        dailyFatGoal,
                    },
                },
            },
        },
        include: {
            userGoals: true,
        },
    });

    return updated;
};

export const updateImageUrl = async (userId: string, imageUrl: string): Promise<string> => {
    const updated = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            imageUrl,
        },
    });

    return updated.imageUrl;
};
