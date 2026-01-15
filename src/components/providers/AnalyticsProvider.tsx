/**
 * Analytics Provider Component
 * Simple Google Analytics integration using gtag
 */

"use client";

import { usePathname } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
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

interface AnalyticsProviderProps {
	children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
	// Initialize with true to enabled tracking by default (Opt-out model)
	// This ensures analytics works for users who haven't explicitly interacted with the consent banner yet
	const [consentGiven, setConsentGiven] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const [gaLoaded, setGaLoaded] = useState(false);
	const pathname = usePathname();

	// Initialize Google Analytics
	useEffect(() => {
		if (typeof window === "undefined") return;

		const gaId = process.env.NEXT_PUBLIC_GA_ID;
		if (!gaId) {
			console.warn(
				"NEXT_PUBLIC_GA_ID is not set. Google Analytics will not be initialized.",
			);
			setIsInitialized(true);
			return;
		}

		console.log(`Initializing Google Analytics with ID: ${gaId}`);

		// Check if gtag is already loaded (e.g., by GTM or initProduction)
		if (window.gtag) {
			console.log("Google Analytics (gtag) is already loaded.");
			setGaLoaded(true);
			setIsInitialized(true);
			return;
		}

		// Load gtag script
		const script = document.createElement("script");
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
		script.onload = () => {
			// Initialize gtag
			window.dataLayer = window.dataLayer || [];
			function gtag(...args: unknown[]) {
				window.dataLayer?.push(args);
			}

			gtag("js", new Date());
			gtag("config", gaId, {
				page_title: document.title,
				page_location: window.location.href,
				send_page_view: true, // Ensure page view is sent on init
			});

			// Make gtag available globally
			(window as unknown as { gtag: typeof gtag }).gtag = gtag;

			console.log("Google Analytics initialized successfully.");
			setGaLoaded(true);
			setIsInitialized(true);
		};
		script.onerror = () => {
			console.error("Failed to load Google Analytics script");
			setIsInitialized(true);
		};

		document.head.appendChild(script);
	}, []);

	// Check for existing consent
	useEffect(() => {
		try {
			const savedConsent = localStorage.getItem("analytics-consent");

			if (savedConsent === "true") {
				setConsentGiven(true);
			} else if (savedConsent === "false") {
				setConsentGiven(false);
			} else {
				// Default to true if no preference is saved (Opt-out model)
				setConsentGiven(true);
			}
		} catch (error) {
			// Handle localStorage errors gracefully
			console.warn(
				"Failed to read analytics consent from localStorage:",
				error,
			);
		}
	}, []);

	// Track page views automatically when pathname changes
	useEffect(() => {
		if (!isInitialized || !consentGiven || !gaLoaded) return;

		const gaId = process.env.NEXT_PUBLIC_GA_ID;
		if (!gaId || !window.gtag) return;

		// Use window.location.search instead of useSearchParams to avoid Suspense requirement
		const searchParams =
			typeof window !== "undefined" ? window.location.search : "";
		const url = pathname + searchParams;

		console.log(`Tracking PageView: ${url}`);

		window.gtag("config", gaId, {
			page_path: url,
			page_title: document.title,
		});
	}, [pathname, isInitialized, consentGiven, gaLoaded]);

	const handleSetConsent = (consent: boolean) => {
		setConsentGiven(consent);
		try {
			localStorage.setItem("analytics-consent", consent.toString());

			// If consent is revoked, we might want to reload or clear cookies,
			// but simply stopping future events is the MVP approach.
			console.log(`Analytics consent set to: ${consent}`);
		} catch (error) {
			// Handle localStorage errors gracefully
			console.warn("Failed to save analytics consent to localStorage:", error);
		}
	};

	const trackPageView = (url: string, title?: string) => {
		const gaId = process.env.NEXT_PUBLIC_GA_ID;
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

// Hook for page view tracking
export function usePageView(url: string, title?: string) {
	const { trackPageView } = useAnalytics();

	useEffect(() => {
		trackPageView(url, title);
	}, [url, title, trackPageView]);
}

// Hook for tool usage tracking
export function useToolTracking(toolName: string) {
	const { trackToolUsage } = useAnalytics();

	return {
		trackUsage: (action: string, details?: Record<string, unknown>) => {
			trackToolUsage(toolName, action, details);
		},
	};
}

// Hook for error tracking
export function useErrorTracking() {
	const { trackError } = useAnalytics();

	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			trackError(event.error || new Error(event.message), "global_error");
		};

		const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
			const error =
				event.reason instanceof Error
					? event.reason
					: new Error(String(event.reason));
			trackError(error, "unhandled_promise_rejection");
		};

		window.addEventListener("error", handleError);
		window.addEventListener("unhandledrejection", handleUnhandledRejection);

		return () => {
			window.removeEventListener("error", handleError);
			window.removeEventListener(
				"unhandledrejection",
				handleUnhandledRejection,
			);
		};
	}, [trackError]);
}
