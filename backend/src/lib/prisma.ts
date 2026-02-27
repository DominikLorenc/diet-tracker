import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const omit = {
    user: {
        password: true,
    },
};


const prisma = new PrismaClient({ adapter, omit });

export default prisma;