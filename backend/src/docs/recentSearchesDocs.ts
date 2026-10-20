import { registry, errorSchema } from '../swagger';
import { z } from 'zod';
import { productResponseSchema } from './sharedSchemas';

const errorContent = { 'application/json': { schema: errorSchema } };

const recentSearchSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    createdAt: z.string(),
});

const recentSearchWithProductSchema = recentSearchSchema.extend({
    product: productResponseSchema.nullable(),
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
