import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const omit = {
    user: {
        password: true,
    },
};

const prisma = new PrismaClient({ adapter, omit }) as unknown as PrismaClient;

export default prisma;
