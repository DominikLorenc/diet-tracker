import { registry, errorSchema } from '../swagger';
import { measurementsSchema } from '../schemas/measurements';
import { z } from 'zod';

const errorContent = { 'application/json': { schema: errorSchema } };

const decimalResponseSchema = z.union([z.number()]);
const measurementResponseSchema = z.object({
    id: z.uuid(),
    userId: z.uuid(),
    date: z.iso.datetime(),
    weight: decimalResponseSchema,
    waist: decimalResponseSchema,
    hips: decimalResponseSchema,
    arm: decimalResponseSchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
});

registry.registerPath({
    method: 'post',
    path: '/measurements',
    tags: ['Measurements'],
    summary: 'Create a new measurement',
    security: [{ cookieAuth: [] }],
    request: {
        body: { content: { 'application/json': { schema: measurementsSchema } } },
    },
    responses: {
        201: {
            description: 'Measurement created',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        measurement: measurementResponseSchema,
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/measurements',
    tags: ['Measurements'],
    summary: 'Get all measurements',
    security: [{ cookieAuth: [] }],
    responses: {
        200: {
            description: 'List of measurements',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        measurements: z.array(measurementResponseSchema),
                    }),
                },
            },
        },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'get',
    path: '/measurements/{id}',
    tags: ['Measurements'],
    summary: 'Get measurement by ID',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Measurement',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        measurement: measurementResponseSchema,
                    }),
                },
            },
        },
        404: { description: 'Measurement not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'patch',
    path: '/measurements/{id}',
    tags: ['Measurements'],
    summary: 'Update measurement',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
        body: { content: { 'application/json': { schema: measurementsSchema.partial() } } },
    },
    responses: {
        200: {
            description: 'Measurement updated',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        measurement: measurementResponseSchema,
                    }),
                },
            },
        },
        400: { description: 'Validation error', content: errorContent },
        404: { description: 'Measurement not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});

registry.registerPath({
    method: 'delete',
    path: '/measurements/{id}',
    tags: ['Measurements'],
    summary: 'Delete measurement',
    security: [{ cookieAuth: [] }],
    request: {
        params: z.object({ id: z.uuid() }),
    },
    responses: {
        200: {
            description: 'Measurement deleted',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string(), deleted: measurementResponseSchema }),
                },
            },
        },
        404: { description: 'Measurement not found', content: errorContent },
        401: { description: 'Unauthorized', content: errorContent },
    },
});
