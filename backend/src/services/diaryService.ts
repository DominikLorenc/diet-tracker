import { Prisma, DiaryEntry, DiaryEntryItem, MealType } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

const diaryExists = async (id: string): Promise<boolean> => {
    const diary = await prisma.diaryEntry.findUnique({
        where: {
            id,
        },
    });
    return !!diary;
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
    quantity: number;
    mealType: MealType;
};

export const addDiaryService = async (entry: AddDiaryEntryInput): Promise<DiaryEntry> => {
    const entryExist = await findDiaryByUserIdAndDate(entry.userId ?? '', new Date(entry.date));

    if (entryExist) {
        await createDiaryItem({
            diaryEntryId: entryExist.id,
            productId: entry?.productId,
            recipeId: entry?.recipeId,
            quantity: entry.quantity,
            mealType: entry?.mealType,
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
                    quantity: entry.quantity,
                    mealType: entry.mealType,
                },
            },
        },
    });
    return newDiaryEntry;
};

export const getDiaryServiceByDate = async (date: Date): Promise<DiaryEntry[]> => {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const diaryEntries = await prisma.diaryEntry.findMany({
        where: {
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
        include: {
            items: {
                include: {
                    product: true,
                    recipe: true,
                },
            },
        },
    });
    return diaryEntries;
};

export const deleteDiaryService = async (id: string): Promise<DiaryEntry> => {
    if (!(await diaryExists(id))) {
        throw new AppError('Diary entry not found', 404);
    }

    const deleted = await prisma.diaryEntry.delete({
        where: {
            id,
        },
    });
    return deleted;
};
