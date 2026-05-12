import { registry, errorSchema } from '../swagger';
import { diaryEntrySchema } from '../schemas/diarySchema';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

const productSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: z.string(),
    carbs: z.string(),
    protein: z.string(),
    fat: z.string(),
    imageUrl: z.string(),
    createdAt: z.string(),
});

const diaryItemSchema = z.object({
    id: z.string(),
    diaryEntryId: z.string(),
    productId: z.string().nullable(),
    recipeId: z.string().nullable(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    quantity: z.string(),
    createdAt: z.string(),
    product: productSchema.nullable(),
    recipe: z
        .object({
            id: z.string(),
            name: z.string(),
            products: z.array(
                z.object({
                    quantity: z.string(),
                    product: productSchema,
                }),
            ),
        })
        .nullable(),
    userRecipeId: z.string().nullable(),
    userRecipe: z
        .object({
            id: z.string(),
            userId: z.string(),
            createdAt: z.string(),
            sourceRecipeId: z.string(),
            name: z.string(),
            userRecipeIngredients: z.array(
                z.object({
                    id: z.string(),
                    userRecipeId: z.string(),
                    productId: z.string(),
                    quantity: z.string(),
                    createdAt: z.string(),
                    updatedAt: z.string(),
                    product: productSchema,
                }),
            ),
        })
        .nullable(),
});

const diaryEntryResponseSchema = z.object({
    id: z.string(),
    date: z.string(),
    userId: z.string(),
    createdAt: z.string(),
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
                    schema: z.object({ message: z.string(), newDiaryEntry: diaryEntryResponseSchema }),
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
                'application/json': { schema: z.object({ message: z.string(), deleted: diaryEntryResponseSchema }) },
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
            content: { 'application/json': { schema: z.object({ message: z.string(), updated: diaryItemSchema }) } },
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
            content: { 'application/json': { schema: z.object({ message: z.string(), deleted: diaryItemSchema }) } },
        },
        404: { description: 'Item not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
