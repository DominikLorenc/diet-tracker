import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const errorSchema = z.object({
    message: z.string(),
    // Only on validation errors (400): the raw Zod issues, one per invalid field
    issues: z
        .array(z.object({ code: z.string(), path: z.array(z.union([z.string(), z.number()])), message: z.string() }))
        .optional(),
});

registry.registerComponent('securitySchemes', 'cookieAuth', {
    type: 'apiKey',
    in: 'cookie',
    name: 'token',
});

export function generateOpenAPIDocument() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            title: 'Diet Tracker API',
            version: '1.0.0',
            description: 'API dla aplikacji do śledzenia diety',
        },
        servers: [{ url: '/api/v1' }],
    });
}
