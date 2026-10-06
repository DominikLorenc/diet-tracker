import { z } from 'zod';
import { registry } from '../swagger';

const MAX_UTC_OFFSET_MS = 14 * 60 * 60 * 1000;

export const measurementsSchema = registry.register(
    'Measurements',
    z.object({
        date: z.coerce
            .date()
            // "YYYY-MM-DD" is parsed as UTC midnight, but the client sends its LOCAL
            // calendar day — which can be up to UTC+14 ahead of the server.
            .refine((date) => {
                return date.getTime() <= Date.now() + MAX_UTC_OFFSET_MS;
            }, 'Date cannot be in the future')
            .optional(),
        weight: z.coerce.number().nonnegative(),
        waist: z.coerce.number().nonnegative(),
        hips: z.coerce.number().nonnegative(),
        arm: z.coerce.number().nonnegative(),
        thigh: z.coerce.number().nonnegative(),
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
