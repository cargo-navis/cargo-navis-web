// Required env vars, checked when next dev/build/start loads this file (after .env files are read), so a missing
// value stops the app right away instead of breaking a feature later.
const REQUIRED_ENV_VARS = [
  // local | dev | production; scopes saved dashboard filters.
  'PROJECT_ENV',
  // The app's own URL; links in the dashboard's push notifications (infra/inject-env-sw.js).
  'NEXT_PUBLIC_APP_URL',
  // API base URL; still required while BACKEND_PROXY_TARGET makes the client ignore it.
  'NEXT_PUBLIC_BACKEND_URL',
  // Web push for the dashboard and the driver portal; must match the backend's vapid.public-key.
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
];

const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing env vars: ${missingEnvVars.join(', ')}. Set them in .env.local (see README).`);
}

// Keep in sync with PROJECT_ENV in src/env.d.ts.
const PROJECT_ENVS = ['local', 'dev', 'production'];
if (!PROJECT_ENVS.includes(process.env.PROJECT_ENV)) {
  throw new Error(`Invalid PROJECT_ENV "${process.env.PROJECT_ENV}". Use one of: ${PROJECT_ENVS.join(', ')}.`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PostHog (KAN-134) goes through our domain so ad blockers don't drop it: /cn-relay → PostHog EU. A name unique to
  // the app: block lists match common ones (/ingest, /analytics, /posthog …). Its API paths end in a slash, which
  // Next would otherwise redirect away.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/cn-relay/static/:path*', destination: 'https://eu-assets.i.posthog.com/static/:path*' },
      { source: '/cn-relay/:path*', destination: 'https://eu.i.posthog.com/:path*' },
    ];
  },
  env: {
    PROJECT_ENV: process.env.PROJECT_ENV,
    // Always defined at build time so production builds drop the driver portal dev mock.
    NEXT_PUBLIC_DRIVER_API_MOCK: process.env.NEXT_PUBLIC_DRIVER_API_MOCK ?? 'false',
    // Tells the client to call the backend same-origin when src/middleware.ts proxies it.
    NEXT_PUBLIC_BACKEND_PROXY: process.env.BACKEND_PROXY_TARGET ? 'true' : 'false',
  },
  // KAN-55 Postavke: one page with Moj račun · Tvrtka; the old settings / tenant URLs land on the right section.
  // Temporary (307) so browsers don't cache them for good.
  async redirects() {
    return [
      { source: '/dashboard/settings', destination: '/dashboard/settings/account', permanent: false },
      { source: '/dashboard/tenant', destination: '/dashboard/settings/company', permanent: false },
      { source: '/dashboard/tenant/edit', destination: '/dashboard/settings/company', permanent: false },
      // KAN-55 Flota: one page with type tabs (?vrsta=…) and one vehicle page for every type; Pregled flote and the
      // four type pages (list, new, detail, edit) land on it. „new” before „:id”, so it isn't read as an id.
      { source: '/dashboard/fleet/overview', destination: '/dashboard/fleet', permanent: false },
      ...[
        ['trucks', 'tegljaci'],
        ['trailers', 'poluprikolice'],
        ['solo-trucks', 'solo-kamioni'],
        ['vans', 'kombiji'],
      ].flatMap(([path, vrsta]) => [
        { source: `/dashboard/fleet/${path}`, destination: `/dashboard/fleet?vrsta=${vrsta}`, permanent: false },
        {
          source: `/dashboard/fleet/${path}/new`,
          destination: `/dashboard/fleet/new?vrsta=${vrsta}`,
          permanent: false,
        },
        { source: `/dashboard/fleet/${path}/:id`, destination: '/dashboard/fleet/:id', permanent: false },
        { source: `/dashboard/fleet/${path}/:id/edit`, destination: '/dashboard/fleet/:id/edit', permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
