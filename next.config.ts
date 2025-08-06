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
      // Force HMR to work properly
      isrMemoryCacheSize: 0, // Disable ISR cache in development
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

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Enable optimization
    loader: "default",
    domains: [], // Add external domains if needed
    remotePatterns: [
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
      // Static assets caching
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            three: {
              test: /[\\/]node_modules[\\/](three|@types\/three)[\\/]/,
              name: "three",
              chunks: "all",
              priority: 20,
            },
            pixi: {
              test: /[\\/]node_modules[\\/](pixi\.js|pixi-filters)[\\/]/,
              name: "pixi",
              chunks: "all",
              priority: 20,
            },
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
              name: "ui",
              chunks: "all",
              priority: 15,
            },
          },
        },
      };
    }

    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Output configuration
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  trailingSlash: false,
};

export default nextConfig;
