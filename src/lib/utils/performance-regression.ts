/**
 * Performance Regression Detection and Monitoring
 * Detects performance issues and provides recommendations
 */

export interface PerformanceBaseline {
	lcp: number;
	fid: number;
	cls: number;
	fcp: number;
	ttfb: number;
	bundleSize: number;
	timestamp: string;
}

export interface PerformanceRegression {
	metric: string;
	current: number;
	baseline: number;
	regression: number; // percentage
	severity: "low" | "medium" | "high" | "critical";
	recommendations: string[];
}

export class PerformanceRegressionDetector {
	private baseline: PerformanceBaseline | null = null;
	private currentMetrics: Partial<PerformanceBaseline> = {};

	constructor() {
		this.loadBaseline();
	}

	// Load baseline from localStorage or set default
	private loadBaseline(): void {
		if (typeof window === "undefined") return;

		try {
			const stored = localStorage.getItem("performance-baseline");
			if (stored) {
				this.baseline = JSON.parse(stored);
			} else {
				// Set default baseline values (good performance targets)
				this.baseline = {
					lcp: 2500, // 2.5s
					fid: 100, // 100ms
					cls: 0.1, // 0.1
					fcp: 1800, // 1.8s
					ttfb: 800, // 800ms
					bundleSize: 1000000, // 1MB
					timestamp: new Date().toISOString(),
				};
				this.saveBaseline();
			}
		} catch (error) {
			console.warn("Failed to load performance baseline:", error);
		}
	}

	// Save baseline to localStorage
	private saveBaseline(): void {
		if (typeof window === "undefined" || !this.baseline) return;

		try {
			localStorage.setItem(
				"performance-baseline",
				JSON.stringify(this.baseline),
			);
		} catch (error) {
			console.warn("Failed to save performance baseline:", error);
		}
	}

	// Update current metrics
	public updateMetric(metric: keyof PerformanceBaseline, value: number): void {
		if (metric === "timestamp") return; // Skip timestamp updates
		this.currentMetrics[metric] = value;
		this.checkForRegression(metric, value);
	}

	// Check for performance regression
	private checkForRegression(
		metric: keyof PerformanceBaseline,
		value: number,
	): void {
		if (!this.baseline) return;

		const baselineValue = this.baseline[metric];
		if (typeof baselineValue !== "number") return;

		const regression = ((value - baselineValue) / baselineValue) * 100;

		// Only report regressions (performance getting worse)
		if (regression > 10) {
			// 10% threshold
			const regressionData: PerformanceRegression = {
				metric,
				current: value,
				baseline: baselineValue,
				regression,
				severity: this.getSeverity(regression),
				recommendations: this.getRecommendations(metric),
			};

			this.reportRegression(regressionData);
		}
	}

	// Determine severity based on regression percentage
	private getSeverity(regression: number): PerformanceRegression["severity"] {
		if (regression > 100) return "critical";
		if (regression > 50) return "high";
		if (regression > 25) return "medium";
		return "low";
	}

	// Get recommendations based on metric and regression
	private getRecommendations(metric: string): string[] {
		const recommendations: Record<string, string[]> = {
			lcp: [
				"Optimize images with WebP format and proper sizing",
				"Preload critical resources above the fold",
				"Reduce server response time (TTFB)",
				"Eliminate render-blocking resources",
				"Use CDN for static assets",
			],
			fid: [
				"Reduce JavaScript execution time",
				"Break up long tasks with setTimeout or requestIdleCallback",
				"Use web workers for heavy computations",
				"Optimize third-party scripts",
				"Implement code splitting",
			],
			cls: [
				"Set explicit dimensions for images and videos",
				"Preload fonts to prevent font swap",
				"Avoid inserting content above existing content",
				"Use transform animations instead of layout changes",
				"Reserve space for dynamic content",
			],
			fcp: [
				"Optimize critical rendering path",
				"Inline critical CSS",
				"Preload key resources",
				"Optimize font loading",
				"Reduce server response time",
			],
			ttfb: [
				"Optimize server performance",
				"Use CDN for global distribution",
				"Implement proper caching strategies",
				"Optimize database queries",
				"Use HTTP/2 or HTTP/3",
			],
			bundleSize: [
				"Implement code splitting",
				"Remove unused dependencies",
				"Use tree shaking",
				"Optimize images and assets",
				"Use dynamic imports for heavy components",
			],
		};

		return recommendations[metric] || ["Investigate performance bottlenecks"];
	}

