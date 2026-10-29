This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Environment variables

Set in `.env.local` (git-ignored). Next.js reads them at startup, so restart `npm run dev` after a change. Variables marked **Required** are checked in `next.config.mjs`: `next dev`/`build`/`start` refuse to start without them.

| Variable | Example | Purpose |
|---|---|---|
| `PROJECT_ENV` | `local` | **Required.** One of `local`, `dev`, `production`. Scopes saved dashboard filters (`production` vs the rest). |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | **Required.** The app's own URL, used for links in the dashboard's push notifications. |
| `NEXT_PUBLIC_BACKEND_URL` | `https://api-dev.cargo-navis.com` | **Required.** API base URL. Ignored while `BACKEND_PROXY_TARGET` is set (calls then go to this app). |
| `BACKEND_PROXY_TARGET` | `https://api-dev.cargo-navis.com` | Local dev and Vercel previews only; never on dev/prod deploys. All backend calls (`/auth/*`, `/api/*`) then go to this app and `src/middleware.ts` forwards them here. See [Local backend proxy](#local-backend-proxy). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `BNc…` (base64url) | **Required.** Web push public key; must match the backend's `vapid.public-key`. Used by push notifications in the dashboard and the driver portal. |
| `NEXT_PUBLIC_DRIVER_API_MOCK` | `true` | Driver portal only: serve driver API calls from an in-browser mock (`npm run dev:driverMock` sets it). Never set in deployed builds. |

## Local backend proxy

Only active when `BACKEND_PROXY_TARGET` is set (local dev, Vercel previews). Then the client calls `/auth/*` and `/api/*` on the app's own origin (`localhost`, an ngrok tunnel or a preview URL) and the middleware forwards them. Without it everything below is a no-op and the browser talks to `NEXT_PUBLIC_BACKEND_URL` directly.

**Why:** the refresh token is an httpOnly cookie set by the API. Browsers only store and send it when the page and the API are on the same site, which is true for `dev.cargo-navis.com`/`app.cargo-navis.com` but not for `localhost`, `*.vercel.app` or an ngrok tunnel. Proxying through Next.js makes those calls same-origin, which also removes CORS from local development. The `Origin` header is dropped on the way, because the API's CORS check rejects unknown origins with `403 Invalid CORS request`.

**It covers two local use cases:**

1. **Refresh cookie in a desktop browser** (`localhost`, Vercel previews): these origins are not on the API's site, so without the proxy the refresh cookie is never stored. With `BACKEND_PROXY_TARGET=https://api-dev.cargo-navis.com`, `/auth/*` is same-origin and the cookie works (see [option 2](#option-2-real-backend-in-a-desktop-browser)).
2. **The driver portal as a PWA on a phone:** a phone needs HTTPS and cannot reach your laptop's `localhost`, so the app is opened through an ngrok tunnel. That tunnel is yet another origin the API does not know, so the proxy also routes `/api/*` (no CORS) and drops `Origin` (no 403). With `BACKEND_PROXY_TARGET=http://localhost:80` (local backend) or api-dev, the whole flow works through one tunnel: link → refresh cookie → install → reopen (see [option 3](#option-3-on-a-real-phone-install-as-an-app)).

Both are for local testing only. On the dev and prod deploys (`dev.cargo-navis.com`, `app.cargo-navis.com`) there is no proxy: the cookie works directly because they share a site with the API, and the PWA runs on real HTTPS.

```
browser ──/auth/*──▶ Next.js (src/middleware.ts) ──▶ BACKEND_PROXY_TARGET/auth/*
browser ──/api/*───▶ Next.js (src/middleware.ts) ──▶ BACKEND_PROXY_TARGET/api/*
```

**What happens when `BACKEND_PROXY_TARGET` is set:**

1. **Startup:** `next.config.mjs` sees the variable and exposes `NEXT_PUBLIC_BACKEND_PROXY='true'` to the client. Restart `npm run dev` after changing it.
2. **Browser:** `getBackendBaseUrl()` returns `''`, so every client calls relative paths on the app's own origin, whether that is `localhost:3000`, an ngrok tunnel or a preview URL. `NEXT_PUBLIC_BACKEND_URL` is ignored.
   - Dashboard (`backendService`): `/api/*` and `/auth/refresh`.
   - Driver portal (`driverBackendService`): `/api/*`, `/auth/exchange` and `/auth/refresh`.
   - Login, accept-invite and logout (`src/lib/api/auth.ts`).
3. **Server:** `src/middleware.ts` catches `/auth/*` and `/api/*` and forwards them to `BACKEND_PROXY_TARGET` (for example `http://localhost:80` or `https://api-dev.cargo-navis.com`) with every request header except `Origin`, so cookies and `Authorization` still reach the backend.
4. **Response:** the backend's response, `Set-Cookie` included, comes back through the same path, so to the browser it is a same-origin response.
5. **Result:**
   - The browser stores the refresh cookie for the app's own origin and sends it back on `/auth/refresh`.
   - There is no cross-origin call, so no CORS.
   - The backend does not need to know `localhost`, ngrok or preview URLs: without an `Origin` header it skips its CORS check.

**When it is not set**, `src/middleware.ts` ignores `/auth/*` and `/api/*` and the browser calls `NEXT_PUBLIC_BACKEND_URL` directly. That is how the dev and prod deploys work: `dev.cargo-navis.com` and `app.cargo-navis.com` share a site with the API, so the cookie works without a proxy.

| File | Role |
|---|---|
| `src/middleware.ts` | Matches `/auth/:path*` and `/api/:path*`, rewrites them to `BACKEND_PROXY_TARGET` with all request headers except `origin` (cookies and `Authorization` pass through). |
| `next.config.mjs` | Sets `NEXT_PUBLIC_BACKEND_PROXY` to `'true'` when `BACKEND_PROXY_TARGET` is set, so the client knows the backend is proxied. |
| `src/lib/utils/backendBaseUrl.ts` | `getBackendBaseUrl()`: `''` (same origin) when proxied, otherwise `NEXT_PUBLIC_BACKEND_URL`. Used by every client below. |
| `src/lib/api/auth.ts` | Login, accept-invite and logout (`/auth/*`). |
| `src/lib/services/backendService.ts` | Dashboard client: all `/api/*` calls and refresh (`/auth/refresh`). |
| `src/lib/services/driverBackendService.ts` | Driver client: `/api/*` calls, link exchange and refresh. |
| `src/middleware.test.ts`, `src/lib/utils/backendBaseUrl.test.ts` | Tests for the above. |

## Tests

```bash
npm test          # Vitest (pure logic, services, middleware)
npm run lint
npm run typecheck
```

## Driver portal

Mobile web app for truck drivers at `/driver`, installable as a PWA named "Cargo Navis". Drivers see their vehicle stops (Postaje) and orders (Nalozi), confirm loading/unloading and upload documents.

- **Entry:** the driver's superior sends a link to `/driver/{token}?vehicleStopId={id}`. A link stays usable for 15 minutes after its first use. The page exchanges the link token (`POST /auth/exchange`) for a short-lived JWT, kept in memory only, and the backend sets an httpOnly `refreshToken` cookie (30 days).
- **Without a link:** `/driver` (the installed app's start page) restores the session with `POST /auth/refresh`. With no valid cookie it asks the driver to get a new link from their superior.
- **PWA:** `public/driver.webmanifest` and `public/driver-sw.js` are scoped to `/driver`. The service worker serves an offline page (`public/driver-offline.html`; bump `OFFLINE_PAGE_CACHE_VERSION` when it changes) and handles push notifications.
- **Install gate:** in a phone browser, once signed in, a full-screen screen asks the driver to install the app (Android: install button; iOS Safari: Share → Add to Home Screen; other browsers: open in Safari/Chrome). The session is created first on purpose: iOS copies Safari's cookies into the app only when it is added. "Nastavi u pregledniku" switches to a card above the stops for that tab (`sessionStorage`). No gate on desktop or inside the installed app.
- **iOS caveat:** the installed iOS app never receives links (they open in Safari) and has its own cookie jar from install time. If its session expires (30 days unused), the driver needs a new link in Safari and has to delete and re-add the app; the app's signed-out screen says so.
- **Code:** `src/pages-components/DriverPage/`, API client `src/lib/services/driverBackendService.ts`, dev mock `src/lib/services/driverMock/`.

### Testing the driver portal locally

#### Option 1: UI only in a desktop browser, no backend (fastest)

```bash
npm run dev:driverMock
```

Open `http://localhost:3000/driver/any-token` (stops come from the mock) or `/driver/expired` (expired link) in a browser **on your laptop only**. The mock fakes the refresh cookie in `sessionStorage`, so it cannot test sign-in, a phone or an installed app; use option 3 for those.

#### Option 2: Real backend in a desktop browser

Requirements: a driver link token from the backend you point at.

```bash
# .env.local
BACKEND_PROXY_TARGET=https://api-dev.cargo-navis.com
```

```bash
npm run dev   # not dev:driverMock, so requests reach the real backend
```

Open `http://localhost:3000/driver/{token}` in **Chrome** (it accepts `Secure` cookies on `http://localhost`). DevTools → Application → Cookies shows the `refreshToken` cookie; `/driver` should then sign in without the link.

#### Option 3: On a real phone (install as an app)

A phone needs HTTPS and cannot reach your Mac's `localhost`, so everything goes through one ngrok tunnel and the proxy.

Requirements:
- [ngrok](https://ngrok.com/) account, ideally with a free static domain (`https://<name>.ngrok-free.app`), so the installed app keeps working across restarts.
- A backend that issues driver link tokens. Locally: clone `cargo-navis-api` and run it with Docker (`docker/compose-local.yaml`, listens on host port **80**); you need data for a driver with vehicle stops.
- iPhone: Settings → Apps → Safari → Advanced → **Web Inspector** on. Mac Safari: Settings → Advanced → **Show features for web developers**.

```bash
# .env.local (switch back to the option 2 value afterwards)
BACKEND_PROXY_TARGET=http://localhost:80
```

```bash
npm run dev
ngrok http 3000 --url=<name>.ngrok-free.app
```

1. In **Safari** on the phone, open `https://<name>.ngrok-free.app/driver/{token}` and tap **Visit Site** on ngrok's warning page. The stops should load.
2. Share → **Add to Home Screen** (with "Open as Web App" on) → open the app. It starts at `/driver` and signs in with the cookie copied from Safari. iOS copies cookies only at install, so delete and re-add the app after signing in again in Safari.
3. Debug: Mac Safari → Develop → your phone → the page or app. ngrok's inspector at `http://127.0.0.1:4040` shows every proxied `/auth` and `/api` request with headers.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
