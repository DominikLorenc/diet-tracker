import { UserRecipe, Prisma } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

type ProductInput = {
    productId: string;
    quantity: number;
};

type UserRecipeWithIngredients = Prisma.UserRecipeGetPayload<{
    include: {
        userRecipeIngredients: {
            include: { product: true };
        };
    };
}>;

export const getUserRecipes = async (userId: string): Promise<UserRecipeWithIngredients[]> => {
    const userRecipes = await prisma.userRecipe.findMany({
        where: {
            userId,
        },
        include: {
            userRecipeIngredients: {
                include: { product: true },
            },
        },
    });
    return userRecipes;
};

export const createUserRecipe = async (userId: string, name: string, products: ProductInput[]): Promise<UserRecipe> => {
    const userRecipe = await prisma.userRecipe.create({
        data: {
            userId,
            name,
            userRecipeIngredients: {
                createMany: {
                    data: products.map(({ productId, quantity }) => ({
                        productId,
                        quantity,
                    })),
                },
            },
        },
    });
    return userRecipe;
};

export const copyRecipe = async (userId: string, sourceRecipeId: string): Promise<UserRecipe> => {
    const sourceRecipe = await prisma.recipe.findUnique({
        where: {
            id: sourceRecipeId,
        },
        include: {
            products: {
                include: { product: true },
            },
        },
    });

    if (!sourceRecipe) {
        throw new AppError('Source recipe not found', 404);
    }

    const userRecipe = await prisma.userRecipe.create({
        data: {
            userId,
            name: sourceRecipe.name,
            sourceRecipeId: sourceRecipeId,
            userRecipeIngredients: {
                createMany: {
                    data: sourceRecipe.products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
        },
    });
    return userRecipe;
};

export const updateUserRecipe = async (
    userId: string,
    userRecipeId: string,
    name: string,
    products: ProductInput[],
): Promise<UserRecipe> => {
    const userRecipe = await prisma.userRecipe.update({
        where: {
            id: userRecipeId,
            userId,
        },
        data: {
            name,
            userRecipeIngredients: {
                deleteMany: {},
                createMany: {
                    data: products.map(({ productId, quantity }) => ({
                        productId,
                        quantity,
                    })),
                },
            },
        },
    });
    return userRecipe;
};

export const deleteUserRecipe = async (userId: string, userRecipeId: string): Promise<UserRecipe> => {
    const userRecipe = await prisma.userRecipe.delete({
        where: {
            id: userRecipeId,
            userId,
        },
    });
    return userRecipe;
};
