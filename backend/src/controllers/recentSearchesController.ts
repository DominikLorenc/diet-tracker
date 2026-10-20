import { Request, Response, NextFunction } from 'express';
import { addRecentSearchService, getRecentSearchesService } from '../services/recentSearchesService';
import { productIdSchema } from '../schemas/productSchema';
import { sendValidationError } from '../utils/sendValidationError';

export const addRecentSearch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.body;

        const result = productIdSchema.safeParse(productId);
        if (!result.success) {
            sendValidationError(res, result.error);
            return;
        }

        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const newRecentSearch = await addRecentSearchService(result.data, userId);

        res.status(201).json({ message: 'Recent search added', newRecentSearch });
    } catch (error) {
        next(error);
    }
};

export const getRecentSearches = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const recentSearches = await getRecentSearchesService(userId);
        res.status(200).json({ message: 'Recent searches found', recentSearches });
    } catch (error) {
        next(error);
    }
};
