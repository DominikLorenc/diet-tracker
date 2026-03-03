import { z } from 'zod';

export const mealSchema = z.object({
    name: z.string().min(1, 'Name is required'),
});

export const mealIdSchema = z.uuid({ message: 'Meal ID must be a valid UUID' });
