import { Router } from 'express';
import { createDiaryEntry, getDiary, deleteDiaryEntry, deleteDiaryItem } from '../controllers/diaryController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry } from '../swagger';
import { diaryEntrySchema } from '../schemas/diarySchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

registry.registerPath({
    method: 'post',
    path: '/diary',
    tags: ['Diary'],
    summary: 'Dodaj wpis do dziennika',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: diaryEntrySchema },
            },
        },
    },
    responses: {
        201: { description: 'Wpis dodany' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.post('/', createDiaryEntry);

registry.registerPath({
    method: 'get',
    path: '/diary',
    tags: ['Diary'],
    summary: 'Pobierz dziennik użytkownika',
    security: [{ cookieAuth: [] }],
    request: {
        query: z.object({
            date: z.string().optional(),
        }),
    },
    responses: {
        200: { description: 'Wpisy dziennika' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/', getDiary);

registry.registerPath({
    method: 'delete',
    path: '/diary/{id}',
    tags: ['Diary'],
    summary: 'Usuń wpis z dziennika',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Wpis usunięty' },
        404: { description: 'Wpis nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.delete('/:id', deleteDiaryEntry);

registry.registerPath({
    method: 'delete',
    path: '/diary/{id}/item',
    tags: ['Diary'],
    summary: 'Usuń pozycję z wpisu dziennika',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Pozycja usunięta' },
        404: { description: 'Pozycja nie znaleziona' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.delete('/:id/item', deleteDiaryItem);

export default router;
