import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createMealService,
    getAllMeals,
    getMealById,
    updateMealValues,
    deleteMealService,
    addProductToMealService,
    removeProductFromMealService,
} from '../services/mealService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import { Decimal } from '../generated/prisma/runtime/client';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/mealService');

const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET!);
const mealId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const productId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';

describe('POST /api/v1/meals/', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 when valid data is provided', async () => {
        vi.mocked(createMealService).mockResolvedValue({
            name: 'Test meal',
            id: mealId,
            createdAt: new Date(),
        });

        const res = await request(app)
            .post('/api/v1/meals')
            .send({
                name: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(201);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .post('/api/v1/meals')
            .send({
                someValue: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).post('/api/v1/meals').send({
            name: 'Test meal',
        });

        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/meals', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and all meals', async () => {
        vi.mocked(getAllMeals).mockResolvedValue([
            {
                name: 'Test meal',
                id: mealId,
                createdAt: new Date(),
            },
        ]);
        const res = await request(app)
            .get('/api/v1/meals')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get('/api/v1/meals');
        expect(res.status).toBe(401);
    });
});

describe(`GET /api/v1/meals/${mealId}`, () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and meal', async () => {
        vi.mocked(getMealById).mockResolvedValue({
            name: 'Test meal',
            id: mealId,
            createdAt: new Date(),
            mealProducts: [
                {
                    id: '1',
                    mealId: mealId,
                    productId: productId,
                    quantity: new Decimal(1),
                    unit: 'g',
                },
            ],
        });
        const res = await request(app)
            .get(`/api/v1/meals/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });
    it('should return 404 when meal not found', async () => {
        vi.mocked(getMealById).mockRejectedValue(new AppError('Meal not found', 404));

        const res = await request(app)
            .get(`/api/v1/meals/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get(`/api/v1/meals/${mealId}`);
        expect(res.status).toBe(401);
    });
});

describe('PATCH /api/v1/meals/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and updated meal', async () => {
        vi.mocked(updateMealValues).mockResolvedValue({
            name: 'Test meal',
            id: mealId,
            createdAt: new Date(),
        });
        const res = await request(app)
            .patch(`/api/v1/meals/${mealId}`)
            .send({
                name: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when meal not found', async () => {
        vi.mocked(updateMealValues).mockRejectedValue(new AppError('Meal not found', 404));

        const res = await request(app)
            .patch(`/api/v1/meals/${mealId}`)
            .send({
                name: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).patch(`/api/v1/meals/${mealId}`).send({
            name: 'Test meal',
        });
        expect(res.status).toBe(401);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .patch(`/api/v1/meals/${mealId}`)
            .send({
                someValue: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });
});

describe('DELETE /api/v1/meals/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and deleted meal', async () => {
        vi.mocked(deleteMealService).mockResolvedValue({
            name: 'Test meal',
            createdAt: new Date(),
            id: mealId,
        });
        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when meal not found', async () => {
        vi.mocked(deleteMealService).mockRejectedValue(new AppError('Meal not found', 404));

        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });
    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/meals/${mealId}`);
        expect(res.status).toBe(401);
    });
});

describe('POST /api/v1/meals/:id/products', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 and added product to meal', async () => {
        vi.mocked(addProductToMealService).mockResolvedValue({
            mealId: mealId,
            productId: productId,
            quantity: new Decimal(1),
            unit: 'g',
            id: '1',
        });
        const res = await request(app)
            .post(`/api/v1/meals/${mealId}/products`)
            .send({
                productId: productId,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
    });

    it('should return 404 when meal not found', async () => {
        vi.mocked(addProductToMealService).mockRejectedValue(new AppError('Meal not found', 404));

        const res = await request(app)
            .post(`/api/v1/meals/${mealId}/products`)
            .send({
                productId: productId,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .post(`/api/v1/meals/${mealId}/products`)
            .send({
                someValue: 'Test meal',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).post(`/api/v1/meals/${mealId}/products`).send({
            productId: productId,
        });
        expect(res.status).toBe(401);
    });
});

describe('DELETE /api/v1/meals/:id/products/:productId', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and deleted product from meal', async () => {
        vi.mocked(removeProductFromMealService).mockResolvedValue({
            mealId: mealId,
            productId: productId,
            quantity: new Decimal(1),
            unit: 'g',
            id: '1',
        });
        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when meal not found', async () => {
        vi.mocked(removeProductFromMealService).mockRejectedValue(new AppError('Meal not found', 404));

        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 404 when product not found', async () => {
        vi.mocked(removeProductFromMealService).mockRejectedValue(new AppError('Product not found', 404));

        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/meals/${mealId}/products/${productId}`);
        expect(res.status).toBe(401);
    });

    it('should return 400 when meal uuid is invalid', async () => {
        const res = await request(app)
            .delete(`/api/v1/meals/123/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 400 when product uuid is invalid', async () => {
        const res = await request(app)
            .delete(`/api/v1/meals/${mealId}/products/123`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });
});
