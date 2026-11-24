/**
 * The frozen "now" of every E2E test (e2e/support/test.ts installs it as the browser clock). A Tuesday morning in
 * Zagreb, far from today, so a test that forgot the clock fails instead of passing by luck. The fake data is written
 * relative to it with `day()` / `at()`.
 */
export const NOW = new Date('2026-06-16T09:00:00+02:00');

const DAY_MS = 24 * 60 * 60 * 1000;
// Noon UTC on NOW's date: adding whole days never crosses a date line in Zagreb (UTC+1/+2).
const NOON_UTC = Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate(), 12);

/** `YYYY-MM-DD`, `offset` days from NOW (0 = today, -1 = yesterday). The API's date-only format. */
export function day(offset = 0): string {
  return new Date(NOON_UTC + offset * DAY_MS).toISOString().slice(0, 10);
}

/** ISO timestamp at `hour:minute` Zagreb time (summer, UTC+2), `offset` days from NOW. */
export function at(offset: number, hour: number, minute = 0): string {
  return new Date(
    `${day(offset)}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+02:00`
  ).toISOString();
}

/** Croatian short date as the UI prints it: `16.6.` */
export function shortDate(offset = 0): string {
  const [, month, date] = day(offset).split('-').map(Number);
  return `${date}.${month}.`;
}

let clockStart = { browser: NOW.getTime(), real: Date.now() };

/** Called by the test fixture when it sets the browser clock, so the fake API's clock starts at the same moment. */
export function startServerClock(now: Date) {
  clockStart = { browser: now.getTime(), real: Date.now() };
}

/**
 * "Now" for the fake API (createdAt, completedAt, messageSentAt): the browser clock's start plus the real time since,
 * so a stop confirmed in a test reads "just now" in the app, not months away.
 */
export function serverNow(): string {
  return new Date(clockStart.browser + (Date.now() - clockStart.real)).toISOString();
}
