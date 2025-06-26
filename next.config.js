/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Windows specific fixes for Next.js 15
    config.resolve.symlinks = false;
    config.cache = false;

    // Additional Windows compatibility settings
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };

    // Ensure proper file watching on Windows
    config.snapshot = {
      managedPaths: [],
    };

    return config;
  },
  // React 19 and Next.js 15 optimizations
  experimental: {
    webpackBuildWorker: false,
  },
  // Next.js 15 新しい設定形式
  serverExternalPackages: [],
  // Improve hydration stability
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
