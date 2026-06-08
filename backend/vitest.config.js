import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['index.js', 'services/**/*.js'],
      exclude: ['tests/**', 'test-runner.js', 'node_modules/**', 'public/**']
    }
  }
});
