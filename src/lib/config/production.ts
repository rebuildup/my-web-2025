/**
 * Production Environment Configuration
 * Centralized configuration for production environment settings
 */

export interface ProductionConfig {
	api: {
		baseUrl: string;
		timeout: number;
		retries: number;
	};
	security: {
		csp: {
			enabled: boolean;
			reportOnly: boolean;
			directives: Record<string, string[]>;
		};
		hsts: {
			enabled: boolean;
			maxAge: number;
			includeSubDomains: boolean;
			preload: boolean;
		};
		xss: {
			enabled: boolean;
			mode: string;
		};
	};
	cache: {
		static: number;
		content: number;
		api: number;
		webgl: number;
	};
	monitoring: {
		sentry: {
			enabled: boolean;
			dsn?: string;
			environment: string;
			tracesSampleRate: number;
		};
		analytics: {
			enabled: boolean;
			gaId?: string;
		};
		performance: {
			enabled: boolean;
			lighthouse: boolean;
			webVitals: boolean;
		};
	};
	webgl: {
		debug: boolean;
		maxTextureSize: number;
		performanceMonitoring: boolean;
		fallbackEnabled: boolean;
	};
	cdn: {
		enabled: boolean;
		baseUrl?: string;
		imagesUrl?: string;
	};
}

/**
 * Get production configuration based on environment variables
 */
export function getProductionConfig(): ProductionConfig {
	const isProduction = process.env.NODE_ENV === "production";

	return {
		api: {
			baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://yusuke-kim.com",
			timeout: 10000,
			retries: 3,
		},
		security: {
			csp: {
				enabled: isProduction,
				reportOnly: false,
				directives: {
					"default-src": ["'self'"],
					"script-src": [
						"'self'",
						"'unsafe-inline'",
						"'unsafe-eval'",
						"https://www.googletagmanager.com",
						"https://www.google-analytics.com",
						"https://ssl.google-analytics.com",
						"https://tagmanager.google.com",
						"https://use.typekit.net",
						"https://p.typekit.net",
					],
					"style-src": [
						"'self'",
						"'unsafe-inline'",
						"https://fonts.googleapis.com",
						"https://use.typekit.net",
						"https://p.typekit.net",
					],
					"img-src": [
						"'self'",
						"data:",
						"blob:",
						"https:",
						"https://www.google-analytics.com",
						"https://ssl.gstatic.com",
						"https://www.gstatic.com",
					],
					"font-src": [
						"'self'",
						"https://fonts.gstatic.com",
						"https://use.typekit.net",
						"https://p.typekit.net",
					],
					"connect-src": [
						"'self'",
						"https://www.google-analytics.com",
						"https://region1.google-analytics.com",
						"https://analytics.google.com",
						process.env.SENTRY_DSN
							? new URL(process.env.SENTRY_DSN).origin
							: "",
					].filter(Boolean),
					"media-src": ["'self'", "https:", "data:", "blob:"],
					"object-src": ["'none'"],
					"base-uri": ["'self'"],
					"form-action": ["'self'"],
					"frame-ancestors": ["'none'"],
					"upgrade-insecure-requests": [],
				},
			},
			hsts: {
				enabled: isProduction,
				maxAge: 31536000, // 1 year
				includeSubDomains: true,
				preload: true,
			},
			xss: {
				enabled: true,
				mode: "block",
			},
		},
		cache: {
			static: parseInt(process.env.CACHE_TTL_STATIC || "31536000", 10), // 1 year
			content: parseInt(process.env.CACHE_TTL_CONTENT || "3600", 10), // 1 hour
			api: parseInt(process.env.CACHE_TTL_API || "300", 10), // 5 minutes
			webgl: 86400, // 24 hours for WebGL shaders
		},
		monitoring: {
			sentry: {
				enabled: isProduction && !!process.env.SENTRY_DSN,
				dsn: process.env.SENTRY_DSN,
				environment: process.env.NODE_ENV || "development",
				tracesSampleRate: isProduction ? 0.1 : 1.0,
			},
			analytics: {
				enabled: isProduction && !!process.env.NEXT_PUBLIC_GA_ID,
				gaId: process.env.NEXT_PUBLIC_GA_ID,
			},
			performance: {
				enabled: isProduction,
				lighthouse: !!process.env.LIGHTHOUSE_CI_TOKEN,
				webVitals: true,
			},
		},
		webgl: {
			debug: process.env.NEXT_PUBLIC_WEBGL_DEBUG === "true",
			maxTextureSize: parseInt(
				process.env.NEXT_PUBLIC_WEBGL_MAX_TEXTURE_SIZE || "2048",
				10,
			),
			performanceMonitoring:
				process.env.NEXT_PUBLIC_WEBGL_PERFORMANCE_MONITORING === "true",
			fallbackEnabled: true,
		},
		cdn: {
			enabled: isProduction && !!process.env.NEXT_PUBLIC_CDN_URL,
			baseUrl: process.env.NEXT_PUBLIC_CDN_URL,
			imagesUrl: process.env.NEXT_PUBLIC_IMAGES_CDN,
		},
	};
}

/**
 * Validate production configuration
 */
export function validateProductionConfig(config: ProductionConfig): string[] {
	const errors: string[] = [];

	if (config.monitoring.sentry.enabled && !config.monitoring.sentry.dsn) {
		errors.push("Sentry DSN is required when Sentry monitoring is enabled");
	}

	if (
		config.monitoring.analytics.enabled &&
		!config.monitoring.analytics.gaId
	) {
		errors.push("Google Analytics ID is required when analytics is enabled");
	}

	if (config.cdn.enabled && !config.cdn.baseUrl) {
		errors.push("CDN base URL is required when CDN is enabled");
	}

	return errors;
}
