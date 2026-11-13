import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC emits the decorator metadata that NestJS dependency injection needs;
// the default esbuild transform does not.
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    root: './',
    include: ['src/**/*.spec.ts'],
    environment: 'node',
    reporters: [
      'default',
      ['vitest-sonar-reporter', { outputFile: 'coverage/test-report.xml' }],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/main.ts', 'src/**/*.module.ts'],
      reportsDirectory: 'coverage',
      reporter: ['text', 'lcov'],
    },
  },
});
