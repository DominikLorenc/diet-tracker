import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createProduct,
    getAllProducts,
    getProductById,
    searchProductsService,
    updateProductValues,
    deleteProductService,
    getProductByBarcode,
} from '../services/productService';
import request from 'supertest';
import app from '../app';
import { Decimal } from '../generated/prisma/runtime/client';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';

vi.mock('../services/productService');

const token = jwt.sign({ id: crypto.randomUUID(), role: 'USER' }, process.env.JWT_SECRET!);
const adminToken = jwt.sign({ id: crypto.randomUUID(), role: 'ADMIN' }, process.env.JWT_SECRET!);
const productId = 'e87f94c7-0e0c-46ab-90a2-6537a30fa688';

describe('POST /api/v1/products/', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 201 when valid data is provided', async () => {
        vi.mocked(createProduct).mockResolvedValue({
            name: 'Test product',
            calories: new Decimal(100),
            carbs: new Decimal(100),
            protein: new Decimal(100),
            fat: new Decimal(100),
            id: productId,
            createdAt: new Date(),
            imageUrl: '',
            barcode: null,
        });

        const res = await request(app)
            .post('/api/v1/products')
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);

        expect(res.status).toBe(201);
    });

    it('should return 409 when product already exists', async () => {
        vi.mocked(createProduct).mockRejectedValue(new AppError('Product already exists', 409));

        const res = await request(app)
            .post('/api/v1/products')
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);

        expect(res.status).toBe(409);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .send({
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);

        expect(res.status).toBe(400);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).post('/api/v1/products').send({
            name: 'Test product',
            calories: 100,
            carbs: 100,
            protein: 100,
            fat: 100,
        });

        expect(res.status).toBe(401);
    });

    it('should return 403 when a non-admin user tries to create a product', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(403);
        expect(createProduct).not.toHaveBeenCalled();
    });
});

describe('GET /api/v1/products', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and all products', async () => {
        vi.mocked(getAllProducts).mockResolvedValue({
            products: [
                {
                    name: 'Test product',
                    calories: new Decimal(100),
                    carbs: new Decimal(100),
                    protein: new Decimal(100),
                    fat: new Decimal(100),
                    id: productId,
                    createdAt: new Date(),
                    imageUrl: '',
                    barcode: null,
                },
            ],
            total: 500,
            page: 1,
            limit: 1,
        });
        const res = await request(app)
            .get('/api/v1/products')
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
        expect(getAllProducts).toHaveBeenCalledWith({ page: 1, limit: 20, search: undefined });
    });

    it('should return 200 and products with search', async () => {
        vi.mocked(getAllProducts).mockResolvedValue({
            products: [
                {
                    name: 'Test product',
                    calories: new Decimal(100),
                    carbs: new Decimal(100),
                    protein: new Decimal(100),
                    fat: new Decimal(100),
                    id: productId,
                    createdAt: new Date(),
                    imageUrl: '',
                    barcode: null,
                },
            ],
            total: 500,
            page: 1,
            limit: 1,
        });
        const res = await request(app)
            .get('/api/v1/products')
            .query({ search: 'apple' })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });

    it('should return 200 and products with search and page', async () => {
        vi.mocked(getAllProducts).mockResolvedValue({
            products: [
                {
                    name: 'Test product',
                    calories: new Decimal(100),
                    carbs: new Decimal(100),
                    protein: new Decimal(100),
                    fat: new Decimal(100),
                    id: productId,
                    createdAt: new Date(),
                    imageUrl: '',
                    barcode: null,
                },
            ],
            total: 500,
            page: 1,
            limit: 1,
        });
        const res = await request(app)
            .get('/api/v1/products')
            .query({ search: 'apple', page: 2 })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
        expect(getAllProducts).toHaveBeenCalledWith({ page: 2, limit: 20, search: 'apple' });
    });

    it('should return 200 and products with search and limit', async () => {
        vi.mocked(getAllProducts).mockResolvedValue({
            products: [
                {
                    name: 'Test product',
                    calories: new Decimal(100),
                    carbs: new Decimal(100),
                    protein: new Decimal(100),
                    fat: new Decimal(100),
                    id: productId,
                    createdAt: new Date(),
                    imageUrl: '',
                    barcode: null,
                },
            ],
            total: 500,
            page: 1,
            limit: 1,
        });
        const res = await request(app)
            .get('/api/v1/products')
            .query({ search: 'apple', limit: 10 })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
        expect(getAllProducts).toHaveBeenCalledWith({ page: 1, limit: 10, search: 'apple' });
    });

    it('should return 200 and trim limit', async () => {
        vi.mocked(getAllProducts).mockResolvedValue({
            products: [
                {
                    name: 'Test product',
                    calories: new Decimal(100),
                    carbs: new Decimal(100),
                    protein: new Decimal(100),
                    fat: new Decimal(100),
                    id: productId,
                    createdAt: new Date(),
                    imageUrl: '',
                    barcode: null,
                },
            ],
            total: 500,
            page: 1,
            limit: 1,
        });
        const res = await request(app)
            .get('/api/v1/products')
            .query({ search: 'apple', limit: 999999999 })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
        expect(getAllProducts).toHaveBeenCalledWith({ page: 1, limit: 100, search: 'apple' });
    });

    it('should return 400 when page is not a number', async () => {
        const res = await request(app)
            .get('/api/v1/products')
            .query({ search: 'apple', page: 'not a number' })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
        expect(getAllProducts).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get('/api/v1/products');
        expect(res.status).toBe(401);
    });
});

