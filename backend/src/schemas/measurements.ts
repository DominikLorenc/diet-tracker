import { z } from 'zod';
import { registry } from '../swagger';

export const measurementsSchema = registry.register(
    'Measurements',
    z.object({
        date: z.coerce
            .date()
            .refine((date) => {
                return date <= new Date();
            }, 'Data nie może być w przyszłości')
            .optional(),
        weight: z.coerce.number().nonnegative(),
        waist: z.coerce.number().nonnegative(),
        hips: z.coerce.number().nonnegative(),
        arm: z.coerce.number().nonnegative(),
    }),
);

export const measurementsIdSchema = z.uuid();
