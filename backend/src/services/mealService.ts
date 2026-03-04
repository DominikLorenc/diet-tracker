import { Prisma, Meal, MealProduct } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

const mealExists = async (name: string): Promise<boolean> => {
    const meal = await prisma.meal.findUnique({
        where: {
            name: name,
        },
    });
    return !!meal;
};

export const createMealService = async (meal: Prisma.MealCreateInput): Promise<Meal> => {
    const exists = await mealExists(meal.name);
    if (exists) {
        throw new AppError('Meal already exists', 409);
    }

    const newMeal = await prisma.meal.create({
        data: meal,
    });
    return newMeal;
};

export const getAllMeals = async (): Promise<Meal[]> => {
    const meals = await prisma.meal.findMany();

    return meals;
};

export const getMealById = async (id: string): Promise<Meal & { mealProducts: MealProduct[] }> => {
    const meal = await prisma.meal.findUnique({
        where: {
            id: id,
        },
        include: {
            mealProducts: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!meal) {
        throw new AppError('Meal not found', 404);
    }

    return meal;
};

export const updateMealValues = async (id: string, meal: Prisma.MealUpdateInput): Promise<Meal> => {
    const mealToUpdate = await getMealById(id);

    const name = meal?.name;

    if (typeof name === 'string' && name !== mealToUpdate.name) {
        const exists = await mealExists(name);
        if (exists) {
            throw new AppError('Meal already exists', 409);
        }
    }

    const updatedMeal = await prisma.meal.update({
        where: {
            id: id,
        },
        data: meal,
    });

    return updatedMeal;
};

export const deleteMealService = async (id: string): Promise<Meal> => {
    const meal = await getMealById(id);
    await prisma.meal.delete({
        where: {
            id: id,
        },
    });
    return meal;
};

export const addProductToMealService = async (mealId: string, productId: string): Promise<MealProduct> => {
    const meal = await prisma.mealProduct.create({
        data: {
            mealId,
            productId,
            quantity: 1,
            unit: 'g',
        },
    });

    return meal;
};