	// Report regression
	private reportRegression(regression: PerformanceRegression): void {
		console.warn("Performance Regression Detected:", regression);

		// Send to monitoring service in production
		if (
			process.env.NODE_ENV === "production" &&
			typeof window !== "undefined"
		) {
			fetch("/api/monitoring/performance", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "performance_regression",
					regression,
					timestamp: new Date().toISOString(),
					url: window.location.href,
					userAgent: navigator.userAgent,
				}),
			}).catch(() => {
				// Silently fail
			});
		}

		// Show user notification for critical regressions
		if (regression.severity === "critical" && typeof window !== "undefined") {
			this.showRegressionNotification(regression);
		}
	}

	// Show regression notification to user
	private showRegressionNotification(regression: PerformanceRegression): void {
		// In a real app, you might show a toast or banner
		console.error(
			`Critical performance regression in ${regression.metric}: ${regression.regression.toFixed(1)}% slower`,
		);
	}

	// Update baseline with current good performance
	public updateBaseline(): void {
		if (!this.baseline) return;

		const now = new Date().toISOString();
		let updated = false;

		// Update baseline if current metrics are better
		Object.entries(this.currentMetrics).forEach(([metric, value]) => {
			const key = metric as keyof PerformanceBaseline;
			if (typeof value === "number" && this.baseline?.[key]) {
				// For metrics where lower is better
				if (
					["lcp", "fid", "cls", "fcp", "ttfb", "bundleSize"].includes(metric)
				) {
					const baselineValue = this.baseline?.[key];
					if (typeof baselineValue === "number" && value < baselineValue) {
						(this.baseline![key] as number) = value;
						updated = true;
					}
				}
			}
		});

		if (updated) {
			this.baseline.timestamp = now;
			this.saveBaseline();
			console.log("Performance baseline updated with better metrics");
		}
	}

	// Get current performance status
	public getPerformanceStatus(): {
		baseline: PerformanceBaseline | null;
		current: Partial<PerformanceBaseline>;
		regressions: PerformanceRegression[];
	} {
		const regressions: PerformanceRegression[] = [];

		if (this.baseline) {
			Object.entries(this.currentMetrics).forEach(([metric, value]) => {
				const key = metric as keyof PerformanceBaseline;
				const baselineValue = this.baseline?.[key];

				if (typeof value === "number" && typeof baselineValue === "number") {
					const regression = ((value - baselineValue) / baselineValue) * 100;

					if (regression > 10) {
						regressions.push({
							metric,
							current: value,
							baseline: baselineValue,
							regression,
							severity: this.getSeverity(regression),
							recommendations: this.getRecommendations(metric),
						});
					}
				}
			});
		}

		return {
			baseline: this.baseline,
			current: this.currentMetrics,
			regressions,
		};
	}

	// Reset baseline (useful for testing)
	public resetBaseline(): void {
		if (typeof window === "undefined") return;

		localStorage.removeItem("performance-baseline");
		this.baseline = null;
		this.loadBaseline();
	}
}

// Global instance
let regressionDetector: PerformanceRegressionDetector | null = null;

// Get or create regression detector
export const getPerformanceRegressionDetector =
	(): PerformanceRegressionDetector => {
		if (!regressionDetector) {
			regressionDetector = new PerformanceRegressionDetector();
		}
		return regressionDetector;
	};

// Performance monitoring hook
export const usePerformanceRegression = () => {
	const detector = getPerformanceRegressionDetector();

	return {
		updateMetric: (metric: keyof PerformanceBaseline, value: number) =>
			detector.updateMetric(metric, value),
		updateBaseline: () => detector.updateBaseline(),
		getStatus: () => detector.getPerformanceStatus(),
		resetBaseline: () => detector.resetBaseline(),
	};
};

// Initialize performance regression monitoring
export const initializePerformanceRegression =
	(): PerformanceRegressionDetector => {
		const detector = getPerformanceRegressionDetector();

		// Monitor Core Web Vitals
		if (typeof PerformanceObserver !== "undefined") {
			try {
				// LCP Observer
				const lcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
						startTime: number;
					};
					detector.updateMetric("lcp", lastEntry.startTime);
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
							detector.updateMetric("fid", fid);
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
					detector.updateMetric("cls", clsValue);
				});
				clsObserver.observe({ entryTypes: ["layout-shift"] });

				// FCP Observer
				const fcpObserver = new PerformanceObserver((list) => {
					const entries = list.getEntries();
					entries.forEach(
						(entry: PerformanceEntry & { name: string; startTime: number }) => {
							if (entry.name === "first-contentful-paint") {
								detector.updateMetric("fcp", entry.startTime);
							}
						},
					);
				});
				fcpObserver.observe({ entryTypes: ["paint"] });
			} catch (error) {
				console.warn(
					"Performance regression monitoring failed to start:",
					error,
				);
			}
		}

		return detector;
	};
