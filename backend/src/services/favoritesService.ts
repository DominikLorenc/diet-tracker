import { Product, ProductFavorite, Recipe, RecipeFavorite } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const getFavoriteProductsService = async (
    userId: string,
): Promise<(ProductFavorite & { product: Product })[]> => {
    return prisma.productFavorite.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
};

export const addFavoriteProductService = async (
    userId: string,
    productId: string,
): Promise<ProductFavorite & { product: Product }> => {
    const exists = await prisma.productFavorite.findUnique({
        where: { userId_productId: { userId, productId } },
    });
    if (exists) throw new AppError('Product already in favorites', 409);

    return prisma.productFavorite.create({
        data: { userId, productId },
        include: { product: true },
    });
};

export const removeFavoriteProductService = async (userId: string, productId: string): Promise<ProductFavorite> => {
    const record = await prisma.productFavorite.findUnique({
        where: { userId_productId: { userId, productId } },
    });
    if (!record) throw new AppError('Favorite not found', 404);

    return prisma.productFavorite.delete({
        where: { userId_productId: { userId, productId } },
    });
};

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const getFavoriteRecipesService = async (userId: string): Promise<(RecipeFavorite & { recipe: Recipe })[]> => {
    return prisma.recipeFavorite.findMany({
        where: { userId },
        include: { recipe: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
    });
};

export const addFavoriteRecipeService = async (
    userId: string,
    recipeId: string,
): Promise<RecipeFavorite & { recipe: Recipe }> => {
    const exists = await prisma.recipeFavorite.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    });
    if (exists) throw new AppError('Recipe already in favorites', 409);

    return prisma.recipeFavorite.create({
        data: { userId, recipeId },
        include: {
            recipe: true,
        },
    });
};

export const removeFavoriteRecipeService = async (userId: string, recipeId: string): Promise<RecipeFavorite> => {
    const record = await prisma.recipeFavorite.findUnique({
        where: { userId_recipeId: { userId, recipeId } },
    });
    if (!record) throw new AppError('Favorite not found', 404);

    return prisma.recipeFavorite.delete({
        where: { userId_recipeId: { userId, recipeId } },
    });
};
