import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    addDiaryService,
    getDiaryServiceByDate,
    deleteDiaryService,
    updateDiaryItemQuantity,
} from '../services/diaryService';
import { Prisma } from '../generated/prisma';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/diaryService');

const tokenUserId = crypto.randomUUID();
const token = jwt.sign({ id: tokenUserId, role: 'USER' }, process.env.JWT_SECRET!);
const productId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const userId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const recipeId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const quantity = 1;
const diaryId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';

describe('POST /api/v1/diary', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 and added diary entry', async () => {
        vi.mocked(addDiaryService).mockResolvedValue({
            id: '1',
            date: new Date(),
            userId,
            createdAt: new Date(),
        });
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                userId,
                date: new Date(),
                productId,
                quantity,
                mealType: 'BREAKFAST',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
    });

    it('should return 400 when no source field is provided', async () => {
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                userId,
                date: new Date(),
                quantity,
                mealType: 'BREAKFAST',
            })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 400 when more than one source field is provided', async () => {
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                userId,
                date: new Date(),
                productId,
                recipeId,
                quantity,
                mealType: 'BREAKFAST',
            })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                someValue: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).post('/api/v1/diary').send({
            userId,
            date: new Date(),
            productId,
            recipeId,
            quantity,
            mealType: 'BREAKFAST',
        });
        expect(res.status).toBe(401);
    });

    it('should accept userRecipeId in body and call service with it', async () => {
        const userRecipeId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
        vi.mocked(addDiaryService).mockResolvedValue({
            id: '1',
            date: new Date(),
            userId,
            createdAt: new Date(),
        });
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                date: new Date().toISOString(),
                userRecipeId,
                quantity: 1,
                mealType: 'BREAKFAST',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
        expect(addDiaryService).toHaveBeenCalledWith(expect.objectContaining({ userRecipeId }));
    });

    it('should accept isEaten in body and call service with it', async () => {
        vi.mocked(addDiaryService).mockResolvedValue({
            id: '1',
            date: new Date(),
            userId,
            createdAt: new Date(),
        });
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                date: new Date().toISOString(),
                productId,
                quantity,
                mealType: 'BREAKFAST',
                isEaten: true,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
        expect(addDiaryService).toHaveBeenCalledWith(expect.objectContaining({ isEaten: true }));
    });
});

describe('GET /api/v1/diary', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and all diary entries', async () => {
        vi.mocked(getDiaryServiceByDate).mockResolvedValue([
            {
                id: '1',
                date: new Date(),
                userId,
                createdAt: new Date(),
            },
        ]);
        const res = await request(app)
            .get('/api/v1/diary?date=2023-03-01')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get('/api/v1/diary');
        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/v1/diary/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and deleted diary entry', async () => {
        vi.mocked(deleteDiaryService).mockResolvedValue({
            id: '1',
            date: new Date(),
            userId,
            createdAt: new Date(),
        });
        const res = await request(app)
            .delete(`/api/v1/diary/${diaryId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when diary not found', async () => {
        vi.mocked(deleteDiaryService).mockRejectedValue(new AppError('Diary not found', 404));

        const res = await request(app)
            .delete(`/api/v1/diary/${diaryId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/diary/${diaryId}`);
        expect(res.status).toBe(401);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .delete(`/api/v1/diary/123`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });
});

describe('PATCH /api/v1/diary/:id/quantity', () => {
    const diaryItem = {
        id: diaryId,
        diaryEntryId: diaryId,
        productId,
        recipeId: null,
        userRecipeId: null,
        mealType: 'BREAKFAST' as const,
        createdAt: new Date(),
        quantity: new Prisma.Decimal(10),
        isEaten: false,
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 and call service with id, userId from token and quantity', async () => {
        vi.mocked(updateDiaryItemQuantity).mockResolvedValue(diaryItem);

        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({ quantity: 10 })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(200);
        expect(updateDiaryItemQuantity).toHaveBeenCalledWith(diaryId, tokenUserId, 10);
    });

    it('should accept decimal quantity', async () => {
        vi.mocked(updateDiaryItemQuantity).mockResolvedValue(diaryItem);

        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({ quantity: 12.5 })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(200);
        expect(updateDiaryItemQuantity).toHaveBeenCalledWith(diaryId, tokenUserId, 12.5);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).patch(`/api/v1/diary/${diaryId}/quantity`).send({ quantity: 10 });

        expect(res.status).toBe(401);
        expect(updateDiaryItemQuantity).not.toHaveBeenCalled();
    });

    it('should return 400 when id is not a uuid', async () => {
        const res = await request(app)
            .patch('/api/v1/diary/abc/quantity')
            .send({ quantity: 10 })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
        expect(updateDiaryItemQuantity).not.toHaveBeenCalled();
    });

    it.each([
        ['zero', 0],
        ['negative', -5],
        ['above max', 50001],
        ['numeric string', '10'],
        ['boolean', true],
        ['array', [25]],
        ['null', null],
    ])('should return 400 when quantity is %s', async (_label, quantity) => {
        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({ quantity })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
        expect(updateDiaryItemQuantity).not.toHaveBeenCalled();
    });

    it('should return 400 when quantity is missing', async () => {
        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({})
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
        expect(updateDiaryItemQuantity).not.toHaveBeenCalled();
    });

    it('should return 404 when item not found or owned by another user', async () => {
        vi.mocked(updateDiaryItemQuantity).mockRejectedValue(new AppError('Diary entry not found', 404));

        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({ quantity: 10 })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(404);
    });

    it('should return 500 on unexpected service error', async () => {
        vi.mocked(updateDiaryItemQuantity).mockRejectedValue(new Error('DB down'));

        const res = await request(app)
            .patch(`/api/v1/diary/${diaryId}/quantity`)
            .send({ quantity: 10 })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(500);
        expect(res.body.message).not.toContain('DB down');
    });
});
