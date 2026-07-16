import { Prisma, User, UserGoal } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { hashToken } from '../utils/hashToken';
import { sendPasswordResetEmail } from './emailService';

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

export const requestPasswordReset = async (email: string): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = hashToken(token);
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;
        await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                expiresAt,
                hash: hashedToken,
            },
        });

        try {
            await sendPasswordResetEmail(user.email, resetLink);
        } catch (err) {
            // Deliberate swallow — but LOGGED, which is what makes it safe, not the
            // "silent success" antipattern. Anti-enumeration requires the HTTP response
            // to be identical whether the email exists or delivery failed; leaking a 500
            // only for real accounts would tell an attacker which emails are registered.
            // We hide the failure from the attacker, but never from ourselves (ops logs).
            console.error('Password reset email failed to send:', err);
        }
    }
};

export const resetPasswordService = async (token: string, password: string): Promise<void> => {
    const hashedToken = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: {
            hash: hashedToken,
        },
    });

    if (!resetToken || resetToken.expiresAt < new Date() || resetToken.isUsed) {
        throw new AppError('Invalid token', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.$transaction([
        prisma.passwordResetToken.update({
            where: {
                hash: hashedToken,
            },
            data: {
                isUsed: true,
            },
        }),
        prisma.user.update({
            where: {
                id: resetToken.userId,
            },
            data: {
                password: hashedPassword,
            },
        }),
    ]);
};
