# E2E tests (Playwright)

Browser tests of the real app: a production build (`next build` + `next start`) on its own port, with every backend call answered by a fake API. Two projects run every test: **desktop** (Chromium, 1440×900) and **phone** (Chromium with the iPhone 15 viewport, touch and user agent).

## Run

```bash
npm run test:e2e            # build (into .next-e2e) + all tests, both projects
npm run e2e:build           # only the build; needed again after app code changes
npm run e2e:run             # only the tests, against the last build
npm run e2e:run -- --project=desktop e2e/flows/login.spec.ts   # one project, one file
npm run e2e:run -- --ui     # Playwright UI: watch, time-travel, pick locators
npm run e2e:run -- --repeat-each=10 --workers=4                # flake check
```

First time on a machine: `npx playwright install chromium`.

- The build goes to `.next-e2e`, not `.next`, so a `next dev` in the same checkout keeps running. Never start a second `next dev` for the tests.
- The server runs on port **3210** (`E2E_PORT` to change it). Playwright starts and stops it.
- The build's environment is in `e2e/env.mjs`. Its values beat `.env.local`, so your local settings don't change the tested app. PostHog is off (no key). Feature flags have their `develop` defaults.
- In a sandboxed shell that blocks Chromium's helper processes (e.g. Claude Code on macOS: `MachPortRendezvousServer … Permission denied`), set `E2E_SINGLE_PROCESS=1`.
- Failures keep a trace (`e2e/.results`): `npx playwright show-trace <path>/trace.zip`.

## How it works

| File                    | Role                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `playwright.config.ts`  | Projects, the server, `reducedMotion: 'reduce'`, `hr-HR` locale, `Europe/Zagreb` time zone, blocked service workers. |
| `e2e/support/test.ts`   | The `test` every spec imports. Per test: a fresh fake API, the clock at `NOW`, `Math.random` seeded.                 |
| `e2e/support/time.ts`   | `NOW` (Tue 16 Jun 2026, 09:00 Zagreb) and `day(offset)` / `at(offset, hour)` for dates relative to it.               |
| `e2e/support/random.ts` | The seeded `Math.random` (the login headline and tip pick from it).                                                  |
| `e2e/auth.setup.ts`     | Logs in once through the form and saves the session to `e2e/.auth/` for all other tests.                             |
| `e2e/fake-api/`         | The fake backend (below).                                                                                            |
| `e2e/flows/`            | Phase 1: the five key flows.                                                                                         |

**Session.** The access token lives only in memory (`accessTokenStore`); the session is the httpOnly `refreshToken` cookie. The setup test logs in, the fake `/auth/token` sets the cookie, and `storageState` saves it. Each test then starts like a reloaded tab: the app calls `/auth/refresh` with the cookie and gets a token. A test that needs to be signed out uses `test.use({ storageState: { cookies: [], origins: [] } })`.

**Determinism.**

- Clock: `context.clock.install({ time: NOW })`. Time then runs normally from NOW, so timers and debounces work. A test can start elsewhere with `test.use({ now: new Date('…') })`.
- Randomness: `Math.random` is seeded (`test.use({ randomSeed: 2 })` for another headline).
- Animations: reduced motion. Wait for the URL or an element, never a fixed time (the login has a leave animation on wide screens).
- Analytics: off.

## The fake API

**Why `page.route` and not MSW.** Every backend call is made by the browser (no `getServerSideProps`), so Playwright can answer them all at the network layer:

- Nothing to add to the app: no MSW worker in `public/`, no test-only code in the bundle. MSW's service worker would also clash with the app's push service workers.
- The data lives in the test process, one copy per test. A test changes it or reads it directly (`fakeApi.db`), and checks what the app sent (`fakeApi.calls(...)`). No server to reset between tests, so tests run in parallel.
- Per-test overrides are one line, with no extra request to a mock server.
- MSW's main win, reusing the same handlers in component tests (phase 4), is small here: those tests can mock the hooks or reuse the data files.

