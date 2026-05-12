import { Request, Response, NextFunction } from 'express';
import {
    addDiaryService,
    deleteDiaryItemProductService,
    deleteDiaryService,
    getDiaryServiceByDate,
    updateDiaryEntry,
} from '../services/diaryService';
import { diaryEntrySchema, dateDiarySchema, diaryIdSchema, toggleEatenSchema } from '../schemas/diarySchema';

export const createDiaryEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = diaryEntrySchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const { date, productId, recipeId, userRecipeId, quantity, mealType } = result.data;

        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const newDiaryEntry = await addDiaryService({
            date,
            productId,
            recipeId,
            userRecipeId,
            quantity,
            mealType,
            userId,
        });

        res.status(201).json({ message: 'Diary entry created', newDiaryEntry });
    } catch (error) {
        next(error);
    }
};

export const getDiary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { date } = req.query;

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const searchDate = dateDiarySchema.safeParse({ date });
        if (!searchDate.success) {
            res.status(400).json({ message: searchDate.error.issues });
            return;
        }

        const diaryEntries = await getDiaryServiceByDate(searchDate.data.date, userId);

        res.status(200).json({ message: 'Diary entries', diaryEntries });
    } catch (error) {
        next(error);
    }
};

export const deleteDiaryEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = diaryIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const deleted = await deleteDiaryService(result.data, userId);
        res.status(200).json({ message: 'Diary entry deleted', deleted });
    } catch (error) {
        next(error);
    }
};

export const toggleEatenItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = diaryIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const validation = toggleEatenSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({ message: validation.error.issues });
            return;
        }

        const { isEaten } = validation.data;

        const updated = await updateDiaryEntry(result.data, userId, isEaten);
        res.status(200).json({ message: 'Diary entry updated', updated });
    } catch (error) {
        next(error);
    }
};

export const deleteDiaryItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = diaryIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const deleted = await deleteDiaryItemProductService(result.data, userId);
        res.status(200).json({ message: 'Diary entry deleted', deleted });
    } catch (error) {
        next(error);
    }
};
