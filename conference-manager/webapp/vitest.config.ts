import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './config/vitest.setup.tsx',
    css: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],
    exclude: [
      '**/legacy/**', // Exclude the entire legacy folder
      '**/legacy/**/*', // Double-check exclusion of all nested files
      'src/**/index.ts',
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.stories.ts',
      'src/**/*.stories.tsx',
      'src/mocks/**',
      'src/stories/**',
      'src/__tests__/**',
      'node_modules/**',
    ],
    coverage: {
      provider: 'v8', // Use 'v8' for built-in coverage (faster) or 'c8' for advanced reports
      reportsDirectory: './coverage',
      include: ['src/**/*.ts', 'src/**/*.tsx'], // Include source files
      exclude: [
        '**/legacy/**',
        '**/legacy/**/*',
        'src/**/index.ts',
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/**/*.stories.ts',
        'src/**/*.stories.tsx', // Exclude Storybook stories
        'src/mocks/**', // Exclude mocks
        'src/stories/**',
        'src/__tests__/**', // Exclude test directories
        'node_modules/**', // Always exclude dependencies
      ],
      reporter: ['text', 'html', 'lcov'],
      branches: 80, // Minimum required coverage percentage
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
});