The build sets `BACKEND_PROXY_TARGET` to a closed port. The client then calls `/api` and `/auth` on the app's own origin (as in local development with the proxy), so the refresh cookie is same-origin like on the real deploys. Playwright answers before the request reaches the server, and anything it let through would fail loudly instead of reaching a real backend.

**Layout.** One file per area in `e2e/fake-api/areas/`, each with its seed data and its endpoints:

| Area             | Data                                               | Endpoints                                    |
| ---------------- | -------------------------------------------------- | -------------------------------------------- |
| `korisnik.ts`    | The signed-in dispatcher and the login credentials | `/auth/*`, `/api/account`                    |
| `tvrtka.ts`      | The company (tenant)                               | `/api/tenant`                                |
| `partneri.ts`    | Klijenti and podvozari                             | `/api/clients`, `/api/transport-contractors` |
| `zaposlenici.ts` | The dispatcher and two drivers                     | `/api/employees`                             |
| `vozila.ts`      | Two trucks and a trailer                           | `/api/fleet`                                 |
| `nalozi.ts`      | Three nalozi with their tereti                     | `/api/shipments`, `/api/shipment-drafts`     |
| `prijevozi.ts`   | Vehicle stops (routes)                             | `/api/vehicle-stops`, notify, complete       |
| `ostalo.ts`      | Poštanski brojevi, alerts, notifications, push     | `/api/postalCodes`, `/api/alerts`, …         |

`db.ts` puts the seeds together; `routes.ts` lists the endpoints (the first match wins). Ids are fixed UUIDs, exported by name (`NALOG.podravka`, `VOZILO.tegljac1`, `STANICA.podravkaUtovar`), and the data types come from `src/lib/api`, so `npm run typecheck` catches a change in the app's types. Dates are relative to `NOW`.

Handlers change `db` like the backend would. A created nalog appears in the list, and a completed stop makes its cargo `loaded`. Stops keep only cargo ids; the cargo objects are built from the nalozi on every read, so the two never disagree.

**Overrides in a test:**

```ts
test('server error', async ({ page, fakeApi }) => {
  fakeApi.fail('GET', '/api/shipments');                  // 500 (status as 3rd argument)
  fakeApi.empty('GET', '/api/fleet');                     // [] or an empty page
  fakeApi.delay('GET', '/api/shipments', 2_000);          // slow → loading state
  fakeApi.on('POST', '/api/shipments', fail(422, 'Neispravno'), { times: 1 }); // any reply, once
  fakeApi.db.nalozi.length = 0;                           // or change the data before the page loads
  …
  expect(fakeApi.calls('POST', '/api/shipments')[0].body).toMatchObject({ price: 850 });
});
```

**Unknown requests fail the test.** A request with no handler gets a 501, and the test fails when it ends with the list of unknown endpoints. Add a handler in the right area; don't silence it.

## Add a flow

1. Create `e2e/flows/<name>.spec.ts` (later phases: `e2e/<area>/…`). Import `test` and `expect` from `../support/test`, never from `@playwright/test`.
2. Use the seeded data by its exported ids, or set up what you need through `fakeApi.db` before `page.goto`.
3. Find elements by role and label in Croatian: `getByRole('button', { name: 'Spremi' })`, `getByLabel('Cijena')`. Add a `data-testid` only when an element has no accessible name.
4. Check both what the user sees (toast, URL, text) and what reached the backend (`fakeApi.calls`, `fakeApi.db`).
5. Run it on both projects, then 10 times in a row: `npm run e2e:run -- e2e/flows/<name>.spec.ts --repeat-each=10`.

## Update fake data

- Add or change seed data in the area's file. Keep it realistic (Croatian names and places) and say in a comment what each item is for, so other tests know what they can rely on.
- Adding data can change other tests (list counts, the next order number), so run the whole suite.
- For data that only one test needs, change `fakeApi.db` in that test instead of the seed.
- A new endpoint: add a `route(method, path, handler)` to its area's `…Routes`, and keep the response shape the same as the backend's. Lists use `ok([...])`, paginated ones `paginated(items, query)`, errors `fail(status, message, errorCode)`.
