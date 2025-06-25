/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Disable symlink resolution on Windows
    config.resolve.symlinks = false;
    // Disable caching completely
    config.cache = false;
    return config;
  },
  // Disable SWC minifier in favor of Terser
  swcMinify: false,
};

module.exports = nextConfig;
