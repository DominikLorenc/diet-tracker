import { Request, Response, NextFunction } from 'express';
import { recipeSchema, recipeIdSchema } from '../schemas/recipeSchema';
import {
    createRecipeService,
    getAllRecipes,
    getRecipeById,
    updateRecipeValues,
    deleteRecipeService,
} from '../services/recipeService';

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const recipe = await createRecipeService(result.data);

        res.status(201).json({ message: 'Recipe created', recipe });
    } catch (error) {
        next(error);
    }
};

export const getRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const recipes = await getAllRecipes();
        res.status(200).json({ recipes });
    } catch (error) {
        next(error);
    }
};

export const getRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = recipeIdSchema.safeParse(id);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid recipe ID' });
        return;
    }

    try {
        const recipe = await getRecipeById(result.data);
        res.status(200).json({ recipe });
    } catch (error) {
        next(error);
    }
};

export const updateRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const result = recipeIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const validationRecipe = recipeSchema.safeParse(req.body);

        if (!validationRecipe.success) {
            res.status(400).json({ message: validationRecipe.error.issues });
            return;
        }

        const updated = await updateRecipeValues(result.data, validationRecipe.data);

        res.status(200).json({ recipe: updated });
    } catch (error) {
        next(error);
    }
};

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = recipeIdSchema.safeParse(id);
    if (!result.success) {
        res.status(404).json({ message: result.error.issues });
        return;
    }

    try {
        const deleted = await deleteRecipeService(result.data);
        res.status(200).json({ message: 'Recipe deleted', deleted });
    } catch (error) {
        next(error);
    }
};
