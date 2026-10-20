import { z } from 'zod';
import { registry } from '../swagger';
import { RecipeCategory } from '../generated/prisma';

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
        steps: z.array(z.string().trim().min(1)).optional().default([]),
        // No default on purpose: a PATCH without categories must keep the saved ones
        categories: z.array(z.enum(RecipeCategory)).max(Object.values(RecipeCategory).length).optional(),
    }),
);

export const recipeListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .default(20)
        .transform((v) => Math.min(v, 100)),
    search: z.string().trim().max(100).optional(),
    categories: z
        .string()
        .transform((value) => {
            const parts = value
                .split(',')
                .map((part) => part.trim())
                .filter((part) => part.length > 0);
            return [...new Set(parts)];
        })
        .pipe(z.array(z.enum(RecipeCategory)).max(Object.values(RecipeCategory).length))
        .optional(),
});

// Same search rules as the list, so the counts always match what the list would return
export const recipeCategoryCountsQuerySchema = recipeListQuerySchema.pick({ search: true });

export const recipeIdSchema = z.uuid();
