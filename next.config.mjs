/** @type {import('next').NextConfig} */
const nextConfig = {
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
