"use client";

/**
 * Hook that wires up Performance Observers and tracks Core Web Vitals metrics.
 */
import { useEffect, useState } from "react";
import {
	type CoreWebVitalsMetrics,
	initialCoreWebVitalsMetrics,
} from "./types";

export const useCoreWebVitals = (): CoreWebVitalsMetrics => {
	const [metrics, setMetrics] = useState<CoreWebVitalsMetrics>(
		initialCoreWebVitalsMetrics,
	);

	useEffect(() => {
		if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
			return;
		}

		try {
			// LCP Observer
			const lcpObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
					startTime: number;
				};
				setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
			});
			lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

			// FID Observer
			const fidObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					const fidEntry = entry as PerformanceEntry & {
						processingStart: number;
						startTime: number;
					};
					if ("processingStart" in fidEntry) {
						const fid = fidEntry.processingStart - fidEntry.startTime;
						setMetrics((prev) => ({ ...prev, fid }));
					}
				});
			});
			fidObserver.observe({ entryTypes: ["first-input"] });

			// CLS Observer
			let clsValue = 0;
			const clsObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach((entry) => {
					const clsEntry = entry as PerformanceEntry & {
						hadRecentInput: boolean;
						value: number;
					};
					if ("hadRecentInput" in clsEntry && "value" in clsEntry) {
						if (!clsEntry.hadRecentInput) {
							clsValue += clsEntry.value;
						}
					}
				});
				setMetrics((prev) => ({ ...prev, cls: clsValue }));
			});
			clsObserver.observe({ entryTypes: ["layout-shift"] });

			// FCP Observer
			const fcpObserver = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				entries.forEach(
					(entry: PerformanceEntry & { name: string; startTime: number }) => {
						if (entry.name === "first-contentful-paint") {
							setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
						}
					},
				);
			});
			fcpObserver.observe({ entryTypes: ["paint"] });

			return () => {
				lcpObserver.disconnect();
				fidObserver.disconnect();
				clsObserver.disconnect();
				fcpObserver.disconnect();
			};
		} catch (error) {
			console.warn("Performance observers failed to initialize:", error);
		}
	}, []);

	return metrics;
};
