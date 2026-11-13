import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    environment: 'node',
  },
});
