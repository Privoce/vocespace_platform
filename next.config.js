const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  productionBrowserSourceMaps: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
        'node-fetch': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
