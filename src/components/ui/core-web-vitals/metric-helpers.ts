/**
 * Pure helpers for rating, formatting, and naming Core Web Vitals metrics.
 */
import type { CoreWebVitalsMetrics, PerformanceRating } from "./types";

export const getRating = (
	metric: keyof CoreWebVitalsMetrics,
	value: number | null,
): PerformanceRating => {
	if (value === null) return "poor";

	switch (metric) {
		case "lcp":
			return value <= 2500
				? "good"
				: value <= 4000
					? "needs-improvement"
					: "poor";
		case "fid":
			return value <= 100
				? "good"
				: value <= 300
					? "needs-improvement"
					: "poor";
		case "cls":
			return value <= 0.1
				? "good"
				: value <= 0.25
					? "needs-improvement"
					: "poor";
		case "fcp":
			return value <= 1800
				? "good"
				: value <= 3000
					? "needs-improvement"
					: "poor";
		case "ttfb":
			return value <= 800
				? "good"
				: value <= 1800
					? "needs-improvement"
					: "poor";
		default:
			return "poor";
	}
};

export const getRatingColor = (rating: PerformanceRating): string => {
	switch (rating) {
		case "good":
			return "";
		case "needs-improvement":
			return "";
		case "poor":
			return "";
		default:
			return "";
	}
};

export const formatMetricValue = (
	metric: keyof CoreWebVitalsMetrics,
	value: number | null,
): string => {
	if (value === null) return "N/A";

	switch (metric) {
		case "lcp":
		case "fid":
		case "inp":
		case "ttfb":
		case "fcp":
			return `${Math.round(value)}ms`;
		case "cls":
			return value.toFixed(3);
		default:
			return value.toString();
	}
};

export const getMetricName = (metric: keyof CoreWebVitalsMetrics): string => {
	switch (metric) {
		case "lcp":
			return "LCP";
		case "fid":
			return "FID";
		case "cls":
			return "CLS";
		case "inp":
			return "INP";
		case "ttfb":
			return "TTFB";
		case "fcp":
			return "FCP";
		default:
			return String(metric).toUpperCase();
	}
};

export const getMetricDescription = (
	metric: keyof CoreWebVitalsMetrics,
): string => {
	switch (metric) {
		case "lcp":
			return "Largest Contentful Paint - Time to render the largest content element";
		case "fid":
			return "First Input Delay - Time from first user interaction to browser response";
		case "cls":
			return "Cumulative Layout Shift - Visual stability of the page";
		case "inp":
			return "Interaction to Next Paint - Responsiveness to user interactions";
		case "ttfb":
			return "Time to First Byte - Server response time";
		case "fcp":
			return "First Contentful Paint - Time to first content render";
		default:
			return "";
	}
};
