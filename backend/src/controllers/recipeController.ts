import { Request, Response, NextFunction } from 'express';
import {
    recipeSchema,
    recipeIdSchema,
    recipeListQuerySchema,
    recipeCategoryCountsQuerySchema,
} from '../schemas/recipeSchema';
import {
    createRecipeService,
    getAllRecipes,
    getRecipeCategoryCounts,
    getRecipeById,
    updateRecipeValues,
    deleteRecipeService,
} from '../services/recipeService';
import { sendValidationError } from '../utils/sendValidationError';

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeSchema.safeParse(req.body);
        if (!result.success) {
            sendValidationError(res, result.error);
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
        const result = recipeListQuerySchema.safeParse(req.query);
        if (!result.success) {
            sendValidationError(res, result.error);
            return;
        }

        const recipes = await getAllRecipes(result.data);
        res.status(200).json(recipes);
    } catch (error) {
        next(error);
    }
};

export const getRecipeCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeCategoryCountsQuerySchema.safeParse(req.query);
        if (!result.success) {
            sendValidationError(res, result.error);
            return;
        }

        const categories = await getRecipeCategoryCounts(result.data.search);
        res.status(200).json({ categories });
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
            sendValidationError(res, result.error);
            return;
        }

        const validationRecipe = recipeSchema.safeParse(req.body);

        if (!validationRecipe.success) {
            sendValidationError(res, validationRecipe.error);
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
        sendValidationError(res, result.error, 404);
        return;
    }

    try {
        const deleted = await deleteRecipeService(result.data);
        res.status(200).json({ message: 'Recipe deleted', deleted });
    } catch (error) {
        next(error);
    }
};
