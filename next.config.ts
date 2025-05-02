/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Removed swcMinify option as it's not recognized
  // Add trailing slash to all routes for better compatibility with Apache
  trailingSlash: true,
};

module.exports = nextConfig;
