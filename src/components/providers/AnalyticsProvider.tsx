/**
 * Analytics Provider Component
 * Simple Google Analytics integration using gtag
 */

"use client";

import { errorTracker } from "@/lib/analytics/error-tracking";
import React, { createContext, useContext, useEffect, useState } from "react";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check for existing consent
    const savedConsent = localStorage.getItem("analytics-consent");

    if (savedConsent === "true") {
      setConsentGiven(true);
    } else if (savedConsent === "false") {
      setConsentGiven(false);
    }

    setIsInitialized(true);
  }, []);

  const handleSetConsent = (consent: boolean) => {
    setConsentGiven(consent);
    localStorage.setItem("analytics-consent", consent.toString());
  };

  const trackPageView = (url: string, title?: string) => {
    if (consentGiven && typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-Q3YWX96WRS", {
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
