import { Request, Response, NextFunction } from 'express';
import { mealSchema, mealIdSchema } from '../schemas/mealSchema';
import {
    createMealService,
    getAllMeals,
    getMealById,
    updateMealValues,
    deleteMealService,
} from '../services/mealService';

export const createMeal = async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    try {
        const result = mealSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const meal = await createMealService(result.data);

        res.status(201).json({ message: 'Meal created', meal });
    } catch (error) {
        next(error);
    }
};

export const getMeals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const meals = await getAllMeals();
        res.status(200).json({ meals });
    } catch (error) {
        next(error);
    }
};

export const getMeal = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = mealIdSchema.safeParse(id);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid meal ID' });
        return;
    }

    try {
        const meal = await getMealById(result.data);
        res.status(200).json({ meal });
    } catch (error) {
        next(error);
    }
};

export const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const result = mealIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const validationMeal = mealSchema.safeParse(req.body);

        if (!validationMeal.success) {
            res.status(400).json({ message: validationMeal.error.issues });
            return;
        }

        const updated = await updateMealValues(result.data, validationMeal.data);

        res.status(200).json({ meal: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = mealIdSchema.safeParse(id);
    if (!result.success) {
        res.status(404).json({ message: result.error.issues });
        return;
    }

    try {
        const deleted = await deleteMealService(result.data);
        res.status(200).json({ message: 'Meal deleted', deleted });
    } catch (error) {
        next(error);
    }
};
