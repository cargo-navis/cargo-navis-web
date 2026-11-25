import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vitest/config';

/**
 * Two projects:
 * - `unit` (npm test, npm run test:coverage): our pure logic in Node, *.test.ts next to the code;
 * - `components` (npm run test:components): our own React components in real Chromium (Vitest browser mode with
 *   Playwright), *.browser.test.tsx. Never the shadcn / Base UI wrappers in src/components/ui.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
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
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          // backendService creates its default client on import and throws without a backend URL.
          env: { NEXT_PUBLIC_BACKEND_URL: 'http://backend.test' },
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        // Find every dependency of the component tests before the run. Otherwise Vite discovers some mid-run (a fresh
        // checkout, CI), reloads, and that first run fails with „Invalid hook call” or a failed import.
        optimizeDeps: { entries: ['src/**/*.browser.test.tsx'] },
        // The browser has no process.env: the values our modules read at import time.
        define: {
          'process.env.NEXT_PUBLIC_BACKEND_URL': JSON.stringify('http://backend.test'),
          'process.env.NEXT_PUBLIC_BACKEND_PROXY': JSON.stringify('false'),
        },
        test: {
          name: 'components',
          include: ['src/**/*.browser.test.tsx'],
          setupFiles: ['src/test/setup.browser.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
