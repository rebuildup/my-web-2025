/**
 * Dynamic import utilities for code splitting and performance optimization
 * Implements lazy loading for heavy components and libraries
 */

/**
 * Dynamic import utilities for code splitting and performance optimization
 * Implements lazy loading for heavy components and libraries
 */

import type React from "react";
import { type ComponentType, lazy } from "react";

// Loading component for lazy-loaded components
export const LoadingSpinner: React.FC = () => (
	<div className="flex items-center justify-center p-8">
		<div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
	</div>
);

// Error boundary component for lazy-loaded components
export const LazyErrorBoundary: React.FC<{
	error: Error;
	retry: () => void;
}> = ({ retry }) => (
	<div className="flex flex-col items-center justify-center p-8 text-center">
		<div className="text-red-500 mb-4">
			<svg
				className="w-12 h-12 mx-auto mb-2"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<title>読み込みエラー</title>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
				/>
			</svg>
			<p className="text-sm">コンポーネントの読み込みに失敗しました</p>
		</div>
		<button
			type="button"
			onClick={retry}
			className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
		>
			再試行
		</button>
	</div>
);

// Dynamic import wrapper with error handling and retry
export const createLazyComponent = <T extends ComponentType<unknown>>(
	importFn: () => Promise<{ default: T }>,
	fallback?: ComponentType<unknown>,
): ComponentType<unknown> => {
	return lazy(async () => {
		try {
			return await importFn();
		} catch (error) {
			console.error("Dynamic import failed:", error);
			// Return fallback component or error component
			return {
				default:
					fallback ||
					(() => (
						<LazyErrorBoundary
							error={error as Error}
							retry={() => window.location.reload()}
						/>
					)),
			};
		}
	});
};

// Preload function for dynamic imports
export const preloadComponent = (importFn: () => Promise<unknown>): void => {
	// Preload on idle or user interaction
	if ("requestIdleCallback" in window) {
		requestIdleCallback(() => {
			importFn().catch(console.error);
		});
	} else {
		setTimeout(() => {
			importFn().catch(console.error);
		}, 100);
	}
};

// Tools components - Heavy components that should be lazy loaded
export const LazyComponents = {
	// Optimized Image component
	OptimizedImage: createLazyComponent(
		async () => {
			const mod = await import("@/components/ui/OptimizedImage");
			return { default: mod.OptimizedImage as ComponentType<unknown> };
		},
		() => <div>Image component is loading...</div>,
	),
};

// Library imports - Heavy libraries that should be lazy loaded
export const LazyLibraries = {
	// Three.js
	Three: () => import("three"),

	// PIXI.js
	PIXI: () => import("pixi.js"),

	// Framer Motion (for complex animations)
	FramerMotion: () => import("framer-motion"),

	// QR Code generation
	QRCode: () => import("qrcode"),

	// Markdown parser
	Marked: () => import("marked"),

	// Search library
	Fuse: () => import("fuse.js"),

	// Chart library
	Recharts: () => import("recharts"),

	// Date utilities
	DateFns: () => import("date-fns"),

	// GSAP for animations
	GSAP: () => import("gsap"),

	// DOMPurify for sanitization
	DOMPurify: () => import("isomorphic-dompurify"),
};

