import { z } from 'zod';

// Schema produktu tak jak go zwraca Prisma (Decimal → string w JSON)
const productResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.string(),
    carbs: z.string(),
    protein: z.string(),
    fat: z.string(),
    imageUrl: z.string(),
    createdAt: z.string(),
});

export const productFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    createdAt: z.string(),
    product: productResponseSchema,
});

const recipeResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
});

export const recipeFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    recipeId: z.string(),
    createdAt: z.string(),
    recipe: recipeResponseSchema,
});
