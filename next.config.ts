import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const _isTurbopackDev = isDevelopment && process.env.TURBOPACK === "1";

const nextConfig: NextConfig = {
	experimental: {
		useTypeScriptCli: true,
		optimizePackageImports: [
			"lucide-react",
			"@mui/icons-material",
			"@mui/material",
			"framer-motion",
			"date-fns",
		],
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	serverExternalPackages: ["bun:sqlite"],
	turbopack: {},
	// Note: turbopack does not support moduleIds/chunkIds
	// Transpile @appletosolutions/reactbits to ensure @chakra-ui/react is resolved
	transpilePackages: ["@appletosolutions/reactbits"],
	// Environment variables
	env: {
		NEXT_BUILD_TIME: isProduction ? "true" : "false",
	},
	outputFileTracingIncludes: {
		"/api/cms/(.*)": ["./data/**"],
		"/api/admin/(.*)": ["./data/**"],
	},

	// Remove custom turbopack rules in dev/prod to avoid fallback to webpack

	// Image optimization - Fixed for production deployment
	images: {
		formats: ["image/webp", "image/avif"],
		deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		dangerouslyAllowSVG: false,
		// Ensure images render inline in <img> tags rather than forcing download
		contentDispositionType: "inline",
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		// Fix: Enable unoptimized only for standalone builds
		unoptimized: true,
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
		localPatterns: [
			{
				pathname: "/api/cms/media/**",
			},
			{
				pathname: "/images/**",
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

	// Webpack optimizations
	webpack: (config, { dev, isServer }) => {
		// Suppress baseline-browser-mapping warnings
		const originalWarn = console.warn;
		console.warn = (...args: unknown[]) => {
			const message = String(args[0] || "");
			if (message.includes("baseline-browser-mapping")) {
				return; // Suppress baseline-browser-mapping warnings
			}
			originalWarn(...args);
		};

		// Fix isomorphic-dompurify ESM issue
		config.externals = config.externals || [];
		if (Array.isArray(config.externals)) {
			config.externals.push({
				"isomorphic-dompurify": "commonjs isomorphic-dompurify",
			});
		}

		// Production optimizations
		if (!dev && !isServer) {
			// Configure module sideEffects to preserve GSAP and its plugins
			config.module = config.module || {};
			config.module.rules = config.module.rules || [];
			config.module.rules.push({
				test: /node_modules[\\/](gsap|@gsap)[\\/]/,
				sideEffects: true,
			});

			// Optimize lodash imports
			config.resolve.alias = {
				...config.resolve.alias,
				lodash: "lodash-es",
			};
		}

		// SVG handling
		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});

		// Asset files (audio, fonts, etc.) from subtree projects
		config.module.rules.push({
			test: /\.(wav|mp3|ogg|flac)$/,
			type: "asset/resource",
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
		} catch {
			// @chakra-ui/react not found, skip alias
		}

		return config;
	},

	output: "export",
	poweredByHeader: false,
	compress: true,
	trailingSlash: true,
};

export default nextConfig;
