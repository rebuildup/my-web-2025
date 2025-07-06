import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: config => {
    // Fix for Windows filesystem issues
    config.resolve.symlinks = false;
    config.cache = false;

    // Additional Windows fixes
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      // Disable file system cache
      config.snapshot = {
        managedPaths: [],
        immutablePaths: [],
      };
    }

    return config;
  },
  // Fix for Fast Refresh NaN timing issue on Windows
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
