import { z } from 'zod';
import { registry } from '../swagger';

const userSchema = registry.register(
    'User',
    z.object({
        username: z
            .string({
                error: (issue) => (issue.input === undefined ? 'Username is required' : 'Username must be a string'),
            })
            .trim()
            .min(1, 'Username cannot be empty'),

        email: z
            .string({
                error: (issue) => (issue.input === undefined ? 'Email is required' : 'Email must be a string'),
            })
            .trim()
            .pipe(z.email('Please provide a valid email address')),

        password: z
            .string({
                error: (issue) => (issue.input === undefined ? 'Password is required' : 'Password must be a string'),
            })
            .min(8, 'Password must be at least 8 characters long')
            .max(64, 'Password cannot exceed 64 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    }),
);

export const registerSchema = userSchema;

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1, 'Password required'),
});

export const updateGoalsSchema = z.object({
    dailyCaloriesGoal: z.number().int().min(0),
    dailyProteinGoal: z.number().int().min(0),
    dailyCarbsGoal: z.number().int().min(0),
    dailyFatGoal: z.number().int().min(0),
});

export const updateImageUrlSchema = z.object({
    imageUrl: z.string().min(1, 'Image URL is required'),
});

export const createUserRecipeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    products: z.array(
        z.object({
            productId: z.uuid(),
            quantity: z.number().int().min(1),
        }),
    ),
});

export const updateUserRecipeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    products: z.array(
        z.object({
            productId: z.uuid(),
            quantity: z.number().int().min(1),
        }),
    ),
});

export const copyRecipeSchema = z.object({
    sourceRecipeId: z.uuid(),
});

export const UUIDScheme = z.uuid();

// Runtime shape of the decoded JWT payload. jwt.verify() only proves the token
// was signed with our secret — it does NOT guarantee the payload shape. We
// assert it here so a structurally-wrong (but validly-signed) token is rejected
// at the boundary instead of leaking `undefined` into `req.userId`/`req.role`.
export const JWTSchema = z.object({
    id: UUIDScheme,
    role: z.enum(['ADMIN', 'USER']),
});
