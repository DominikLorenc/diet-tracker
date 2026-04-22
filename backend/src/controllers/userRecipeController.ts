import { Request, Response, NextFunction } from 'express';
import {
    createUserRecipe,
    getUserRecipes,
    updateUserRecipe,
    deleteUserRecipe,
    copyRecipe,
} from '../services/userRecipeService';
import { createUserRecipeSchema, updateUserRecipeSchema, copyRecipeSchema, UUIDScheme } from '../schemas/userSchema';

export const createUserRecipeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = createUserRecipeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues });
        }

        const { name, products } = result.data;

        const userRecipe = await createUserRecipe(userId, name, products);

        return res.status(201).json({ message: 'User recipe created', userRecipe });
    } catch (error) {
        next(error);
    }
};

export const getUserRecipesController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRecipes = await getUserRecipes(userId);

        return res.status(200).json({ message: 'User recipes found', userRecipes });
    } catch (error) {
        next(error);
    }
};

export const updateUserRecipeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = updateUserRecipeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues });
        }

        const { id } = req.params;

        const userRecipeId = UUIDScheme.safeParse(id);

        if (!userRecipeId.success) {
            return res.status(400).json({ message: userRecipeId.error.issues });
        }

        const { name, products } = result.data;

        const userRecipe = await updateUserRecipe(userId, userRecipeId.data, name, products);

        return res.status(200).json({ message: 'User recipe updated', userRecipe });
    } catch (error) {
        next(error);
    }
};

export const deleteUserRecipeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { id } = req.params;

        const result = UUIDScheme.safeParse(id);

        if (!result.success) {
            return res.status(400).json({ message: result.error.issues });
        }

        const userRecipeId = result.data;

        const userRecipe = await deleteUserRecipe(userId, userRecipeId);

        return res.status(200).json({ message: 'User recipe deleted', userRecipe });
    } catch (error) {
        next(error);
    }
};

export const copyRecipeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const result = copyRecipeSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ message: result.error.issues });
        }

        const { sourceRecipeId } = result.data;

        const userRecipe = await copyRecipe(userId, sourceRecipeId);

        return res.status(200).json({ message: 'User recipe copied', userRecipe });
    } catch (error) {
        next(error);
    }
};
