import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // Run tests in single thread to avoid SQLite file lock contention
    fileParallelism: false,
    testTimeout: 20000,
  },
});
