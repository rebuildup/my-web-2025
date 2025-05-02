/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  // Add trailing slash to all routes for better compatibility with Apache
  trailingSlash: true,
};

module.exports = nextConfig;
