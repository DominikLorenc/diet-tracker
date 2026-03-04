import { Prisma, DiaryEntry } from '../generated/prisma';
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

export const addDiaryService = async (entry: Prisma.DiaryEntryCreateInput): Promise<DiaryEntry> => {
    const newDiaryEntry = await prisma.diaryEntry.create({
        data: entry,
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
            meal: true,
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
