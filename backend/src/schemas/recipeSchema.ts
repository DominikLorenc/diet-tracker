import { z } from 'zod';
import { registry } from '../swagger';

export const recipeSchema = registry.register(
    'Recipe',
    z.object({
        name: z.string(),
        products: z.array(
            z.object({
                productId: z.uuid(),
                quantity: z.number(),
            }),
        ),
    }),
);

export const recipeIdSchema = z.uuid();
