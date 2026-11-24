// The environment of the E2E build and server. Plain JS: the build script (e2e/scripts/build.mjs) and
// playwright.config.ts both read it, so `next build` and `next start` always agree.
//
// Values set here win over .env.local (Next never overrides a variable that is already set), so a developer's local
// settings can't leak into the tested bundle. Anything in .env.local that is not listed here still applies locally.

export const E2E_PORT = Number(process.env.E2E_PORT ?? 3210);
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const e2eEnv = {
  // Own build folder, so a `next dev` in the same checkout keeps its .next (next.config.mjs).
  NEXT_DIST_DIR: '.next-e2e',
  NEXT_TELEMETRY_DISABLED: '1',
  PROJECT_ENV: 'local',
  NEXT_PUBLIC_APP_URL: E2E_BASE_URL,
  // Never called: BACKEND_PROXY_TARGET below makes the client call /api and /auth on the app's own origin, where
  // Playwright answers them (e2e/fake-api). Same-origin also means the fake refresh cookie behaves like the real one.
  NEXT_PUBLIC_BACKEND_URL: 'http://backend.invalid',
  // A closed port: a request the fake API let through would fail loudly instead of reaching a real backend.
  BACKEND_PROXY_TARGET: 'http://127.0.0.1:9',
  // Any valid-looking key; push is blocked in the tests (serviceWorkers: 'block').
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'BE2E-test-key-not-used-0000000000000000000000000000000000000000000000000000000000000',
  // Analytics off.
  NEXT_PUBLIC_POSTHOG_KEY: '',
  // The real driver API (the fake answers it), not the in-browser dev mock.
  NEXT_PUBLIC_DRIVER_API_MOCK: 'false',
  // Feature flags at their develop defaults.
  NEXT_PUBLIC_FF_NALOG_ROUTE_ENTRY: '',
};
