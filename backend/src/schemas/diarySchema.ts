import { z } from 'zod';
import { registry } from '../swagger';

export const diaryEntrySchema = registry.register(
    'DiaryEntry',
    z
        .object({
            date: z.coerce.date(),
            mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
            productId: z.uuid().optional(),
            recipeId: z.uuid().optional(),
            userRecipeId: z.uuid().optional(),
            quantity: z.number().min(0),
        })
        .refine(
            (data) =>
                Number(Boolean(data.productId)) +
                    Number(Boolean(data.recipeId)) +
                    Number(Boolean(data.userRecipeId)) ===
                1,
            {
                message: 'Exactly one of productId, recipeId, userRecipeId must be provided',
            },
        ),
);

export const dateDiarySchema = z.object({
    date: z.coerce.date(),
});

export const diaryIdSchema = z.uuid();

export const toggleEatenSchema = z.object({
    isEaten: z.boolean(),
});
