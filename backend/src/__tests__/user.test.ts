import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById, updateGoalsService } from '../services/userService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/userService');

const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!);

describe('PATCH /api/v1/users/goals', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and user', async () => {
        vi.mocked(updateGoalsService).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            username: 'test',
            password: 'hashed',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
            userGoals: {
                id: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: '1',
                dailyCaloriesGoal: 0,
                dailyProteinGoal: 0,
                dailyCarbsGoal: 0,
                dailyFatGoal: 0,
            },
            imageUrl: 'https://example.com/image.jpg',
        });
        const res = await request(app)
            .patch(`/api/v1/users/goals`)
            .send({
                dailyCaloriesGoal: 100,
                dailyProteinGoal: 100,
                dailyCarbsGoal: 100,
                dailyFatGoal: 100,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when user not found', async () => {
        vi.mocked(updateGoalsService).mockRejectedValue(new AppError('User not found', 404));

        const res = await request(app)
            .patch(`/api/v1/users/goals`)
            .send({
                dailyCaloriesGoal: 100,
                dailyProteinGoal: 100,
                dailyCarbsGoal: 100,
                dailyFatGoal: 100,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).patch(`/api/v1/users/goals`).send({
            dailyCaloriesGoal: 100,
            dailyProteinGoal: 100,
            dailyCarbsGoal: 100,
            dailyFatGoal: 100,
        });
        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/users/me', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 and user', async () => {
        vi.mocked(getUserById).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            username: 'test',
            password: 'hashed',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
            userGoals: {
                id: '1',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: '1',
                dailyCaloriesGoal: 0,
                dailyProteinGoal: 0,
                dailyCarbsGoal: 0,
                dailyFatGoal: 0,
            },
            imageUrl: 'https://example.com/image.jpg',
        });
        const res = await request(app)
            .get(`/api/v1/users/me`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get(`/api/v1/users/me`);
        expect(res.status).toBe(401);
    });
    it('should return 404 when user not found', async () => {
        vi.mocked(getUserById).mockRejectedValue(new AppError('User not found', 404));

        const res = await request(app)
            .get(`/api/v1/users/me`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });
});
