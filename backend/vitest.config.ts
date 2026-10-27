import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.spec.ts'],
    globalSetup: ['test/support/global-setup.ts'],
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 90_000,
  },
});