// Preload strategies
export const PreloadStrategies = {
	// Preload on page load
	immediate: (importFn: () => Promise<unknown>) => {
		if (typeof window !== "undefined") {
			importFn().catch(console.error);
		}
	},

	// Preload on user interaction
	onInteraction: (importFn: () => Promise<unknown>) => {
		if (typeof window !== "undefined") {
			const events = ["mouseenter", "touchstart", "focus"];
			const preload = () => {
				importFn().catch(console.error);
				events.forEach((event) => {
					document.removeEventListener(event, preload);
				});
			};

			events.forEach((event) => {
				document.addEventListener(event, preload, {
					once: true,
					passive: true,
				});
			});
		}
	},

	// Preload on idle
	onIdle: (importFn: () => Promise<unknown>) => {
		if (typeof window !== "undefined") {
			if ("requestIdleCallback" in window) {
				requestIdleCallback(
					() => {
						importFn().catch(console.error);
					},
					{ timeout: 2000 },
				);
			} else {
				setTimeout(() => {
					importFn().catch(console.error);
				}, 1000);
			}
		}
	},

	// Preload on viewport intersection
	onViewport: (importFn: () => Promise<unknown>, element: Element) => {
		if (typeof window !== "undefined" && "IntersectionObserver" in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							importFn().catch(console.error);
							observer.unobserve(entry.target);
						}
					});
				},
				{ rootMargin: "100px" },
			);

			observer.observe(element);
		}
	},
};

// Route-based preloading
export const RoutePreloader = {
	// Preload components for specific routes
	preloadForRoute: (route: string) => {
		switch (route) {
			case "/tools":
				// Preload commonly used tools
				PreloadStrategies.onIdle(LazyLibraries.QRCode);
				break;

			case "/portfolio":
				// Preload Three.js for WebGL playground
				PreloadStrategies.onIdle(LazyLibraries.Three);
				break;

			case "/workshop":
				// Preload markdown parser and search
				PreloadStrategies.onIdle(LazyLibraries.Marked);
				PreloadStrategies.onIdle(LazyLibraries.Fuse);
				break;

			case "/admin":
				// Preload admin components (development only)
				if (process.env.NODE_ENV === "development") {
					PreloadStrategies.onIdle(LazyLibraries.Recharts);
				}
				break;
		}
	},

	// Preload based on user behavior
	preloadOnHover: (targetRoute: string) => {
		const links = document.querySelectorAll(`a[href="${targetRoute}"]`);
		links.forEach((link) => {
			link.addEventListener(
				"mouseenter",
				() => {
					RoutePreloader.preloadForRoute(targetRoute);
				},
				{ once: true },
			);
		});
	},
};

// Bundle splitting utilities
export const BundleSplitter = {
	// Split vendor libraries
	vendors: {
		ui: () =>
			Promise.all([LazyLibraries.FramerMotion(), import("lucide-react")]),

		graphics: () =>
			Promise.all([
				LazyLibraries.Three(),
				LazyLibraries.PIXI(),
				LazyLibraries.GSAP(),
			]),

		utils: () =>
			Promise.all([
				LazyLibraries.DateFns(),
				LazyLibraries.DOMPurify(),
				LazyLibraries.Fuse(),
			]),
	},

	// Get bundle size information
	getBundleInfo: () => {
		if (
			typeof window !== "undefined" &&
			(
				window as Window & {
					__NEXT_DATA__?: {
						buildId?: string;
						chunks?: string[];
						page?: string;
					};
				}
			).__NEXT_DATA__
		) {
			const nextData = (
				window as Window & {
					__NEXT_DATA__: {
						buildId?: string;
						chunks?: string[];
						page?: string;
					};
				}
			).__NEXT_DATA__;
			return {
				buildId: nextData.buildId,
				chunks: nextData.chunks || [],
				page: nextData.page,
			};
		}
		return null;
	},
};

// Initialize dynamic imports and preloading
export const initializeDynamicImports = () => {
	if (typeof window !== "undefined") {
		// Preload critical components on idle
		PreloadStrategies.onIdle(() => import("@/components/ui/OptimizedImage"));

		// Setup route-based preloading
		const currentPath = window.location.pathname;
		RoutePreloader.preloadForRoute(currentPath);

		// Setup hover preloading for navigation links
		["/about", "/portfolio", "/workshop", "/tools"].forEach((route) => {
			RoutePreloader.preloadOnHover(route);
		});

		// Log bundle information in development
		if (process.env.NODE_ENV === "development") {
			console.log("Bundle info:", BundleSplitter.getBundleInfo());
		}
	}
};
