import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    datasource: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy',
    },
    migrations: {
        seed: 'ts-node prisma/seed.ts',
    },
});