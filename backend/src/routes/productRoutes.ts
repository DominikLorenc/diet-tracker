import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';
import { registry } from '../swagger';
import { productSchema } from '../schemas/productSchema';
import { z } from 'zod';

const router = Router();

router.use(authMiddleware);

registry.registerPath({
    method: 'post',
    path: '/products',
    tags: ['Products'],
    summary: 'Utwórz nowy produkt',
    security: [{ cookieAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': { schema: productSchema },
            },
        },
    },
    responses: {
        201: { description: 'Produkt utworzony' },
        400: { description: 'Błąd walidacji' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.post('/', createProduct);

registry.registerPath({
    method: 'get',
    path: '/products',
    tags: ['Products'],
    summary: 'Pobierz wszystkie produkty',
    security: [{ cookieAuth: [] }],
    responses: {
        200: { description: 'Lista produktów' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/', getProducts);

registry.registerPath({
    method: 'get',
    path: '/products/search',
    tags: ['Products'],
    summary: 'Wyszukaj produkty',
    security: [{ cookieAuth: [] }],
    request: {
        query: z.object({
            search: z.string().min(1),
        }),
    },
    responses: {
        200: { description: 'Wyniki wyszukiwania' },
        400: { description: 'Brak frazy wyszukiwania' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/search', searchProducts);

registry.registerPath({
    method: 'get',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Pobierz produkt po ID',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Produkt' },
        404: { description: 'Produkt nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.get('/:id', getProduct);

registry.registerPath({
    method: 'patch',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Zaktualizuj produkt',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
        body: {
            content: {
                'application/json': { schema: productSchema.partial() },
            },
        },
    },
    responses: {
        200: { description: 'Produkt zaktualizowany' },
        400: { description: 'Błąd walidacji' },
        404: { description: 'Produkt nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.patch('/:id', updateProduct);

registry.registerPath({
    method: 'delete',
    path: '/products/{id}',
    tags: ['Products'],
    summary: 'Usuń produkt',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({
            id: z.uuid(),
        }),
    },
    responses: {
        200: { description: 'Produkt usunięty' },
        404: { description: 'Produkt nie znaleziony' },
        401: { description: 'Brak autoryzacji' },
    },
});
router.delete('/:id', deleteProduct);

export default router;
