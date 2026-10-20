import { Response } from 'express';
import { z } from 'zod';

// Every error response keeps `message` a readable string (the frontend shows it as text);
// the raw Zod issues go to `issues` for anyone who needs per-field details.
export const sendValidationError = (res: Response, error: z.ZodError, status = 400): Response => {
    const [firstIssue] = error.issues;
    const field = firstIssue?.path.join('.');
    const message = firstIssue ? (field ? `${field}: ${firstIssue.message}` : firstIssue.message) : 'Invalid input';
    return res.status(status).json({ message, issues: error.issues });
};
