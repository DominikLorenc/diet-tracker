import { registry, errorSchema } from '../swagger';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.number(),
    carbs: z.number(),
    protein: z.number(),
    fat: z.number(),
    imageUrl: z.string(),
    createdAt: z.string(),
});

const recentSearchSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    createdAt: z.string(),
});

const recentSearchWithProductSchema = recentSearchSchema.extend({
    product: productSchema.nullable(),
});

registry.registerPath({
    method: 'post',
    path: '/recent-searches',
    tags: ['Recent Searches'],
    summary: 'Add a product to recent searches',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({ productId: z.string().uuid() }),
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Recent search added',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), newRecentSearch: recentSearchSchema }),
                },
            },
        },
        400: { description: 'Invalid product ID', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/recent-searches',
    tags: ['Recent Searches'],
    summary: 'Get recent searches for the logged-in user',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of recent searches',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), recentSearches: z.array(recentSearchWithProductSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
