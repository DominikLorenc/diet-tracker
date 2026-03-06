import { z } from 'zod';

export const recipeSchema = z.object({
    name: z.string(),
    products: z.array(
        z.object({
            productId: z.uuid(),
            quantity: z.number(),
        }),
    ),
});

export const recipeIdSchema = z.uuid();