describe(`GET /api/v1/products/${productId}`, () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and product', async () => {
        vi.mocked(getProductById).mockResolvedValue({
            name: 'Test product',
            calories: new Decimal(100),
            carbs: new Decimal(100),
            protein: new Decimal(100),
            fat: new Decimal(100),
            id: productId,
            createdAt: new Date(),
            imageUrl: '',
            barcode: null,
        });
        const res = await request(app)
            .get(`/api/v1/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });
    it('should return 404 when product not found', async () => {
        vi.mocked(getProductById).mockRejectedValue(new AppError('Product already exists', 404));

        const res = await request(app)
            .get(`/api/v1/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get(`/api/v1/products/${productId}`);
        expect(res.status).toBe(401);
    });
});

describe(`GET /api/v1/products/search?q=apple`, () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and product', async () => {
        vi.mocked(searchProductsService).mockResolvedValue([
            {
                name: 'Test product',
                calories: new Decimal(100),
                carbs: new Decimal(100),
                protein: new Decimal(100),
                fat: new Decimal(100),
                id: productId,
                createdAt: new Date(),
                imageUrl: '',
                barcode: null,
            },
        ]);
        const res = await request(app)
            .get(`/api/v1/products/search?search=apple`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(200);
    });
    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).get(`/api/v1/products/search?search=apple`);
        expect(res.status).toBe(401);
    });
    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .get(`/api/v1/products/search`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(400);
    });
});

describe('PATCH /api/v1/products/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and updated product', async () => {
        vi.mocked(updateProductValues).mockResolvedValue({
            name: 'Test product',
            calories: new Decimal(100),
            carbs: new Decimal(100),
            protein: new Decimal(100),
            fat: new Decimal(100),
            id: productId,
            createdAt: new Date(),
            imageUrl: '',
            barcode: null,
        });
        const res = await request(app)
            .patch(`/api/v1/products/${productId}`)
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when product not found', async () => {
        vi.mocked(updateProductValues).mockRejectedValue(new AppError('Product not found', 404));

        const res = await request(app)
            .patch(`/api/v1/products/${productId}`)
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).patch(`/api/v1/products/${productId}`).send({
            name: 'Test product',
            calories: 100,
            carbs: 100,
            protein: 100,
            fat: 100,
        });
        expect(res.status).toBe(401);
    });

    it('should return 403 when a non-admin user tries to update a product', async () => {
        const res = await request(app)
            .patch(`/api/v1/products/${productId}`)
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(403);
        expect(updateProductValues).not.toHaveBeenCalled();
    });

    it('should return 409 when product already exists', async () => {
        vi.mocked(updateProductValues).mockRejectedValue(new AppError('Product already exists', 409));

        const res = await request(app)
            .patch(`/api/v1/products/${productId}`)
            .send({
                name: 'Test product',
                calories: 100,
                carbs: 100,
                protein: 100,
                fat: 100,
            })
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(409);
    });

    it('should return 400 when invalid data is provided', async () => {
        const res = await request(app)
            .patch(`/api/v1/products/${productId}`)
            .send({
                someValue: 'Test product',
            })
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(400);
    });
});

describe('DELETE /api/v1/products/:id', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });
    it('should return 200 and deleted product', async () => {
        vi.mocked(deleteProductService).mockResolvedValue({
            name: 'Test product',
            calories: new Decimal(100),
            carbs: new Decimal(100),
            protein: new Decimal(100),
            fat: new Decimal(100),
            id: productId,
            createdAt: new Date(),
            imageUrl: '',
            barcode: null,
        });
        const res = await request(app)
            .delete(`/api/v1/products/${productId}`)
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(200);
    });

    it('should return 404 when product not found', async () => {
        vi.mocked(deleteProductService).mockRejectedValue(new AppError('Product not found', 404));

        const res = await request(app)
            .delete(`/api/v1/products/${productId}`)
            .set('Cookie', ['token=' + adminToken]);
        expect(res.status).toBe(404);
    });

    it('should return 401 when user is not logged in', async () => {
        const res = await request(app).delete(`/api/v1/products/${productId}`);
        expect(res.status).toBe(401);
    });

    it('should return 403 when a non-admin user tries to delete a product', async () => {
        const res = await request(app)
            .delete(`/api/v1/products/${productId}`)
            .set('Cookie', ['token=' + token]);
        expect(res.status).toBe(403);
        expect(deleteProductService).not.toHaveBeenCalled();
    });
});

describe('GET /api/v1/products/barcode/:code', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should return 200 when product found by barcode', async () => {
        vi.mocked(getProductByBarcode).mockResolvedValue({
            id: productId,
            name: 'Test product',
            calories: 100,
            protein: 100,
            carbs: 100,
            fat: 100,
            barcode: '5901234123457',
            imageUrl: '',
            source: 'database',
        });

        const res = await request(app)
            .get('/api/v1/products/barcode/5901234123457')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(200);
        expect(res.body.product.barcode).toBe('5901234123457');
        expect(res.body.product.source).toBe('database');
    });

    it('should return 404 when product not found', async () => {
        vi.mocked(getProductByBarcode).mockRejectedValue(new AppError('Product not found', 404));

        const res = await request(app)
            .get('/api/v1/products/barcode/5901234123457')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(404);
    });

    it('should return 400 when barcode format is invalid', async () => {
        const res = await request(app)
            .get('/api/v1/products/barcode/NOTABARCODE')
            .set('Cookie', ['token=' + token]);

        expect(res.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
        const res = await request(app).get('/api/v1/products/barcode/5901234123457');
        expect(res.status).toBe(401);
    });
});
