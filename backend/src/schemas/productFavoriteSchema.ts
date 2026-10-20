import { z } from 'zod';
import { RecipeCategory } from '../generated/prisma';
import { productResponseSchema, decimalString } from '../docs/sharedSchemas';

export const productFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    createdAt: z.string(),
    product: productResponseSchema,
});

const favoriteRecipeSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    steps: z.array(z.string()),
    categories: z.array(z.enum(RecipeCategory)),
});

// POST returns the bare recipe
export const recipeFavoriteSchema = z.object({
    id: z.string(),
    userId: z.string(),
    recipeId: z.string(),
    createdAt: z.string(),
    recipe: favoriteRecipeSchema,
});

// GET also includes the ingredients, so the list can show calories
export const recipeFavoriteWithProductsSchema = recipeFavoriteSchema.extend({
    recipe: favoriteRecipeSchema.extend({
        products: z.array(
            z.object({
                id: z.string(),
                recipeId: z.string(),
                productId: z.string(),
                quantity: decimalString,
                createdAt: z.string(),
                product: productResponseSchema,
            }),
        ),
    }),
});
