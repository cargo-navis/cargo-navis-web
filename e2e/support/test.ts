import { test as base } from '@playwright/test';

import { FakeApi } from '../fake-api';
import { seedRandom } from './random';
import { NOW, startServerClock } from './time';

export { expect } from '@playwright/test';

interface Options {
  /** The browser clock's start; it then runs normally. Default NOW (e2e/support/time.ts). */
  now: Date;
  /** Math.random seed (e2e/support/random.ts). */
  randomSeed: number;
}

interface Fixtures {
  /** The fake backend for this test: its data (`fakeApi.db`), overrides and recorded requests. */
  fakeApi: FakeApi;
}

/**
 * Every E2E test imports `test` from here, not from @playwright/test. Before the first page loads, each test gets:
 * - a fresh fake API answering /api and /auth (fails the test if the app called something it doesn't know);
 * - the browser clock set to `now`, so "today", relative dates and the 30-day expiry warnings are fixed;
 * - Math.random seeded, so the login headline and tip are always the same.
 * Reduced motion and the locale / time zone come from playwright.config.ts.
 */
export const test = base.extend<Fixtures & Options>({
  now: [NOW, { option: true }],
  randomSeed: [1, { option: true }],

  fakeApi: [
    async ({ context, now, randomSeed }, use) => {
      const fakeApi = new FakeApi();
      await fakeApi.install(context);
      await context.clock.install({ time: now });
      startServerClock(now);
      await seedRandom(context, randomSeed);

      await use(fakeApi);

      if (fakeApi.unhandled.length > 0) {
        throw new Error(
          `The app called endpoints the fake API doesn't handle (add them in e2e/fake-api/areas):\n  ${fakeApi.unhandled.join('\n  ')}`
        );
      }
    },
    { auto: true },
  ],
});
