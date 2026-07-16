import crypto from 'node:crypto';

export const hashToken = (token: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return hashedToken;
};
