import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createRecipeService,
    getAllRecipes,
    getRecipeById,
    updateRecipeValues,
    deleteRecipeService,
} from '../services/recipeService';
import request from 'supertest';
import app from '../app';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { Decimal } from '../generated/prisma/runtime/client';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/recipeService');

const token = jwt.sign({ id: '1', role: 'ADMIN' }, process.env.JWT_SECRET!);
const productId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const recipeName = 'Test recipe';
const recipeId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';
const recipe = {
    name: recipeName,
    products: [
        {
            productId,
            quantity: 1,
        },
    ],
};

describe('POST /api/v1/recipes', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 and added recipe', async () => {
        vi.mocked(createRecipeService).mockResolvedValue({
            id: '1',
            name: recipeName,
            createdAt: new Date(),
        });
        const res = await request(app)
            .post('/api/v1/recipes')
            .send(recipe)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(201);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .post('/api/v1/recipes')
            .send({
                someValue: 'Test recipe',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).post('/api/v1/recipes').send(recipe);
        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/recipes', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and all recipes', async () => {
        vi.mocked(getAllRecipes).mockResolvedValue([
            {
                id: '1',
                name: recipeName,
                createdAt: new Date(),
                products: [
                    {
                        id: 'uuid',
                        recipeId: '1',
                        productId,
                        quantity: new Decimal(1),
                        createdAt: new Date(),
                        product: {
                            id: productId,
                            name: 'Test product',
                            calories: new Decimal(100),
                            carbs: new Decimal(100),
                            protein: new Decimal(100),
                            fat: new Decimal(100),
                            createdAt: new Date(),
                            imageUrl: 'https://example.com/image.jpg',
                            barcode: '1234567890',
                        },
                    },
                ],
            },
        ]);
        const res = await request(app)
            .get('/api/v1/recipes')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get('/api/v1/recipes');
        expect(res.status).toBe(401);
    });
});

describe('GET /api/v1/recipes/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and recipe', async () => {
        vi.mocked(getRecipeById).mockResolvedValue({
            id: recipeId,
            name: recipeName,
            createdAt: new Date(),
            products: [
                {
                    id: productId,
                    recipeId: '1',
                    productId,
                    quantity: new Decimal(1),
                    createdAt: new Date(),
                    product: {
                        id: productId,
                        name: 'Test product',
                        calories: new Decimal(100),
                        carbs: new Decimal(100),
                        protein: new Decimal(100),
                        fat: new Decimal(100),
                        createdAt: new Date(),
                        imageUrl: 'https://example.com/image.jpg',
                        barcode: '1234567890',
                    },
                },
            ],
        });
        const res = await request(app)
            .get(`/api/v1/recipes/${recipeId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .get('/api/v1/recipes/123')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get('/api/v1/recipes/1');
        expect(res.status).toBe(401);
    });

    it('should return 404 when recipe not found', async () => {
        vi.mocked(getRecipeById).mockRejectedValue(new AppError('Recipe not found', 404));

        const res = await request(app)
            .get(`/api/v1/recipes/${recipeId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });
});

describe('PATCH /api/v1/recipes/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and updated recipe', async () => {
        vi.mocked(updateRecipeValues).mockResolvedValue({
            id: '1',
            name: recipeName,
            createdAt: new Date(),
        });
        const res = await request(app)
            .patch(`/api/v1/recipes/${recipeId}`)
            .send(recipe)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .patch(`/api/v1/recipes/${recipeId}`)
            .send({
                someValue: 'Test recipe',
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).patch(`/api/v1/recipes/${recipeId}`).send(recipe);
        expect(res.status).toBe(401);
    });

    it('should return 404 when recipe not found', async () => {
        vi.mocked(updateRecipeValues).mockRejectedValue(new AppError('Recipe not found', 404));

        const res = await request(app)
            .patch(`/api/v1/recipes/${recipeId}`)
            .send(recipe)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 409 when recipe already exists', async () => {
        vi.mocked(updateRecipeValues).mockRejectedValue(new AppError('Recipe already exists', 409));

        const res = await request(app)
            .patch(`/api/v1/recipes/${recipeId}`)
            .send(recipe)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(409);
    });
});

describe('DELETE /api/v1/recipes/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and deleted recipe', async () => {
        vi.mocked(deleteRecipeService).mockResolvedValue({
            id: '1',
            name: recipeName,
            createdAt: new Date(),
        });
        const res = await request(app)
            .delete(`/api/v1/recipes/${recipeId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/recipes/1`);
        expect(res.status).toBe(401);
    });

    it('should return 404 when recipe not found', async () => {
        vi.mocked(deleteRecipeService).mockRejectedValue(new AppError('Recipe not found', 404));

        const res = await request(app)
            .delete(`/api/v1/recipes/1`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });
});
