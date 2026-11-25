import { defineConfig, devices } from '@playwright/test';

import { E2E_BASE_URL, E2E_PORT, e2eEnv } from './e2e/env.mjs';
import { AUTH_STATE } from './e2e/support/paths';

/**
 * E2E tests (e2e/README.md). They run against a production build (`npm run e2e:build`, then `next start` below) on
 * its own port, with every /api and /auth call answered by the fake API in the browser (e2e/fake-api).
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [['github'], ['html', { open: 'never', outputFolder: 'e2e/.report' }]] : [['list']],
  use: {
    baseURL: E2E_BASE_URL,
    locale: 'hr-HR',
    timezoneId: 'Europe/Zagreb',
    // The login tip, toasts and dialogs: no motion to wait for. The clock and Math.random are set per test
    // (e2e/support/test.ts).
    reducedMotion: 'reduce',
    // A service worker's requests would skip page.route (and the push worker isn't under test).
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'desktop',
      testMatch: /\.spec\.ts/,
      // The driver portal is a phone app (e2e/areas/driver.spec.ts runs on the phone project only).
      testIgnore: /driver\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: AUTH_STATE },
    },
    {
      name: 'phone',
      testMatch: /\.spec\.ts/,
      dependencies: ['setup'],
      // iPhone 15 viewport, touch and user agent, in Chromium (quicker and steadier than WebKit).
      use: { ...devices['iPhone 15'], defaultBrowserType: 'chromium', storageState: AUTH_STATE },
    },
  ],
  webServer: {
    command: `npx next start -p ${E2E_PORT}`,
    url: `${E2E_BASE_URL}/login`,
    env: e2eEnv,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
