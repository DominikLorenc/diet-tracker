import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import cookieParser from 'cookie-parser';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.use(cors());
app.use(globalRateLimiter);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
    res.send({ status: 'ok', message: 'API is running' });
});

app.use('/api/v1', apiRoutes);

app.use(errorHandler);
export default app;
