import { Recipe, RecipeCategory } from '../generated/prisma';
import { Prisma } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { toDecimalSafe } from '../utils/toDecimalSafe';

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
    steps: string[];
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
            steps: recipe.steps,
            products: {
                create: recipe.products.map((product) => toDecimalSafe(product, ['quantity'])),
            },
        },
    });
    return newRecipe;
};

// LIKE treats % and _ as wildcards and Prisma's `contains` passes them through,
// so escape them to make a search for "50%" match literally in both list and counts
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

type RecipeListQuery = {
    page: number;
    limit: number;
    search?: string;
    categories?: RecipeCategory[];
};

type RecipeListResult = { recipes: RecipeWithProducts[]; total: number; page: number; limit: number };

export const getAllRecipes = async ({
    page,
    limit,
    search,
    categories,
}: RecipeListQuery): Promise<RecipeListResult> => {
    // Each optional filter adds one condition; AND of zero conditions matches everything
    const filters: Prisma.RecipeWhereInput[] = [];
    if (search) {
        filters.push({ name: { contains: escapeLikePattern(search), mode: 'insensitive' } });
    }
    if (categories && categories.length > 0) {
        filters.push({ categories: { hasSome: categories } });
    }
    const where: Prisma.RecipeWhereInput = { AND: filters };

    const [recipes, total] = await prisma.$transaction([
        prisma.recipe.findMany({
            where,
            // Stable order is required, otherwise pages can repeat or skip recipes
            orderBy: { name: 'asc' },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                products: {
                    include: { product: true },
                },
            },
        }),
        prisma.recipe.count({ where }),
    ]);

    return { recipes, total, page, limit };
};

type RecipeCategoryCount = { category: RecipeCategory; count: number };

export const getRecipeCategoryCounts = async (search?: string): Promise<RecipeCategoryCount[]> => {
    // Counts follow the search text but deliberately ignore selected categories:
    // with OR filtering, a category's count must not shrink when another one is ticked.
    // Values inside Prisma.sql are sent as bound parameters, never concatenated into SQL.
    const searchFilter = search ? Prisma.sql`WHERE name ILIKE ${`%${escapeLikePattern(search)}%`}` : Prisma.empty;

    // Prisma groupBy cannot split an array column, so unnest it in SQL
    const rows = await prisma.$queryRaw<{ category: RecipeCategory; count: bigint }[]>`
        SELECT unnest(categories) AS category, COUNT(*) AS count
        FROM "Recipe"
        ${searchFilter}
        GROUP BY category
    `;

    // COUNT(*) comes back as bigint; also include categories with zero recipes, in enum order
    const countByCategory = new Map(rows.map((row) => [row.category, Number(row.count)]));
    return Object.values(RecipeCategory).map((category) => ({
        category,
        count: countByCategory.get(category) ?? 0,
    }));
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
                steps: recipe.steps,
                products: {
                    deleteMany: {},
                    create: recipe.products.map((product) => toDecimalSafe(product, ['quantity'])),
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
