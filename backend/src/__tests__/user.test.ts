import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserById, updateGoalsService, requestPasswordReset, resetPasswordService } from '../services/userService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/userService');

const token = jwt.sign({ id: crypto.randomUUID(), role: 'USER' }, process.env.JWT_SECRET!);

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

// NOTE: forgot-password & reset-password are PUBLIC (mounted above authMiddleware),
// so no auth cookie is needed on these requests — unlike /goals or /me above.
// The `toBe(0)` placeholders below fail on purpose — replace each with the right value.

describe('POST /api/v1/users/forgot-password', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 for a valid email', async () => {
        // requestPasswordReset returns void -> resolve with undefined.
        vi.mocked(requestPasswordReset).mockResolvedValue(undefined);

        const res = await request(app).post('/api/v1/users/forgot-password').send({ email: 'test@test.com' });

        expect(res.status).toBe(200);
    });

    it('should return 400 for an invalid email', async () => {
        // No mock: Zod validation fails in the controller before the service runs.
        const res = await request(app).post('/api/v1/users/forgot-password').send({ email: 'not-an-email' });

        expect(res.status).toBe(400);
    });

    it('should return the same generic message regardless of whether the email exists (anti-enumeration)', async () => {
        vi.mocked(requestPasswordReset).mockResolvedValue(undefined);

        const res = await request(app)
            .post('/api/v1/users/forgot-password')
            .send({ email: 'maybe-registered@test.com' });

        expect(res.body.message).toBe('If an account with that email exists, a reset link has been sent');
    });
});

describe('POST /api/v1/users/reset-password', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // A body that PASSES Zod (token length 64, strong password), so the request
    // reaches the service layer — where the mock decides success vs failure.
    const validToken = 'a'.repeat(64);
    const validPassword = 'ValidPass1!';

    it('should return 200 for a valid token and password', async () => {
        vi.mocked(resetPasswordService).mockResolvedValue(undefined);

        const res = await request(app)
            .post('/api/v1/users/reset-password')
            .send({ token: validToken, password: validPassword });

        expect(res.status).toBe(200);
    });

    it('should return 400 for an invalid/expired/used token', async () => {
        // The service throws for any bad token — the controller must surface that status.
        vi.mocked(resetPasswordService).mockRejectedValue(new AppError('Invalid token', 400));

        const res = await request(app)
            .post('/api/v1/users/reset-password')
            .send({ token: validToken, password: validPassword });

        expect(res.status).toBe(400);
    });

    it('should return 400 when the body fails validation (weak password)', async () => {
        // No mock: Zod rejects a weak password before the service runs.
        const res = await request(app)
            .post('/api/v1/users/reset-password')
            .send({ token: validToken, password: 'weak' });

        expect(res.status).toBe(400);
    });
});
