import { Router } from 'express';
import { register, login, logout, me, updateGoals, updateImageUrlController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';
import { registry } from '../swagger';
import { registerSchema, loginSchema, updateGoalsSchema, updateImageUrlSchema } from '../schemas/userSchema';

const router = Router();

registry.registerPath({
    method: 'post',
    path: '/users/register',
    tags: ['Users'],
    summary: 'Zarejestruj nowego użytkownika',
    request: {
        body: {
            content: {
                'application/json': { schema: registerSchema },
            },
        },
    },
    responses: {
        201: { description: 'Użytkownik zarejestrowany' },
        400: { description: 'Błąd walidacji' },
        409: { description: 'Email lub nazwa użytkownika już istnieje' },
    },
});
router.post('/register', authRateLimiter, register);

registry.registerPath({
    method: 'post',
    path: '/users/login',
    tags: ['Users'],
    summary: 'Zaloguj użytkownika',
    request: {
        body: {
            content: {
                'application/json': { schema: loginSchema },
            },
        },
    },
    responses: {
        200: { description: 'Zalogowano, token w cookie' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Nieprawidłowe dane logowania' },
    },
});
router.post('/login', authRateLimiter, login);

router.use(authMiddleware);

registry.registerPath({
    method: 'get',
    path: '/users/me',
    tags: ['Users'],
    summary: 'Pobierz dane zalogowanego użytkownika',
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: 'Dane użytkownika' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/me', me);

registry.registerPath({
    method: 'patch',
    path: '/users/image',
    tags: ['Users'],
    summary: 'Zaktualizuj zdjęcie profilowe',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: updateImageUrlSchema },
            },
        },
    },
    responses: {
        200: { description: 'Zdjęcie zaktualizowane' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.patch('/image', updateImageUrlController);

registry.registerPath({
    method: 'patch',
    path: '/users/goals',
    tags: ['Users'],
    summary: 'Zaktualizuj cele żywieniowe',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: updateGoalsSchema },
            },
        },
    },
    responses: {
        200: { description: 'Cele zaktualizowane' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.patch('/goals', updateGoals);

registry.registerPath({
    method: 'delete',
    path: '/users/logout',
    tags: ['Users'],
    summary: 'Wyloguj użytkownika',
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: 'Wylogowano' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.delete('/logout', logout);

export default router;
