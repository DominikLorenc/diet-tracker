import { z } from 'zod';
import { registry } from '../swagger';
import { ProductCategory } from '../generated/prisma';

export const productSchema = registry.register(
    'Product',
    z.object({
        name: z.string().min(1, 'Name is required'),
        calories: z.number().nonnegative('Calories must be a positive number'),
        carbs: z.number().nonnegative('Carbs must be a positive number'),
        protein: z.number().nonnegative('Protein must be a positive number'),
        fat: z.number().nonnegative('Fat must be a positive number'),
        category: z.enum(ProductCategory),
        imageUrl: z.string().optional(),
        barcode: z
            .string()
            .regex(/^\d{8}$|^\d{13}$/, 'Barcode must be 8 or 13 digits')
            .optional(),
    }),
);

export const updateProductSchema = productSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export const productIdSchema = z.uuid({ message: 'Product ID must be a valid UUID' });

export const searchProductSchema = z.object({
    search: z.string().min(1, 'Search term is required'),
});

export const barcodeCodeSchema = z.string().regex(/^\d{8}$|^\d{13}$/, 'Barcode must be 8 or 13 digits');

export const productListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .default(20)
        .transform((v) => Math.min(v, 100)),
    search: z.string().trim().max(100).optional(),
});
