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

// Reject requests that carry a Content-Encoding header instead of letting
// body-parser decompress them. This app only receives plain JSON from the
// browser, so it never needs compressed request bodies. Refusing them closes
// the pre-auth decoder attack surface (e.g. the Brotli OOB-write RCE,
// CVE-2026-111497) independently of the Node.js version.
// IMPORTANT: must run BEFORE express.json() — otherwise body-parser already
// decompressed the body before this guard ever sees it.
app.use((req, res, next) => {
    if (req.headers['content-encoding']) {
        res.status(415).send('unsupported media/encoding');
    } else {
        next();
    }
});

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
