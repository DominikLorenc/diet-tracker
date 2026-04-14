import { Router } from 'express';
import { createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe } from '../controllers/recipeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry, errorSchema } from '../swagger';
import { recipeSchema } from '../schemas/recipeSchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

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

const recipeResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    products: z.array(
        z.object({
            id: z.string(),
            quantity: z.string(),
            productId: z.string(),
            recipeId: z.string(),
            createdAt: z.string(),
            product: productSchema,
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
    },
});
router.post('/', createRecipe);

registry.registerPath({
    method: 'get',
    path: '/recipes',
    tags: ['Recipes'],
    summary: 'Get all recipes',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of recipes',
            content: { 'application/json': { schema: z.object({ recipes: z.array(recipeResponseSchema) }) } },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.get('/', getRecipes);

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
router.get('/:id', getRecipe);

registry.registerPath({
    method: 'patch',
    path: '/recipes/{id}',
    tags: ['Recipes'],
    summary: 'Update recipe',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: recipeSchema.partial() } } },
    },
    responses: {
        200: {
            description: 'Recipe updated',
            content: { 'application/json': { schema: z.object({ recipe: recipeResponseSchema }) } },
        },
        400: { description: 'Validation error', content: errorContent },
        404: { description: 'Recipe not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
router.patch('/:id', updateRecipe);

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
    },
});
router.delete('/:id', deleteRecipe);

export default router;
