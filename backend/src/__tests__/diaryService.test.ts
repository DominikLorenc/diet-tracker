import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Prisma } from '../generated/prisma';
import prisma from '../lib/prisma';
import { updateDiaryItemQuantity } from '../services/diaryService';
import { AppError } from '../utils/AppError';

vi.mock('../lib/prisma', () => ({
    default: {
        diaryEntryItem: {
            update: vi.fn(),
        },
    },
}));

const itemId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const userId = 'b1c2d3e4-0000-4000-8000-000000000001';

const notFoundError = () =>
    new Prisma.PrismaClientKnownRequestError('No record found', { code: 'P2025', clientVersion: 'test' });

describe('updateDiaryItemQuantity', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should scope the update to items owned by the user', async () => {
        vi.mocked(prisma.diaryEntryItem.update).mockResolvedValue({} as never);

        await updateDiaryItemQuantity(itemId, userId, 10);

        expect(prisma.diaryEntryItem.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: itemId, diaryEntry: { userId } },
            }),
        );
    });

    it('should pass quantity as string to avoid Decimal float drift', async () => {
        vi.mocked(prisma.diaryEntryItem.update).mockResolvedValue({} as never);

        await updateDiaryItemQuantity(itemId, userId, 9.7);

        expect(prisma.diaryEntryItem.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: { quantity: '9.7' },
            }),
        );
    });

    it('should throw 404 AppError when no record matches (P2025)', async () => {
        vi.mocked(prisma.diaryEntryItem.update).mockRejectedValue(notFoundError());

        const promise = updateDiaryItemQuantity(itemId, userId, 10);

        await expect(promise).rejects.toBeInstanceOf(AppError);
        await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should rethrow unexpected errors unchanged', async () => {
        const dbError = new Error('Connection refused');
        vi.mocked(prisma.diaryEntryItem.update).mockRejectedValue(dbError);

        await expect(updateDiaryItemQuantity(itemId, userId, 10)).rejects.toBe(dbError);
    });
});
