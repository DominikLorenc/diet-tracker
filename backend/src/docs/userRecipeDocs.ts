import { registry, errorSchema } from '../swagger';
import { createUserRecipeSchema, updateUserRecipeSchema, copyRecipeSchema } from '../schemas/userSchema';
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

const userRecipeIngredientSchema = z.object({
    id: z.string(),
    productId: z.string(),
    userRecipeId: z.string(),
    quantity: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    product: productSchema,
});

const userRecipeResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    sourceRecipeId: z.string().nullable(),
    createdAt: z.string(),
    userRecipeIngredients: z.array(userRecipeIngredientSchema),
});

registry.registerPath({
    method: 'get',
    path: '/user-recipes',
    tags: ['User Recipes'],
    summary: 'Get all user recipes',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of user recipes',
            content: { 'application/json': { schema: z.object({ userRecipes: z.array(userRecipeResponseSchema) }) } },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/user-recipes',
    tags: ['User Recipes'],
    summary: 'Create a user recipe',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: createUserRecipeSchema } } },
    },
    responses: {
        201: {
            description: 'User recipe created',
            content: {
                'application/json': { schema: z.object({ message: z.string(), userRecipe: userRecipeResponseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/user-recipes/{id}',
    tags: ['User Recipes'],
    summary: 'Update a user recipe',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: updateUserRecipeSchema } } },
    },
    responses: {
        200: {
            description: 'User recipe updated',
            content: {
                'application/json': { schema: z.object({ message: z.string(), userRecipe: userRecipeResponseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'User recipe not found', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/user-recipes/{id}',
    tags: ['User Recipes'],
    summary: 'Delete a user recipe',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'User recipe deleted',
            content: {
                'application/json': { schema: z.object({ message: z.string(), userRecipe: userRecipeResponseSchema }) },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'User recipe not found', content: errorContent },
    },
});

registry.registerPath({
    method: 'post',
    path: '/user-recipes/copy',
    tags: ['User Recipes'],
    summary: 'Copy a global recipe to user recipes',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: copyRecipeSchema } } },
    },
    responses: {
        200: {
            description: 'Recipe copied',
            content: {
                'application/json': { schema: z.object({ message: z.string(), userRecipe: userRecipeResponseSchema }) },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
        404: { description: 'Source recipe not found', content: errorContent },
    },
});
