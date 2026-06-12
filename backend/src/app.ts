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

// Dozwolone originy z env (CSV), z fallbackiem na lokalny dev.
// Każdy element przycinamy z białych znaków, żeby spacja po przecinku nie psuła dopasowania.
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
