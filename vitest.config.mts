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
    // npm run test:coverage. Only our own logic: plain .ts modules (rules, formatting, mapping, services). Not React
    // components or hooks, not the one-line API wrappers (both covered by the E2E tests), not the shadcn / Base UI
    // wrappers in src/components/ui, not types or static data.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      include: ['src/lib/**/*.ts', 'src/pages-components/**/*.ts', 'src/components/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
        '**/index.ts',
        'src/components/ui/**',
        'src/lib/api/**',
        'src/lib/hooks/**',
        '**/use[A-Z]*.ts',
        // Static data and the driver portal's dev-only mock.
        'src/lib/utils/countries.const.ts',
        'src/lib/services/driverMock/**',
      ],
      // The floor (CI fails below it), a few points under today's numbers (Nov 2026: 89 / 88 / 88 / 84). Raise it as
      // coverage grows; never lower it to make a change pass.
      thresholds: { lines: 85, statements: 85, functions: 85, branches: 80 },
    },
  },
});
