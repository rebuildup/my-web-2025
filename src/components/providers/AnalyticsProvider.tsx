/**
 * Analytics Provider Component
 * Manages Google Analytics initialization and consent
 */

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { analytics } from "@/lib/analytics/google-analytics";
import { errorTracker } from "@/lib/analytics/error-tracking";
// import { performanceMonitor } from "@/lib/analytics/performance-monitoring";

interface AnalyticsContextType {
  isInitialized: boolean;
  consentGiven: boolean;
  setConsent: (consent: boolean) => void;
  trackPageView: (url: string, title?: string) => void;
  trackEvent: (event: Parameters<typeof analytics.trackEvent>[0]) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const savedConsent = localStorage.getItem("analytics-consent");

    // Debug: Clear consent if GA_ID is not configured (development only)
    if (
      process.env.NODE_ENV === "development" &&
      !process.env.NEXT_PUBLIC_GA_ID &&
      savedConsent
    ) {
      console.log("Clearing analytics consent due to missing GA_ID");
      localStorage.removeItem("analytics-consent");
      return;
    }

    if (savedConsent === "true") {
      setConsentGiven(true);
      // Only initialize if GA_ID is configured
      if (process.env.NEXT_PUBLIC_GA_ID) {
        initializeAnalytics();
      } else {
        console.log("Analytics consent given but GA_ID not configured");
        setIsInitialized(true); // Set as initialized to prevent further attempts
      }
    } else if (savedConsent === "false") {
      setConsentGiven(false);
    }
  }, []);

  const initializeAnalytics = async () => {
    try {
      // Skip analytics initialization in development if GA_ID is not configured
      if (
        process.env.NODE_ENV === "development" &&
        !process.env.NEXT_PUBLIC_GA_ID
      ) {
        console.log("Analytics disabled in development - GA_ID not configured");
        setIsInitialized(true);
        return;
      }

      await analytics.loadScript();
      analytics.setConsent(true);
      setIsInitialized(true);
    } catch (error) {
      console.warn("Analytics initialization skipped:", error);
      // Don't track analytics initialization errors if GA_ID is not configured
      if (process.env.NEXT_PUBLIC_GA_ID) {
        errorTracker.captureError(
          error instanceof Error
            ? error
            : new Error("Analytics initialization failed"),
          { type: "analytics_init" },
        );
      }
      // Still set as initialized to prevent repeated attempts
      setIsInitialized(true);
    }
  };

  const handleSetConsent = (consent: boolean) => {
    setConsentGiven(consent);
    localStorage.setItem("analytics-consent", consent.toString());

    if (consent && !isInitialized) {
      // Only initialize if GA_ID is configured
      if (process.env.NEXT_PUBLIC_GA_ID) {
        initializeAnalytics();
      } else {
        console.log("Analytics consent given but GA_ID not configured");
        setIsInitialized(true); // Set as initialized to prevent further attempts
      }
    } else {
      analytics.setConsent(consent);
    }
  };

  const trackPageView = (url: string, title?: string) => {
    if (consentGiven) {
      analytics.trackPageView(url, title);
    }
  };

  const trackEvent = (event: Parameters<typeof analytics.trackEvent>[0]) => {
    if (consentGiven) {
      analytics.trackEvent(event);
    }
  };

  const trackToolUsage = (
    toolName: string,
    action: string,
    details?: Record<string, unknown>,
  ) => {
    if (consentGiven) {
      analytics.trackToolUsage(toolName, action, details);
    }
  };

  const trackPortfolioInteraction = (portfolioId: string, action: string) => {
    if (consentGiven) {
      analytics.trackPortfolioInteraction(portfolioId, action);
    }
  };

  const trackDownload = (
    fileName: string,
    fileType: string,
    category: string,
  ) => {
    if (consentGiven) {
      analytics.trackDownload(fileName, fileType, category);
    }
  };

  const trackContactForm = (formType: string, success: boolean) => {
    if (consentGiven) {
      analytics.trackContactForm(formType, success);
    }
  };

  const trackSearch = (
    query: string,
    resultsCount: number,
    searchType: string,
  ) => {
    if (consentGiven) {
      analytics.trackSearch(query, resultsCount, searchType);
    }
  };

  const trackError = (error: Error, context?: string) => {
    // Error tracking doesn't require consent as it's for technical purposes
    errorTracker.captureError(error, context ? { type: context } : undefined);

    if (consentGiven) {
      analytics.trackError(error, context);
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
