import { registry, errorSchema } from '../swagger';
import { productSchema, productListQuerySchema } from '../schemas/productSchema';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

const productResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    imageUrl: z.string(),
    barcode: z.string().nullable(),
    createdAt: z.string(),
});

const barcodeProductResponseSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    imageUrl: z.string(),
    barcode: z.string(),
    source: z.enum(['database', 'open_food_facts']),
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

registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    summary: 'Get all products (paginated, searchable)',
    security: [{ cookieAuth: [] }],
    request: {
        query: productListQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated list of products',
            content: {
                'application/json': {
                    schema: z.object({
                        products: z.array(productResponseSchema),
                        total: z.number(),
                        page: z.number(),
                        limit: z.number(),
                    }),
                },
            },
        },
        400: { description: 'Invalid query params', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

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

registry.registerPath({
    method: 'get',
    path: '/products/barcode/{code}',
    tags: ['Products'],
    summary: 'Get product by barcode',
    description:
        'Looks up a product by EAN-8 or EAN-13 barcode. If not in the database and the caller is an admin, falls back to Open Food Facts.',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ code: z.string().regex(/^\d{8}$|^\d{13}$/) }),
    },
    responses: {
        200: {
            description: 'Product found',
            content: { 'application/json': { schema: z.object({ product: barcodeProductResponseSchema }) } },
        },
        400: { description: 'Invalid barcode format (must be 8 or 13 digits)', content: errorContent },
        404: { description: 'Product not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

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
