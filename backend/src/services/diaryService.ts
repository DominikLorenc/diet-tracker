import { Prisma, DiaryEntry, DiaryEntryItem, MealType } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

const findDiaryItemById = async (id: string): Promise<DiaryEntryItem | null> => {
    const diaryItem = await prisma.diaryEntryItem.findUnique({
        where: {
            id,
        },
    });
    return diaryItem;
};

const findDiaryByUserIdAndDate = async (userId: string, date: Date): Promise<DiaryEntry | null> => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const diaryEntries = await prisma.diaryEntry.findFirst({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return diaryEntries;
};

const createDiaryItem = async (item: Prisma.DiaryEntryItemUncheckedCreateInput): Promise<DiaryEntryItem> => {
    const newItem = await prisma.diaryEntryItem.create({
        data: item,
    });

    return newItem;
};
type AddDiaryEntryInput = {
    userId: string;
    date: Date;
    productId?: string;
    recipeId?: string;
    userRecipeId?: string;
    quantity: number;
    mealType: MealType;
    isEaten?: boolean;
};

export const addDiaryService = async (entry: AddDiaryEntryInput): Promise<DiaryEntry> => {
    const entryExist = await findDiaryByUserIdAndDate(entry.userId ?? '', new Date(entry.date));

    if (entryExist) {
        await createDiaryItem({
            diaryEntryId: entryExist.id,
            productId: entry?.productId,
            recipeId: entry?.recipeId,
            userRecipeId: entry?.userRecipeId,
            quantity: entry.quantity,
            mealType: entry?.mealType,
            isEaten: entry?.isEaten,
        });

        return entryExist;
    }

    const newDiaryEntry = await prisma.diaryEntry.create({
        data: {
            userId: entry.userId,
            date: entry.date,
            items: {
                create: {
                    productId: entry.productId,
                    recipeId: entry.recipeId,
                    userRecipeId: entry.userRecipeId,
                    quantity: entry.quantity,
                    mealType: entry.mealType,
                    isEaten: entry?.isEaten,
                },
            },
        },
    });
    return newDiaryEntry;
};

export const getDiaryServiceByDate = async (date: Date, userId: string): Promise<DiaryEntry[]> => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const diaryEntries = await prisma.diaryEntry.findMany({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            items: {
                include: {
                    recipe: {
                        include: {
                            products: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    userRecipe: {
                        include: {
                            userRecipeIngredients: {
                                include: {
                                    product: true,
                                },
                            },
                        },
                    },
                    product: true,
                },
            },
        },
    });
    return diaryEntries;
};

export const deleteDiaryService = async (id: string, userId: string): Promise<DiaryEntry> => {
    try {
        const deleted = await prisma.diaryEntry.delete({
            where: {
                id,
                userId,
            },
        });
        return deleted;
    } catch (_error) {
        throw new AppError('Diary entry not found', 404);
    }
};

export const updateDiaryEntry = async (id: string, userId: string, isEaten: boolean): Promise<DiaryEntryItem> => {
    try {
        const updated = await prisma.diaryEntryItem.update({
            where: {
                id,
                diaryEntry: {
                    userId,
                },
            },
            data: {
                isEaten,
            },
        });
        return updated;
    } catch (_error) {
        throw new AppError('Diary entry not found', 404);
    }
};

export const deleteDiaryItemProductService = async (id: string, userId: string): Promise<DiaryEntryItem> => {
    const diaryItem = await findDiaryItemById(id);
    if (!diaryItem) {
        throw new AppError('Diary entry not found', 404);
    }

    try {
        const deleted = await prisma.diaryEntryItem.delete({
            where: {
                id,
                diaryEntry: {
                    userId,
                },
            },
        });
        return deleted;
    } catch (_error) {
        throw new AppError('Diary entry not found', 404);
    }
};
