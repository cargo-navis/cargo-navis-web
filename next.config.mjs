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
