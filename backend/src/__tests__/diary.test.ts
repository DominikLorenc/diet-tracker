import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addDiaryService, getDiaryServiceByDate, deleteDiaryService } from '../services/diaryService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/diaryService');

const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!);
const mealId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const userId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';

describe('POST /api/v1/diary', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 and added diary entry', async () => {
        vi.mocked(addDiaryService).mockResolvedValue({
            id: '1',
            date: new Date(),
            mealId: mealId,
            userId: userId,
            mealType: 'BREAKFAST',
            createdAt: new Date(),
        });
        const res = await request(app)
            .post('/api/v1/diary')
            .send({
                date: new Date(),
                mealId: mealId,
                mealType: 'BREAKFAST',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
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
            date: new Date(),
            mealId: mealId,
            mealType: 'BREAKFAST',
        });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/diary', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and all diary entries', async () => {
        vi.mocked(getDiaryServiceByDate).mockResolvedValue([
            {
                date: new Date(),
                mealId: mealId,
                userId: userId,
                mealType: 'BREAKFAST',
                id: '1',
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
            date: new Date(),
            userId: userId,
            mealId: mealId,
            mealType: 'BREAKFAST',
            id: '1',
            createdAt: new Date(),
        });
        const res = await request(app)
            .delete(`/api/v1/diary/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when diary not found', async () => {
        vi.mocked(deleteDiaryService).mockRejectedValue(new AppError('Diary not found', 404));

        const res = await request(app)
            .delete(`/api/v1/diary/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/diary/${mealId}`);
        expect(res.status).toBe(401);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .delete(`/api/v1/diary/123`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });
});
