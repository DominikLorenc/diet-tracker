import { z } from 'zod';

export const diaryEntrySchema = z.object({
    date: z.coerce.date(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    productId: z.uuid().optional(),
    recipeId: z.uuid().optional(),
    quantity: z.number().min(0),
});

export const dateDiarySchema = z.object({
    date: z.coerce.date(),
});

export const diaryIdSchema = z.uuid();
