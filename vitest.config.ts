import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // TypeScript support via esbuild (built-in, no extra config needed)
    // Test patterns
    include: ['**/*.test.ts', '**/*.spec.ts'],
    // Exclusions
    exclude: ['node_modules', 'dist', '.next', '**/node_modules/**', '**/dist/**', '**/.next/**'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '.next/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/vitest.config.ts',
      ],
    },
    // Environment
    environment: 'node',
    // Globals (optional, set to true if you want describe/it/expect without imports)
    globals: false,
  },
});
