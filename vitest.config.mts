import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    // backendService creates its default client on import and throws without a backend URL.
    env: { NEXT_PUBLIC_BACKEND_URL: 'http://backend.test' },
    include: ['src/**/*.test.ts'],
  },
});
