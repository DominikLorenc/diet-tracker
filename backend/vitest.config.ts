import { defineConfig } from 'vitest/config';

export default defineConfig({
    server: {
        sourcemapIgnoreList: (sourcePath) => sourcePath.includes('generated/prisma'),
    },
    test: {
        environment: 'node',
    },
});
