/**
 * Production Environment Initialization
 * Sets up monitoring, security, and optimization for production
 */

import {
	getProductionConfig,
	validateProductionConfig,
} from "@/lib/config/production";
import {
	initWebVitals,
	monitorMemoryUsage,
	monitorPageLoad,
} from "@/lib/monitoring/performance";
import { initSentry } from "@/lib/monitoring/sentry";

/**
 * Initialize production environment
 */
export function initProduction(): void {
	const config = getProductionConfig();

	// Validate configuration
	const validationErrors = validateProductionConfig(config);
	if (validationErrors.length > 0) {
		console.warn("Production configuration issues:", validationErrors);
	}

	// Initialize monitoring
	if (config.monitoring.sentry.enabled) {
		initSentry();
	}

	if (config.monitoring.performance.enabled) {
		initWebVitals();
		monitorPageLoad();
		monitorMemoryUsage();
	}

	// Initialize analytics
	// Note: Google Analytics is now initialized by AnalyticsProvider
	// Only initialize here if gtag is not already available
	if (
		config.monitoring.analytics.enabled &&
		config.monitoring.analytics.gaId &&
		typeof window !== "undefined" &&
		!window.gtag
	) {
		initGoogleAnalytics(config.monitoring.analytics.gaId);
	}

	// Set up error handling
	setupGlobalErrorHandling();

	// Set up performance monitoring
	setupPerformanceObserver();

	// Log initialization
	console.log("Production environment initialized", {
		monitoring: {
			sentry: config.monitoring.sentry.enabled,
			analytics: config.monitoring.analytics.enabled,
			performance: config.monitoring.performance.enabled,
		},
		security: {
			csp: config.security.csp.enabled,
			hsts: config.security.hsts.enabled,
		},
		webgl: {
			debug: config.webgl.debug,
			performanceMonitoring: config.webgl.performanceMonitoring,
		},
	});
}

/**
 * Initialize Google Analytics
 */
function initGoogleAnalytics(gaId: string): void {
	if (typeof window === "undefined") return;

	// Load gtag script
	const script = document.createElement("script");
	script.async = true;
	script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
	document.head.appendChild(script);

	// Initialize gtag
	window.dataLayer = window.dataLayer || [];
	function gtag(...args: unknown[]) {
		window.dataLayer?.push(args);
	}

	gtag("js", new Date());
	gtag("config", gaId, {
		page_title: document.title,
		page_location: window.location.href,
	});

	// Make gtag available globally
	(window as unknown as { gtag: typeof gtag }).gtag = gtag;
}

/**
 * Set up global error handling
 */
function setupGlobalErrorHandling(): void {
	if (typeof window === "undefined") return;

	// Handle unhandled promise rejections
	window.addEventListener("unhandledrejection", (event) => {
		console.error("Unhandled promise rejection:", event.reason);

		// Send to monitoring
		fetch("/api/monitoring/errors", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: `Unhandled Promise Rejection: ${event.reason}`,
				stack: event.reason?.stack,
				url: window.location.href,
				timestamp: Date.now(),
				component: "GlobalErrorHandler",
			}),
		}).catch(console.error);
	});

	// Handle JavaScript errors
	window.addEventListener("error", (event) => {
		console.error("JavaScript error:", event.error);

		// Send to monitoring
		fetch("/api/monitoring/errors", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				message: event.message,
				stack: event.error?.stack,
				url: window.location.href,
				lineNumber: event.lineno,
				columnNumber: event.colno,
				timestamp: Date.now(),
				component: "GlobalErrorHandler",
			}),
		}).catch(console.error);
	});

	// Handle resource loading errors
	window.addEventListener(
		"error",
		(event) => {
			if (event.target && event.target !== window) {
				const target = event.target as HTMLElement;
				const tagName = target.tagName;
				const resourceUrl =
					target.getAttribute("src") ||
					target.getAttribute("href") ||
					"unknown";

				// Skip logging for known development issues
				if (
					process.env.NODE_ENV === "development" &&
					(resourceUrl.includes("favicon") || resourceUrl === "unknown")
				) {
					return;
				}

				console.error("Resource loading error:", tagName, resourceUrl);

				// Send to monitoring
				fetch("/api/monitoring/errors", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						message: `Resource loading error: ${tagName} - ${resourceUrl}`,
						url: window.location.href,
						timestamp: Date.now(),
						component: "ResourceLoader",
						props: {
							tagName: tagName,
							src: target.getAttribute("src"),
							href: target.getAttribute("href"),
							resourceUrl: resourceUrl,
						},
					}),
				}).catch(console.error);
			}
		},
		true,
	);
}

