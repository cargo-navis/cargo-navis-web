/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PROJECT_ENV: process.env.PROJECT_ENV,
    // Always defined at build time so production builds drop the driver portal dev mock.
    NEXT_PUBLIC_DRIVER_API_MOCK: process.env.NEXT_PUBLIC_DRIVER_API_MOCK ?? 'false',
    // Tells the client to call /auth/* same-origin when it is proxied (see rewrites).
    NEXT_PUBLIC_AUTH_PROXY: process.env.AUTH_PROXY_TARGET ? 'true' : 'false',
  },
  async rewrites() {
    const authProxyTarget = process.env.AUTH_PROXY_TARGET;
    // Local dev and Vercel previews are cross-site with the API, so the browser would not send the httpOnly
    // refresh cookie. Proxying /auth/* makes it same-origin there (see NEXT_PUBLIC_AUTH_PROXY above).
    return authProxyTarget ? [{ source: '/auth/:path*', destination: `${authProxyTarget}/auth/:path*` }] : [];
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
