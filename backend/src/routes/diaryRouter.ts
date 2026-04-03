import { Router } from 'express';
import { createDiaryEntry, getDiary, deleteDiaryEntry, deleteDiaryItem } from '../controllers/diaryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry, errorSchema } from '../swagger';
import { diaryEntrySchema } from '../schemas/diarySchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

const errorContent = { 'application/json': { schema: errorSchema } };

const diaryItemSchema = z.object({
    id: z.string(),
    diaryEntryId: z.string(),
    productId: z.string().nullable(),
    recipeId: z.string().nullable(),
    mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
    quantity: z.number(),
    createdAt: z.string(),
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
router.post('/', createDiaryEntry);

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
router.get('/', getDiary);

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
router.delete('/:id', deleteDiaryEntry);

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
router.delete('/:id/item', deleteDiaryItem);

export default router;
