/**
 * Type definitions for Core Web Vitals monitoring.
 */

export interface CoreWebVitalsMetrics {
	lcp: number | null;
	fid: number | null;
	cls: number | null;
	inp: number | null;
	ttfb: number | null;
	fcp: number | null;
}

export type PerformanceRating = "good" | "needs-improvement" | "poor";

export interface CoreWebVitalsDisplayProps {
	showDetails?: boolean;
	className?: string;
}

export const initialCoreWebVitalsMetrics: CoreWebVitalsMetrics = {
	lcp: null,
	fid: null,
	cls: null,
	inp: null,
	ttfb: null,
	fcp: null,
};
