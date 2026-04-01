import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    skip: () => process.env.NODE_ENV === 'test',
});
