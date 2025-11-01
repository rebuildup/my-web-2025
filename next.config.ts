import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const isTurbopackDev = isDevelopment && process.env.TURBOPACK === "1";

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	// Turbopack configuration for module resolution
	// Note: Next.js 16 Turbopack may not support resolveAlias in this format
	// Using shamefully-hoist in .npmrc instead for pnpm compatibility
	turbopack: {},
	// Transpile @appletosolutions/reactbits to ensure @chakra-ui/react is resolved
	transpilePackages: ["@appletosolutions/reactbits"],
	// Environment variables
	env: {
		NEXT_BUILD_TIME: isProduction ? "true" : "false",
	},

	// Performance optimizations
	experimental: {
		...(isProduction
			? {
					optimizePackageImports: [
						"lucide-react",
						"framer-motion",
						"three",
						"pixi.js",
						"fuse.js",
						"marked",
						"recharts",
					],
				}
			: {}),
		// Development mode optimizations
		...(isDevelopment && {
			linkNoTouchStart: true,
			// Disable static optimization for better HMR when not running Turbopack
			...(isTurbopackDev
				? {}
				: {
						forceSwcTransforms: true,
					}),
		}),
	},

	// Remove custom turbopack rules in dev/prod to avoid fallback to webpack

	// Image optimization - Fixed for production deployment
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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

	// Note: ESLint configuration via next.config was removed in Next.js 16

	// Bundle analyzer (development only)
	...(process.env.ANALYZE === "true" && {
		webpack: (config: { plugins?: unknown[] }) => {
			// Use require without eval to satisfy security lint rule
			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const bundleAnalyzer = require("@next/bundle-analyzer");
			const BundleAnalyzerPlugin = bundleAnalyzer({ enabled: true });
			config.plugins?.push(new BundleAnalyzerPlugin());
			return config;
		},
	}),

	// Headers for security
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
			{
				source: "/images/(.*)",
				headers: [
					{
						key: "Access-Control-Allow-Origin",
						value: "*",
					},
				],
			},
		];
	},

	// Content Security Policy
	async rewrites() {
		return [
			{
				source: "/favicon.ico",
				destination: "/favicons/favicon.ico",
			},
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

		// Ensure @chakra-ui/react is resolved correctly for @appletosolutions/reactbits
		try {
			const chakraPath = require.resolve("@chakra-ui/react");
			config.resolve.alias = {
				...config.resolve.alias,
				"@chakra-ui/react": chakraPath,
			};
		} catch (error) {
			// @chakra-ui/react not found, skip alias
		}

		return config;
	},

	// Output configuration - Disabled for development and Windows (symlink issues)
	output:
		(process.env.NODE_ENV === "production" ||
			process.env.NEXT_BUILD_STANDALONE === "true") &&
		process.platform !== "win32"
			? "standalone"
			: undefined,
	poweredByHeader: false,
	compress: true,
	trailingSlash: false,
};

export default nextConfig;
