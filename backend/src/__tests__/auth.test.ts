import { describe, it, expect, vi } from 'vitest';
import { registerUser, loginUser } from '../services/userService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/userService');

describe('POST /api/v1/users/register', () => {
    it('should return 201 when valid data is provided', async () => {
        vi.mocked(registerUser).mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            username: 'test',
            password: 'hashed',
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
            imageUrl: '',
        });

        const res = await request(app).post('/api/v1/users/register').send({
            email: 'test@test.com',
            username: 'test',
            password: 'Test123!',
            passwordConfirm: 'Test123!',
        });

        expect(res.status).toBe(201);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app).post('/api/v1/users/register').send({
            username: 'test',
            password: 'Test123!',
            passwordConfirm: 'Test123!',
        });
        expect(res.status).toBe(400);
    });

    it('should return 400 when passwords do not match', async () => {
        const res = await request(app).post('/api/v1/users/register').send({
            email: 'test@test.com',
            username: 'test',
            password: 'test123sad!',
            passwordConfirm: 'test123!',
        });
        expect(res.status).toBe(400);
    });

    it('should return 400 when password is too short', async () => {
        const res = await request(app).post('/api/v1/users/register').send({
            email: 'test@test.com',
            username: 'test',
            password: '123',
            passwordConfirm: '123',
        });
        expect(res.status).toBe(400);
    });

    it('should return 409 when user already exists', async () => {
        vi.mocked(registerUser).mockRejectedValue(new AppError('User already exists', 409));

        const res = await request(app).post('/api/v1/users/register').send({
            email: 'test@test.com',
            username: 'test',
            password: 'Test123!',
            passwordConfirm: 'Test123!',
        });

        expect(res.status).toBe(409);
    });
});

describe('POST /api/v1/users/login', () => {
    it('should return 200 and set cookie when valid data is provided', async () => {
        vi.mocked(loginUser).mockResolvedValue({
            email: 'test@test.com',
            username: 'test',
            role: 'USER',
            token: 'token',
        });

        const res = await request(app).post('/api/v1/users/login').send({
            email: 'test@test.com',
            password: 'Test123!',
        });

        expect(res.status).toBe(200);
        expect(res.headers['set-cookie']).toBeDefined();
    });
    it('should return 401 when invalid credentials', async () => {
        vi.mocked(loginUser).mockRejectedValue(new AppError('Invalid email or password', 401));

        const res = await request(app)
            .post('/api/v1/users/login')
            .send({ email: 'test@test.com', password: 'WrongPass123!' });

        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/v1/logout', () => {
    it('should return 200 when user is logged in', async () => {
        const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!);
        const res = await request(app)
            .delete('/api/v1/users/logout')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });
});
