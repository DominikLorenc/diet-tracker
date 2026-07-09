import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { generateOpenAPIDocument } from './swagger';
import './docs';

const openApiDocument = generateOpenAPIDocument();

const app = express();

// Trust EXACTLY one proxy hop (Railway) so Express reads the real client IP from
// X-Forwarded-For. Without it the rate limiter would see one shared proxy IP for everyone.
// Intentionally `1`, not `true`: `true` trusts the whole chain, letting a client spoof
// X-Forwarded-For to bypass rate limiting (a new IP = a fresh bucket).
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:3001')
    .split(',')
    .map((o) => o.trim());

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);
app.use(globalRateLimiter);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.send({ status: 'ok', message: 'API is running' });
});

if (process.env.NODE_ENV !== 'production') {
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
    app.get('/api/v1/docs.json', (req, res) => {
        res.json(openApiDocument);
    });
}
app.use('/api/v1', apiRoutes);

app.use(errorHandler);
export default app;
