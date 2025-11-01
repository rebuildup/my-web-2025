/**
 * Registers performance monitoring helpers after the page load event.
 * The implementations live under `@/lib/utils` so we defer the imports until
 * we are safely on the client.
 */
"use client";

import { useEffect } from "react";

export function PerformanceInitializer() {
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		let canceled = false;

		const handleLoad = async () => {
			try {
				const [
					{ initializeBundleOptimization },
					{ initializePerformanceMonitoring },
				] = await Promise.all([
					import("@/lib/utils/bundle-optimization"),
					import("@/lib/utils/performance"),
				]);

				if (canceled) {
					return;
				}

				initializeBundleOptimization?.();
				initializePerformanceMonitoring?.();
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
