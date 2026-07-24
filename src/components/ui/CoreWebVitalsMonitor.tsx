"use client";

/**
 * Core Web Vitals display component.
 *
 * This file also re-exports the supporting subcomponents (PerformanceReport,
 * PerformanceBudgetIndicator, PerformanceDevPanel) which live alongside their
 * helpers in the ./core-web-vitals subdirectory.
 */
import type React from "react";
import { useEffect, useState } from "react";
import {
	initializePerformanceRegression,
	type PerformanceRegressionDetector,
} from "@/lib/utils/performance-regression";
import {
	formatMetricValue,
	getMetricDescription,
	getMetricName,
	getRating,
	getRatingColor,
} from "./core-web-vitals/metric-helpers";
import { PerformanceReport } from "./core-web-vitals/PerformanceReport";
import type { CoreWebVitalsDisplayProps } from "./core-web-vitals/types";
import { useCoreWebVitals } from "./core-web-vitals/useCoreWebVitals";

export const CoreWebVitalsDisplay: React.FC<CoreWebVitalsDisplayProps> = ({
	showDetails = false,
	className = "",
}) => {
	const metrics = useCoreWebVitals();
	const [detector, setDetector] =
		useState<PerformanceRegressionDetector | null>(null);

	useEffect(() => {
		setDetector(initializePerformanceRegression());
	}, []);

	const runPerformanceTest = async () => {
		if (!detector) return;

		try {
			const status = detector.getPerformanceStatus();
			console.log("Performance status:", status);

			// Show results in development
			if (process.env.NODE_ENV === "development") {
				let baselineText = "Not Set";
				if (status.baseline) {
					baselineText = "Set";
				}
				alert(
					`Performance Test Complete!\nRegressions: ${status.regressions.length}\nBaseline: ${baselineText}`,
				);
			}
		} catch (error) {
			console.error("Performance test failed:", error);
		}
	};

	if (!showDetails) {
		// Compact view - show only core metrics
		const coreMetrics = ["lcp", "fid", "cls"] as const;
		const allGood = coreMetrics.every((metric) => {
			const rating = getRating(metric, metrics[metric]);
			return rating === "good";
		});

		return (
			<div className={`flex items-center space-x-2 ${className}`}>
				<div className={`w-3 h-3 rounded-full ${allGood ? "" : ""}`} />
				<span className="text-sm ">
					Core Web Vitals: {allGood ? "Good" : "Needs Improvement"}
				</span>
			</div>
		);
	}

	return (
		<div className={` rounded-lg  p-6 ${className}`}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold ">Core Web Vitals</h3>
				{process.env.NODE_ENV === "development" && (
					<button
						type="button"
						onClick={runPerformanceTest}
						className="px-3 py-1 text-sm"
					>
						Run Test
					</button>
				)}
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
				{Object.entries(metrics).map(([metric, value]) => {
					const metricKey = metric as keyof typeof metrics;
					const rating = getRating(metricKey, value);
					const colorClass = getRatingColor(rating);

					return (
						<div key={metric} className=" rounded-lg p-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium ">
									{getMetricName(metricKey)}
								</span>
								<div
									className={`w-2 h-2 rounded-full ${
										rating === "good"
											? ""
											: rating === "needs-improvement"
												? ""
												: ""
									}`}
								/>
							</div>

							<div className={`text-lg font-bold ${colorClass}`}>
								{formatMetricValue(metricKey, value)}
							</div>

							<div className="text-xs  mt-1">
								{getMetricDescription(metricKey)}
							</div>
						</div>
					);
				})}
			</div>

			{detector && (
				<div className="mt-6">
					<PerformanceReport detector={detector} />
				</div>
			)}
		</div>
	);
};

export { PerformanceBudgetIndicator } from "./core-web-vitals/PerformanceBudgetIndicator";
export { PerformanceDevPanel } from "./core-web-vitals/PerformanceDevPanel";
// Re-export supporting subcomponents so existing imports from
// "./CoreWebVitalsMonitor" continue to work.
export { PerformanceReport } from "./core-web-vitals/PerformanceReport";
