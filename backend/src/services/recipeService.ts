import { Recipe } from '../generated/prisma';
import { Prisma } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

const recipeExists = async (name: string): Promise<boolean> => {
    const recipe = await prisma.recipe.findUnique({
        where: {
            name: name,
        },
    });
    return !!recipe;
};

type CreateRecipeInput = {
    name: string;
    products: {
        productId: string;
        quantity: number;
    }[];
};

type RecipeWithProducts = Prisma.RecipeGetPayload<{
    include: { products: { include: { product: true } } };
}>;

export const createRecipeService = async (recipe: CreateRecipeInput): Promise<Recipe> => {
    const exists = await recipeExists(recipe.name);
    if (exists) {
        throw new AppError('Recipe already exists', 409);
    }

    const newRecipe = await prisma.recipe.create({
        data: {
            name: recipe.name,
            products: {
                create: recipe.products.map((product) => ({
                    productId: product.productId,
                    quantity: product.quantity,
                })),
            },
        },
    });
    return newRecipe;
};

export const getAllRecipes = async (): Promise<RecipeWithProducts[]> => {
    const recipes = await prisma.recipe.findMany({
        include: {
            products: {
                include: { product: true },
            },
        },
    });

    return recipes;
};

export const getRecipeById = async (id: string): Promise<RecipeWithProducts> => {
    const recipe = await prisma.recipe.findUnique({
        where: {
            id: id,
        },
        include: {
            products: {
                include: { product: true },
            },
        },
    });
    if (!recipe) {
        throw new AppError('Recipe not found', 404);
    }

    return recipe;
};

export const updateRecipeValues = async (id: string, recipe: CreateRecipeInput): Promise<Recipe> => {
    const recipeToUpdate = await getRecipeById(id);

    const name = recipe?.name;

    if (typeof name === 'string' && name !== recipeToUpdate.name) {
        const exists = await recipeExists(name);
        if (exists) {
            throw new AppError('Recipe already exists', 409);
        }
    }

    try {
        const updatedRecipe = await prisma.recipe.update({
            where: {
                id: id,
            },
            data: {
                name: recipe.name,
                products: {
                    deleteMany: {},
                    create: recipe.products.map((product) => ({
                        productId: product.productId,
                        quantity: product.quantity,
                    })),
                },
            },
        });

        return updatedRecipe;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new AppError('Recipe already exists', 409);
        }
        throw error;
    }
};

export const deleteRecipeService = async (id: string): Promise<Recipe> => {
    await getRecipeById(id);

    const deletedRecipe = await prisma.recipe.delete({
        where: { id },
    });
    return deletedRecipe;
};
