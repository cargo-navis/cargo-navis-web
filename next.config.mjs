/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    PROJECT_ENV: process.env.PROJECT_ENV,
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
