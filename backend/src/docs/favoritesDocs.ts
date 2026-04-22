import { registry, errorSchema } from '../swagger';
import { productFavoriteSchema, recipeFavoriteSchema } from '../schemas/productFavoriteSchema';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

registry.registerPath({
    method: 'get',
    path: '/favorites/products',
    tags: ['Favorites'],
    summary: 'Get favorite products',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of favorite products',
            content: {
                'application/json': {
                    schema: z.object({ favorites: z.array(productFavoriteSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/favorites/products',
    tags: ['Favorites'],
    summary: 'Add product to favorites',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: z.object({ productId: z.uuid() }) },
            },
        },
    },
    responses: {
        201: {
            description: 'Product added to favorites',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), favorite: productFavoriteSchema }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        409: { description: 'Already in favorites', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/favorites/products/{productId}',
    tags: ['Favorites'],
    summary: 'Remove product from favorites',
    security: [{ cookieAuth: [] }],
    request: { params: z.object({ productId: z.uuid() }) },
    responses: {
        200: {
            description: 'Removed from favorites',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Not found', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/favorites/recipes',
    tags: ['Favorites'],
    summary: 'Get favorite recipes',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of favorite recipes',
            content: {
                'application/json': {
                    schema: z.object({ favorites: z.array(recipeFavoriteSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/favorites/recipes',
    tags: ['Favorites'],
    summary: 'Add recipe to favorites',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: z.object({ recipeId: z.uuid() }) },
            },
        },
    },
    responses: {
        201: {
            description: 'Recipe added to favorites',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), favorite: recipeFavoriteSchema }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        409: { description: 'Already in favorites', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/favorites/recipes/{recipeId}',
    tags: ['Favorites'],
    summary: 'Remove recipe from favorites',
    security: [{ cookieAuth: [] }],
    request: { params: z.object({ recipeId: z.uuid() }) },
    responses: {
        200: {
            description: 'Removed from favorites',
            content: { 'application/json': { schema: z.object({ message: z.string() }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Not found', content: errorContent },
    },
});
