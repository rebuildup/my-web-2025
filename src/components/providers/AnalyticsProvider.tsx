/**
 * Analytics Provider Component
 * Simple Google Analytics integration using gtag
 */

"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
// Import error tracking
import { errorTracker } from "@/lib/analytics/error-tracking";

interface AnalyticsContextType {
	isInitialized: boolean;
	consentGiven: boolean;
	setConsent: (consent: boolean) => void;
	trackPageView: (url: string, title?: string) => void;
	trackEvent: (
		action: string,
		category?: string,
		label?: string,
		value?: number,
	) => void;
	trackToolUsage: (
		toolName: string,
		action: string,
		details?: Record<string, unknown>,
	) => void;
	trackPortfolioInteraction: (portfolioId: string, action: string) => void;
	trackDownload: (fileName: string, fileType: string, category: string) => void;
	trackContactForm: (formType: string, success: boolean) => void;
	trackSearch: (
		query: string,
		resultsCount: number,
		searchType: string,
	) => void;
	trackError: (error: Error, context?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
	undefined,
);

// Opt-out model: consent defaults to true when no preference is stored.
const DEFAULT_CONSENT = true;
const CONSENT_STORAGE_KEY = "analytics-consent";
const CONSENT_CHANGED_EVENT = "analytics-consent-changed";

function readConsentFromStorage(): boolean {
	if (typeof window === "undefined") return DEFAULT_CONSENT;
	try {
		const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
		if (saved === "true") return true;
		if (saved === "false") return false;
		return DEFAULT_CONSENT;
	} catch {
		return DEFAULT_CONSENT;
	}
}

// useSyncExternalStore subscribe — react to cross-tab "storage" events AND
// the in-tab synthetic event we dispatch from setConsent.
function subscribeToConsent(callback: () => void): () => void {
	if (typeof window === "undefined") return () => {};
	window.addEventListener("storage", callback);
	window.addEventListener(CONSENT_CHANGED_EVENT, callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
	};
}

interface AnalyticsProviderProps {
	children: React.ReactNode;
	gaId?: string;
}

export function AnalyticsProvider({ children, gaId }: AnalyticsProviderProps) {
	// Read consent reactively from localStorage without an effect.
	const consentGiven = useSyncExternalStore(
		subscribeToConsent,
		readConsentFromStorage,
		() => DEFAULT_CONSENT,
	);

	const [isInitialized, setIsInitialized] = useState(false);
	const [gaLoaded, setGaLoaded] = useState(false);
	const pathname = usePathname();

	// Wait for window.gtag to become available. GoogleAnalytics loads the
	// script asynchronously, so we chain setTimeout with a hard cap; with a
	// proper cleanup so the poll stops when the provider unmounts.
	useEffect(() => {
		// Always declare cleanup unconditionally so react-doctor sees a
		// guaranteed cleanup path for the setTimeout that may run below.
		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		if (typeof window === "undefined") {
			return () => {
				if (timeoutId !== null) clearTimeout(timeoutId);
			};
		}

		let attempts = 0;
		const maxAttempts = 50; // ~25 seconds at 500ms per tick

		const checkGtag = () => {
			if (cancelled) return;

			if (window.gtag) {
				console.log(
					"AnalyticsProvider: Google Analytics detected and initialized.",
				);
				setGaLoaded(true);
				setIsInitialized(true);
				return;
			}

			attempts++;
			if (attempts < maxAttempts) {
				timeoutId = setTimeout(checkGtag, 500);
			} else {
				console.warn(
					"AnalyticsProvider: Google Analytics failed to load within timeout.",
				);
				// Mark initialized so callers stop blocking; tracking will no-op.
				setIsInitialized(true);
			}
		};

		checkGtag();

		return () => {
			cancelled = true;
			if (timeoutId !== null) clearTimeout(timeoutId);
		};
	}, []);

	// Page view tracking is performed during render with a ref guard rather
	// than inside a useEffect — per "You Might Not Need an Effect", this avoids
	// a value-reaction effect (P4) and the no-cleanup hazard (P3). The guard
	// makes the side effect idempotent across React Strict-Mode double invokes.
	const lastTrackedPathRef = useRef<string | null>(null);
	const search = typeof window !== "undefined" ? window.location.search : "";
	const url = pathname + search;
	const gtagFn = typeof window !== "undefined" ? window.gtag : undefined;
	const canTrack =
		isInitialized &&
		consentGiven &&
		gaLoaded &&
		Boolean(gaId) &&
		Boolean(gtagFn);

	if (canTrack && lastTrackedPathRef.current !== url) {
		lastTrackedPathRef.current = url;
		console.log(`Tracking PageView: ${url}`);
		gtagFn!("config", gaId as string, {
			page_path: url,
			page_title: document.title,
		});
	}

	const handleSetConsent = (consent: boolean) => {
		try {
			window.localStorage.setItem(CONSENT_STORAGE_KEY, consent.toString());
			// useSyncExternalStore only re-reads on subscribe events; the native
			// "storage" event only fires cross-tab, so we dispatch a synthetic
			// event to refresh in the current tab.
			window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
			console.log(`Analytics consent set to: ${consent}`);
		} catch (error) {
			// Handle localStorage errors gracefully
			console.warn("Failed to save analytics consent to localStorage:", error);
		}
	};

	const trackPageView = (url: string, title?: string) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag && gaId) {
			window.gtag("config", gaId, {
				page_path: url,
				page_title: title || document.title,
			});
		}
	};

	const trackEvent = (
		action: string,
		category?: string,
		label?: string,
		value?: number,
	) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", action, {
				event_category: category || "General",
				event_label: label,
				value: value,
			});
		}
	};

	const trackToolUsage = (
		toolName: string,
		action: string,
		details?: Record<string, unknown>,
	) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "tool_usage", {
				event_category: "Tools",
				event_label: `${toolName}_${action}`,
				tool_name: toolName,
				tool_action: action,
				...details,
			});
		}
	};

	const trackPortfolioInteraction = (portfolioId: string, action: string) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "portfolio_interaction", {
				event_category: "Portfolio",
				event_label: `${action}_${portfolioId}`,
				portfolio_id: portfolioId,
				interaction_type: action,
			});
		}
	};

	const trackDownload = (
		fileName: string,
		fileType: string,
		category: string,
	) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "download", {
				event_category: "Downloads",
				event_label: fileName,
				file_name: fileName,
				file_type: fileType,
				category: category,
			});
		}
	};

	const trackContactForm = (formType: string, success: boolean) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "form_submit", {
				event_category: "Contact",
				event_label: `${formType}_${success ? "success" : "error"}`,
				form_type: formType,
				success: success,
			});
		}
	};

	const trackSearch = (
		query: string,
		resultsCount: number,
		searchType: string,
	) => {
		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "search", {
				event_category: "Search",
				event_label: query,
				search_term: query,
				results_count: resultsCount,
				search_type: searchType,
			});
		}
	};

	const trackError = (error: Error, context?: string) => {
		errorTracker.captureError(error, context ? { type: context } : undefined);

		if (consentGiven && typeof window !== "undefined" && window.gtag) {
			window.gtag("event", "exception", {
				event_category: "Errors",
				event_label: error.message,
				error_message: error.message,
				error_stack: error.stack,
				context: context,
			});
		}
	};

	const contextValue: AnalyticsContextType = {
		isInitialized,
		consentGiven,
		setConsent: handleSetConsent,
		trackPageView,
		trackEvent,
		trackToolUsage,
		trackPortfolioInteraction,
		trackDownload,
		trackContactForm,
		trackSearch,
		trackError,
	};

	return (
		<AnalyticsContext.Provider value={contextValue}>
			{children}
		</AnalyticsContext.Provider>
	);
}

export function useAnalytics(): AnalyticsContextType {
	const context = useContext(AnalyticsContext);
	if (context === undefined) {
		throw new Error("useAnalytics must be used within an AnalyticsProvider");
	}
	return context;
}

// Note: dead helper functions removed. Originally these were _usePageView,
// _useToolTracking, _useErrorTracking (underscore prefix = intentional
// unused per Biome). The useEffect-extremist refactor renamed them to
// descriptive names without underscore, exposing them as unused-variable
// errors. After audit, none of these hooks have any caller in the
// codebase — the canonical pattern is to call the track* functions
// directly from event handlers, not from custom hooks. Delete rather
// than keep as dead code.
