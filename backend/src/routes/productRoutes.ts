import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry, errorSchema } from '../swagger';
import { productSchema } from '../schemas/productSchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

const errorContent = { 'application/json': { schema: errorSchema } };

const productResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    imageUrl: z.string(),
    createdAt: z.string(),
});

registry.registerPath({
    method: 'post',
    path: '/products',
    tags: ['Products'],
    summary: 'Create a new product',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: productSchema } } },
    },
    responses: {
        201: {
            description: 'Product created',
            content: {
                'application/json': { schema: z.object({ message: z.string(), product: productResponseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.post('/', createProduct);

registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    summary: 'Get all products',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of products',
            content: { 'application/json': { schema: z.object({ products: z.array(productResponseSchema) }) } },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/', getProducts);

registry.registerPath({
    method: 'get',
    path: '/products/search',
    tags: ['Products'],
    summary: 'Search products',
    security: [{ cookieAuth: [] }],
    request: {
        query: z.object({ search: z.string().min(1) }),
    },
    responses: {
        200: {
            description: 'Search results',
            content: { 'application/json': { schema: z.object({ products: z.array(productResponseSchema) }) } },
        },
        400: { description: 'Missing search term', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/search', searchProducts);

registry.registerPath({
    method: 'get',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Get product by ID',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Product',
            content: { 'application/json': { schema: z.object({ product: productResponseSchema }) } },
        },
        404: { description: 'Product not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/:id', getProduct);

registry.registerPath({
    method: 'patch',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Update product',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: productSchema.partial() } } },
    },
    responses: {
        200: {
            description: 'Product updated',
            content: { 'application/json': { schema: z.object({ product: productResponseSchema }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        404: { description: 'Product not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.patch('/:id', updateProduct);

registry.registerPath({
    method: 'delete',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Delete product',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Product deleted',
            content: {
                'application/json': { schema: z.object({ message: z.string(), deleted: productResponseSchema }) },
            },
        },
        404: { description: 'Product not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.delete('/:id', deleteProduct);

export default router;
