import { registry, errorSchema } from '../swagger';
import { diaryEntrySchema, updateQuantitySchema } from '../schemas/diarySchema';
import { RecipeCategory } from '../generated/prisma';
import { productResponseSchema, decimalString } from './sharedSchemas';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

// The bare row: what the PATCH/DELETE item endpoints return (no relations included)
const diaryItemBaseSchema = z.object({
    id: z.string(),
    diaryEntryId: z.string(),
    productId: z.string().nullable(),
    recipeId: z.string().nullable(),
    userRecipeId: z.string().nullable(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    isEaten: z.boolean(),
    quantity: decimalString,
    createdAt: z.string(),
});

// GET /diary includes the product or recipe with all its ingredients
const diaryItemSchema = diaryItemBaseSchema.extend({
    product: productResponseSchema.nullable(),
    recipe: z
        .object({
            id: z.string(),
            name: z.string(),
            createdAt: z.string(),
            products: z.array(
                z.object({
                    id: z.string(),
                    recipeId: z.string(),
                    productId: z.string(),
                    quantity: decimalString,
                    createdAt: z.string(),
                    product: productResponseSchema,
                }),
            ),
            steps: z.array(z.string()),
            categories: z.array(z.enum(RecipeCategory)),
        })
        .nullable(),
    userRecipe: z
        .object({
            id: z.string(),
            userId: z.string(),
            createdAt: z.string(),
            sourceRecipeId: z.string().nullable(),
            name: z.string(),
            userRecipeIngredients: z.array(
                z.object({
                    id: z.string(),
                    userRecipeId: z.string(),
                    productId: z.string(),
                    quantity: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                    product: productResponseSchema,
                }),
            ),
            steps: z.array(z.string()),
        })
        .nullable(),
});

// The bare day row: what POST /diary and DELETE /diary/{id} return (no items included)
const diaryEntryBaseSchema = z.object({
    id: z.string(),
    date: z.string(),
    userId: z.string(),
    createdAt: z.string(),
});

const diaryEntryResponseSchema = diaryEntryBaseSchema.extend({
    items: z.array(diaryItemSchema),
});

registry.registerPath({
    method: 'post',
    path: '/diary',
    tags: ['Diary'],
    summary: 'Add diary entry',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: diaryEntrySchema } } },
    },
    responses: {
        201: {
            description: 'Entry added',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), newDiaryEntry: diaryEntryBaseSchema }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/diary',
    tags: ['Diary'],
    summary: 'Get user diary',
    security: [{ cookieAuth: [] }],
    request: {
        query: z.object({ date: z.string().optional() }),
    },
    responses: {
        200: {
            description: 'Diary entries',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), diaryEntries: z.array(diaryEntryResponseSchema) }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/diary/{id}',
    tags: ['Diary'],
    summary: 'Delete diary entry',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Entry deleted',
            content: {
                'application/json': { schema: z.object({ message: z.string(), deleted: diaryEntryBaseSchema }) },
            },
        },
        404: { description: 'Entry not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/diary/{id}/eaten',
    tags: ['Diary'],
    summary: 'Toggle eaten status of diary item',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: z.object({ isEaten: z.boolean() }) } } },
    },
    responses: {
        200: {
            description: 'Item updated',
            content: {
                'application/json': { schema: z.object({ message: z.string(), updated: diaryItemBaseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Item not found', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/diary/{id}/quantity',
    tags: ['Diary'],
    summary: 'Update quantity of diary item',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: updateQuantitySchema } } },
    },
    responses: {
        200: {
            description: 'Item updated',
            content: {
                'application/json': { schema: z.object({ message: z.string(), updated: diaryItemBaseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Item not found', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/diary/{id}/item',
    tags: ['Diary'],
    summary: 'Delete diary item',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Item deleted',
            content: {
                'application/json': { schema: z.object({ message: z.string(), deleted: diaryItemBaseSchema }) },
            },
        },
        404: { description: 'Item not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
