import { registry, errorSchema } from '../swagger';
import { recipeSchema, recipeListQuerySchema, recipeCategoryCountsQuerySchema } from '../schemas/recipeSchema';
import { RecipeCategory } from '../generated/prisma';
import { z } from 'zod';
import { productResponseSchema, forbiddenResponse } from './sharedSchemas';

const errorContent = { 'application/json': { schema: errorSchema } };

const recipeResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    steps: z.array(z.string()),
    categories: z.array(z.enum(RecipeCategory)),
    products: z.array(
        z.object({
            id: z.string(),
            quantity: z.string(),
            productId: z.string(),
            recipeId: z.string(),
            createdAt: z.string(),
            product: productResponseSchema,
        }),
    ),
});

registry.registerPath({
    method: 'post',
    path: '/recipes',
    tags: ['Recipes'],
    summary: 'Create a recipe',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: recipeSchema } } },
    },
    responses: {
        201: {
            description: 'Recipe created',
            content: {
                'application/json': { schema: z.object({ message: z.string(), recipe: recipeResponseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        403: forbiddenResponse,
    },
});

registry.registerPath({
    method: 'get',
    path: '/recipes',
    tags: ['Recipes'],
    summary: 'Get all recipes (paginated, searchable, filterable by categories)',
    security: [{ cookieAuth: [] }],
    request: {
        query: recipeListQuerySchema,
    },
    responses: {
        200: {
            description: 'Page of recipes',
            content: {
                'application/json': {
                    schema: z.object({
                        recipes: z.array(recipeResponseSchema),
                        total: z.number(),
                        page: z.number(),
                        limit: z.number(),
                    }),
                },
            },
        },
        400: { description: 'Invalid query parameters', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/recipes/categories',
    tags: ['Recipes'],
    summary: 'Get the number of recipes in every category, optionally narrowed by name search',
    security: [{ cookieAuth: [] }],
    request: {
        query: recipeCategoryCountsQuerySchema,
    },
    responses: {
        200: {
            description: 'Recipe count per category, in enum order, including empty categories',
            content: {
                'application/json': {
                    schema: z.object({
                        categories: z.array(z.object({ category: z.enum(RecipeCategory), count: z.number() })),
                    }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Get recipe by ID',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Recipe',
            content: { 'application/json': { schema: z.object({ recipe: recipeResponseSchema }) } },
        },
        404: { description: 'Recipe not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Update recipe',
    // Full replace, not a partial patch: the controller validates the whole recipeSchema
    description:
        'Replaces name, ingredients and steps. Categories are optional: when omitted, the saved ones are kept.',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: recipeSchema } } },
    },
    responses: {
        200: {
            description: 'Recipe updated',
            content: { 'application/json': { schema: z.object({ recipe: recipeResponseSchema }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        404: { description: 'Recipe not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        403: forbiddenResponse,
    },
});

registry.registerPath({
    method: 'delete',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Delete recipe',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Recipe deleted',
            content: {
                'application/json': { schema: z.object({ message: z.string(), deleted: recipeResponseSchema }) },
            },
        },
        404: { description: 'Recipe not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        403: forbiddenResponse,
    },
});
