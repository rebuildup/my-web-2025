/**
 * Registers performance monitoring helpers after the page load event.
 * The implementations live under `@/lib/utils` so we defer the imports until
 * we are safely on the client.
 */
"use client";

import { useEffect } from "react";

// Helper function to load performance utilities dynamically
async function loadPerformanceUtilities() {
	const bundleOptimizationModule = await import(
		"@/lib/utils/bundle-optimization"
	);
	const performanceModule = await import("@/lib/utils/performance");
	return {
		initializeBundleOptimization:
			bundleOptimizationModule.initializeBundleOptimization,
		initializePerformanceMonitoring:
			performanceModule.initializePerformanceMonitoring,
	};
}

export function PerformanceInitializer() {
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		let canceled = false;

		const handleLoad = async () => {
			try {
				const {
					initializeBundleOptimization,
					initializePerformanceMonitoring,
				} = await loadPerformanceUtilities();

				if (canceled) {
					return;
				}

				if (initializeBundleOptimization) {
					initializeBundleOptimization();
				}
				if (initializePerformanceMonitoring) {
					initializePerformanceMonitoring();
				}
				console.log("Performance monitoring initialized");
			} catch (error) {
				if (!canceled) {
					console.warn("Performance monitoring initialization failed:", error);
				}
			}
		};

		if (document.readyState === "complete") {
			// The page already loaded before this effect ran.
			handleLoad();
		} else {
			window.addEventListener("load", handleLoad);
		}

		return () => {
			canceled = true;
			window.removeEventListener("load", handleLoad);
		};
	}, []);

	return null;
}
