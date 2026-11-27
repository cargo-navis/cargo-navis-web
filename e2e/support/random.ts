import type { BrowserContext } from '@playwright/test';

/**
 * Replaces Math.random in every page of the context with a seeded generator (mulberry32), so the login headline and
 * tip, and anything else random, come out the same on every run. Seed 1 is the default; a test can pick another to
 * get a different headline.
 */
export async function seedRandom(context: BrowserContext, seed: number) {
  await context.addInitScript((initialSeed: number) => {
    let state = initialSeed >>> 0;
    Math.random = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, seed);
}
