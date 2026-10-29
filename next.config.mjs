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
  env: {
    PROJECT_ENV: process.env.PROJECT_ENV,
    // Always defined at build time so production builds drop the driver portal dev mock.
    NEXT_PUBLIC_DRIVER_API_MOCK: process.env.NEXT_PUBLIC_DRIVER_API_MOCK ?? 'false',
    // Tells the client to call the backend same-origin when src/middleware.ts proxies it.
    NEXT_PUBLIC_BACKEND_PROXY: process.env.BACKEND_PROXY_TARGET ? 'true' : 'false',
  },
  webpack(nextConfig) {
    nextConfig.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [],
            },
          },
        },
      ],
    });
    return nextConfig;
  },
};

export default nextConfig;
