import { z } from 'zod';

export const diaryEntrySchema = z.object({
    mealId: z.uuid(),
    date: z.coerce.date(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER']),
});

export const dateDiarySchema = z.object({
    date: z.coerce.date(),
});

export const diaryIdSchema = z.uuid();
