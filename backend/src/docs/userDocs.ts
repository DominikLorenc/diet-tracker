import { registry, errorSchema } from '../swagger';
import {
    registerSchema,
    loginSchema,
    updateGoalsSchema,
    updateImageUrlSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../schemas/userSchema';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

registry.registerPath({
    method: 'post',
    path: '/users/register',
    tags: ['Users'],
    summary: 'Register a new user',
    request: {
        body: { content: { 'application/json': { schema: registerSchema } } },
    },
    responses: {
        201: {
            description: 'User registered',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        user: z.object({ id: z.string(), username: z.string(), email: z.string() }),
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        409: { description: 'Email or username already exists', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users/login',
    tags: ['Users'],
    summary: 'Login user',
    request: {
        body: { content: { 'application/json': { schema: loginSchema } } },
    },
    responses: {
        200: {
            description: 'Logged in, token set in cookie',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        user: z.object({ id: z.string(), username: z.string(), email: z.string(), role: z.string() }),
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Invalid credentials', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users/forgot-password',
    tags: ['Users'],
    summary: 'Request a password reset link',
    request: {
        body: { content: { 'application/json': { schema: forgotPasswordSchema } } },
    },
    responses: {
        // Always 200 regardless of whether the email exists — anti-enumeration.
        // The frontend must never be able to tell registered emails apart.
        200: {
            description: 'If the email exists, a reset link has been sent',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Validation error', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/users/reset-password',
    tags: ['Users'],
    summary: 'Reset password using a token',
    request: {
        body: { content: { 'application/json': { schema: resetPasswordSchema } } },
    },
    responses: {
        200: {
            description: 'Password reset successfully',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        // Covers both Zod validation failures and an invalid/expired/used token.
        400: { description: 'Validation error or invalid/expired token', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/users/me',
    tags: ['Users'],
    summary: 'Get current user',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'User data',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        user: registry.register(
                            'UserProfile',
                            z.object({
                                id: z.string(),
                                username: z.string(),
                                email: z.string(),
                                role: z.string(),
                                imageUrl: z.string().nullable(),
                                createdAt: z.string(),
                                updatedAt: z.string(),
                                userGoals: z
                                    .object({
                                        id: z.string(),
                                        dailyCaloriesGoal: z.number().nullable(),
                                        dailyProteinGoal: z.number().nullable(),
                                        dailyCarbsGoal: z.number().nullable(),
                                        dailyFatGoal: z.number().nullable(),
                                    })
                                    .nullable(),
                            }),
                        ),
                    }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/users/image',
    tags: ['Users'],
    summary: 'Update profile image',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: updateImageUrlSchema } } },
    },
    responses: {
        200: {
            description: 'Image updated',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        updated: z.string(),
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/users/goals',
    tags: ['Users'],
    summary: 'Update nutrition goals',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: updateGoalsSchema } } },
    },
    responses: {
        200: {
            description: 'Goals updated',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        updated: z.object({
                            id: z.string(),
                            dailyCaloriesGoal: z.number().nullable(),
                            dailyProteinGoal: z.number().nullable(),
                            dailyCarbsGoal: z.number().nullable(),
                            dailyFatGoal: z.number().nullable(),
                        }),
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/users/logout',
    tags: ['Users'],
    summary: 'Logout user',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'Logged out',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
