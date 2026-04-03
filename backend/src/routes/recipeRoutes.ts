import { Router } from 'express';
import { createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe } from '../controllers/recipeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry } from '../swagger';
import { recipeSchema } from '../schemas/recipeSchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

registry.registerPath({
    method: 'post',
    path: '/recipes',
    tags: ['Recipes'],
    summary: 'Utwórz przepis',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: recipeSchema },
            },
        },
    },
    responses: {
        201: { description: 'Przepis utworzony' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.post('/', createRecipe);

registry.registerPath({
    method: 'get',
    path: '/recipes',
    tags: ['Recipes'],
    summary: 'Pobierz wszystkie przepisy',
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: 'Lista przepisów' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/', getRecipes);

registry.registerPath({
    method: 'get',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Pobierz przepis po ID',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Przepis' },
        404: { description: 'Przepis nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/:id', getRecipe);

registry.registerPath({
    method: 'patch',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Zaktualizuj przepis',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
        body: {
            content: {
                'application/json': { schema: recipeSchema.partial() },
            },
        },
    },
    responses: {
        200: { description: 'Przepis zaktualizowany' },
        400: { description: 'Błąd walidacji' },
        404: { description: 'Przepis nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.patch('/:id', updateRecipe);

registry.registerPath({
    method: 'delete',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Usuń przepis',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Przepis usunięty' },
        404: { description: 'Przepis nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.delete('/:id', deleteRecipe);

export default router;
