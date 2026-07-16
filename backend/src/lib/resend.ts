import 'dotenv/config';
import { Resend } from 'resend';

// Single configured Resend client, mirroring lib/prisma.ts — one instance the
// whole app shares, created from the API key in the environment.
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;
