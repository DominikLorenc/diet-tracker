import { z } from 'zod';
import { registry } from '../swagger';

export const measurementsSchema = registry.register(
    'Measurements',
    z.object({
        date: z.coerce
            .date()
            .refine((date) => {
                return date <= new Date();
            }, 'Date cannot be in the future')
            .optional(),
        weight: z.coerce.number().nonnegative(),
        waist: z.coerce.number().nonnegative(),
        hips: z.coerce.number().nonnegative(),
        arm: z.coerce.number().nonnegative(),
    }),
);

export const dateMeasurementSchema = z
    .object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
    })
    .refine(({ startDate, endDate }) => {
        return startDate <= endDate;
    }, 'Start date cannot be later than end date');

export const measurementsIdSchema = z.uuid();
