import { z } from 'zod';
import { registry } from '../swagger';

export const measurementsSchema = registry.register(
    'Measurements',
    z.object({
        weight: z.coerce.number().nonnegative(),
        waist: z.coerce.number().nonnegative(),
        hips: z.coerce.number().nonnegative(),
        arm: z.coerce.number().nonnegative(),
    }),
);

export const createMeasurementsSchema = measurementsSchema;

export const measurementsIdSchema = z.uuid();
