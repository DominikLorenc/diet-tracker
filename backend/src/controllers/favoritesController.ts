import { Request, Response, NextFunction } from 'express';
import {
    getFavoriteProductsService,
    addFavoriteProductService,
    removeFavoriteProductService,
    getFavoriteRecipesService,
    addFavoriteRecipeService,
    removeFavoriteRecipeService,
} from '../services/favoritesService';
import { productIdSchema } from '../schemas/productSchema';
import { recipeIdSchema } from '../schemas/recipeSchema';

export const getFavoriteProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const favorites = await getFavoriteProductsService(req.userId!);
        res.status(200).json({ favorites });
    } catch (error) {
        next(error);
    }
};

export const addFavoriteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = productIdSchema.safeParse(req.body.productId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid productId' });
            return;
        }
        const favorite = await addFavoriteProductService(req.userId!, result.data);
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        next(error);
    }
};

export const removeFavoriteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = productIdSchema.safeParse(req.params.productId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid productId' });
            return;
        }
        await removeFavoriteProductService(req.userId!, result.data);
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        next(error);
    }
};

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const getFavoriteRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const favorites = await getFavoriteRecipesService(req.userId!);
        res.status(200).json({ favorites });
    } catch (error) {
        next(error);
    }
};

export const addFavoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeIdSchema.safeParse(req.body.recipeId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid recipeId' });
            return;
        }
        const favorite = await addFavoriteRecipeService(req.userId!, result.data);
        res.status(201).json({ message: 'Added to favorites', favorite });
    } catch (error) {
        next(error);
    }
};

export const removeFavoriteRecipe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = recipeIdSchema.safeParse(req.params.recipeId);
        if (!result.success) {
            res.status(400).json({ message: 'Invalid recipeId' });
            return;
        }
        await removeFavoriteRecipeService(req.userId!, result.data);
        res.status(200).json({ message: 'Removed from favorites' });
    } catch (error) {
        next(error);
    }
};
