import { z } from 'zod';
import { ProductCategory } from '../generated/prisma';
import { errorSchema } from '../swagger';

// Prisma Decimal columns are serialized to JSON as strings ("12.5"), never numbers,
// so every response schema uses this for calories, macros, quantities and measurements.
export const decimalString = z.string();

// A product exactly as Prisma returns it (including when nested in recipes, favorites, diary)
export const productResponseSchema = z.object({
    id: z.string(),
    name: z.string(),
    calories: decimalString,
    carbs: decimalString,
    protein: decimalString,
    fat: decimalString,
    imageUrl: z.string(),
    barcode: z.string().nullable(),
    createdAt: z.string(),
    category: z.enum(ProductCategory),
    // Nullable: only some products carry a per-piece weight (e.g. one egg = 60 g)
    gramsPerUnit: decimalString.nullable(),
});

// Shared answer of admin-only routes (requireAdmin) for a logged-in non-admin
export const forbiddenResponse = {
    description: 'Forbidden: admin only',
    content: { 'application/json': { schema: errorSchema } },
};
