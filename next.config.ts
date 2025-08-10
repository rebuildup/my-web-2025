import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables
  env: {
    NEXT_BUILD_TIME: process.env.NODE_ENV === "production" ? "true" : "false",
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "three",
      "pixi.js",
      "fuse.js",
      "marked",
      "recharts",
    ],
    // Development mode optimizations
    ...(process.env.NODE_ENV === "development" && {
      linkNoTouchStart: true,
      // Disable static optimization for better HMR
      forceSwcTransforms: true,
    }),
  },

  // Turbopack configuration (moved from experimental)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Image optimization - Fixed for production deployment
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    // Ensure images render inline in <img> tags rather than forcing download
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Fix: Enable unoptimized only for standalone builds
    unoptimized: process.env.NEXT_BUILD_STANDALONE === "true",
    loader: process.env.NEXT_BUILD_STANDALONE === "true" ? "custom" : "default",
    loaderFile:
      process.env.NEXT_BUILD_STANDALONE === "true"
        ? "./src/lib/utils/image-loader.ts"
        : undefined,
    domains: ["img.youtube.com", "i.ytimg.com"], // Add YouTube domains for thumbnails
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  // Bundle analyzer (development only)
  ...(process.env.ANALYZE === "true" && {
    webpack: (config: { plugins?: unknown[] }) => {
      // Dynamic import for bundle analyzer to avoid require()
      const BundleAnalyzerPlugin = eval('require("@next/bundle-analyzer")')({
        enabled: true,
      });
      config.plugins?.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),

  // Headers for caching and security
  async headers() {
    // Basic security headers without dynamic import
    const productionHeaders = {
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-XSS-Protection": "1; mode=block",
    };

    const baseHeaders = Object.entries(productionHeaders)
      .filter(([, value]) => value !== "")
      .map(([key, value]) => ({ key, value }));

    return [
      {
        source: "/(.*)",
        headers: baseHeaders,
      },
      // Static assets caching - Fixed for production
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              process.env.NODE_ENV === "production"
                ? "public, max-age=86400, stale-while-revalidate=31536000"
                : "public, max-age=0, no-cache",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      {
        source: "/videos/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },

      {
        source: "/downloads/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 1 day
          },
        ],
      },
      // API routes caching
      {
        source: "/api/content/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${process.env.CACHE_TTL_CONTENT || "3600"}, stale-while-revalidate=86400`,
          },
        ],
      },
      {
        source: "/api/stats/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${process.env.CACHE_TTL_API || "300"}, stale-while-revalidate=3600`,
          },
        ],
      },
      // WebGL shader caching
      {
        source: "/api/playground/webgl/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800", // 24 hours
          },
        ],
      },
      // Monitoring endpoints (no cache)
      {
        source: "/api/monitoring/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      // CSS files - comprehensive patterns
      {
        source: "/_next/static/css/(.*)",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/chunks/(.*).css",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // All CSS files pattern
      {
        source: "/(.*).css",
        headers: [
          {
            key: "Content-Type",
            value: "text/css; charset=utf-8",
          },
        ],
      },
      // JS files
      {
        source: "/_next/static/chunks/(.*).js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Content Security Policy
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/_next/static/sw.js",
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 200000, // Reduced from 244000 for better loading
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
              maxSize: 200000,
            },
            three: {
              test: /[\\/]node_modules[\\/](three|@types\/three)[\\/]/,
              name: "three",
              chunks: "all",
              priority: 20,
              maxSize: 150000, // Smaller chunks for 3D libraries
            },
            pixi: {
              test: /[\\/]node_modules[\\/](pixi\.js|pixi-filters)[\\/]/,
              name: "pixi",
              chunks: "all",
              priority: 20,
              maxSize: 150000,
            },
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
              name: "ui",
              chunks: "all",
              priority: 15,
              maxSize: 100000,
            },
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react",
              chunks: "all",
              priority: 25,
              maxSize: 150000,
            },
            utils: {
              test: /[\\/]node_modules[\\/](fuse\.js|marked|dompurify)[\\/]/,
              name: "utils",
              chunks: "all",
              priority: 15,
              maxSize: 100000,
            },
            // New cache groups for better optimization
            tools: {
              test: /[\\/]src[\\/]app[\\/]tools[\\/]/,
              name: "tools",
              chunks: "all",
              priority: 30,
              maxSize: 100000,
            },
            admin: {
              test: /[\\/]src[\\/]app[\\/]admin[\\/]/,
              name: "admin",
              chunks: "all",
              priority: 30,
              maxSize: 100000,
            },
          },
        },
        usedExports: true,
        sideEffects: false,
        // Additional optimizations
        moduleIds: "deterministic",
        chunkIds: "deterministic",
      };

      // Tree shaking optimizations
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize lodash imports
        lodash: "lodash-es",
      };

      // Remove unused code
      config.optimization.providedExports = true;
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Additional webpack optimizations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  // Output configuration - Disabled for development
  // output: "standalone", // Enable only for production deployment
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  trailingSlash: false,
};

export default nextConfig;
