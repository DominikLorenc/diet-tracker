import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addDiaryService, getDiaryServiceByDate, deleteDiaryService } from '../services/diaryService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/diaryService');

const token = jwt.sign({ id: crypto.randomUUID(), role: 'USER' }, process.env.JWT_SECRET!);
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
