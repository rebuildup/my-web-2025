import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
        minForks: 1,
        maxForks: 1,
        execArgv: ['--max-old-space-size=12288'],
      },
    },
    // Add memory and timeout settings
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 30000,
    // Prevent memory leaks
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Additional memory leak prevention
    sequence: {
      concurrent: false,
    },
    maxConcurrency: 1,
    // Force garbage collection between tests
    forceRerunTriggers: ['**/vitest.config.*', '**/vite.config.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/app/layout.tsx',
        'public/',
        '.next/',
        'coverage/',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/tests/**',
      '**/playwright-report/**',
      '**/test-results/**',
      '**/*.spec.ts',
      '**/performance.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