/**
 * Set up performance observer
 */
function setupPerformanceObserver(): void {
	if (typeof window === "undefined" || !window.PerformanceObserver) {
		return;
	}

	try {
		// Observe long tasks
		const longTaskObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.duration > 50) {
					// Tasks longer than 50ms
					console.warn("Long task detected:", `${entry.duration}ms`);

					// Send to monitoring
					fetch("/api/monitoring/performance", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: "long-task",
							value: entry.duration,
							timestamp: Date.now(),
							url: window.location.href,
						}),
					}).catch(console.error);
				}
			}
		});

		longTaskObserver.observe({ entryTypes: ["longtask"] });

		// Observe layout shifts
		const layoutShiftObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				const layoutShiftEntry = entry as PerformanceEntry & { value: number };
				if (layoutShiftEntry.value > 0.1) {
					// Significant layout shift
					console.warn("Layout shift detected:", layoutShiftEntry.value);

					// Send to monitoring
					fetch("/api/monitoring/performance", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							name: "layout-shift",
							value: layoutShiftEntry.value,
							timestamp: Date.now(),
							url: window.location.href,
						}),
					}).catch(console.error);
				}
			}
		});

		layoutShiftObserver.observe({ entryTypes: ["layout-shift"] });
	} catch (error) {
		console.error("Failed to set up performance observer:", error);
	}
}

/**
 * Check production readiness
 */
export function checkProductionReadiness(): {
	ready: boolean;
	issues: string[];
	warnings: string[];
} {
	const issues: string[] = [];
	const warnings: string[] = [];
	const config = getProductionConfig();

	// Check required environment variables
	if (!process.env.NEXT_PUBLIC_SITE_URL) {
		issues.push("NEXT_PUBLIC_SITE_URL is not set");
	}

	if (
		config.monitoring.analytics.enabled &&
		!config.monitoring.analytics.gaId
	) {
		issues.push("Google Analytics ID is required but not set");
	}

	if (config.monitoring.sentry.enabled && !config.monitoring.sentry.dsn) {
		issues.push("Sentry DSN is required but not set");
	}

	// Check security configuration
	if (!config.security.csp.enabled) {
		warnings.push("Content Security Policy is disabled");
	}

	if (!config.security.hsts.enabled) {
		warnings.push("HSTS is disabled");
	}

	// Check WebGL configuration
	if (config.webgl.debug) {
		warnings.push("WebGL debug mode is enabled in production");
	}

	return {
		ready: issues.length === 0,
		issues,
		warnings,
	};
}

/**
 * Get production status
 */
export function getProductionStatus(): {
	environment: string;
	buildTime: string;
	version: string;
	monitoring: {
		sentry: boolean;
		analytics: boolean;
		performance: boolean;
	};
	security: {
		csp: boolean;
		hsts: boolean;
	};
} {
	const config = getProductionConfig();

	return {
		environment: process.env.NODE_ENV || "unknown",
		buildTime: process.env.NEXT_BUILD_TIME || "unknown",
		version: process.env.npm_package_version || "unknown",
		monitoring: {
			sentry: config.monitoring.sentry.enabled,
			analytics: config.monitoring.analytics.enabled,
			performance: config.monitoring.performance.enabled,
		},
		security: {
			csp: config.security.csp.enabled,
			hsts: config.security.hsts.enabled,
		},
	};
}
