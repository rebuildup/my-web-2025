/**
 * Google Analytics 4 integration with privacy compliance
 * Implements custom event tracking for user interactions
 */

// Global gtag function is already declared in GoogleAnalytics.tsx

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

export interface ConversionEvent {
  event_name: string;
  currency?: string;
  value?: number;
  transaction_id?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity?: number;
    price?: number;
  }>;
}

class GoogleAnalytics {
  private isInitialized = false;
  private consentGiven = false;
  private readonly GA_ID = process.env.NEXT_PUBLIC_GA_ID;

  constructor() {
    // 開発環境では何もしない
    if (process.env.NODE_ENV === "development") {
      console.log("Google Analytics disabled in development environment");
      return;
    }

    if (typeof window !== "undefined") {
      if (this.GA_ID) {
        this.initializeGA();
      } else {
        console.log("Google Analytics disabled - GA_ID not configured");
      }
    }
  }

  /**
   * Initialize Google Analytics with privacy compliance
   */
  private initializeGA(): void {
    if (!this.GA_ID || this.isInitialized) return;

    // 開発環境では何もしない
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: GA initialization skipped");
      this.isInitialized = true;
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Only set gtag if it doesn't exist (for testing)
    if (!window.gtag) {
      window.gtag = function (...args: unknown[]) {
        window.dataLayer!.push(args);
      };
    }

    // Configure GA with privacy settings
    window.gtag!("js", new Date());
    window.gtag!("config", this.GA_ID, {
      page_title: typeof document !== "undefined" ? document.title : "",
      page_location: typeof window !== "undefined" ? window.location.href : "",
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: "SameSite=Strict;Secure",
    });

    this.isInitialized = true;
  }

  /**
   * Load GA script dynamically
   */
  loadScript(): Promise<void> {
    return new Promise((resolve) => {
      // 開発環境では常にresolve
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: GA script load skipped");
        resolve();
        return;
      }

      // Production behavior
      if (!this.GA_ID) {
        console.error("GA_ID not configured in production");
        resolve(); // Still resolve to prevent app crashes
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.GA_ID}`;
      script.onload = () => resolve();
      script.onerror = () => {
        console.error("Failed to load GA script");
        resolve(); // Resolve instead of reject to prevent app crashes
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Set user consent for analytics
   */
  setConsent(consent: boolean): void {
    this.consentGiven = consent;

    // 開発環境では何もしない
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: GA consent set to", consent);
      return;
    }

    // Only call gtag if GA_ID is configured and gtag exists
    if (this.GA_ID && typeof window !== "undefined" && window.gtag) {
      (window.gtag as (...args: unknown[]) => void)("consent", "update", {
        analytics_storage: consent ? "granted" : "denied",
        ad_storage: "denied", // Always deny ad storage for privacy
      });
    } else {
      console.log("GA consent set:", consent, "but GA not initialized");
    }
  }

  /**
   * Track page view
   */
  trackPageView(url: string, title?: string): void {
    if (!this.GA_ID || !this.consentGiven || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development" && !this.GA_ID) {
        console.log("GA tracking (page view):", { url, title });
      }
      return;
    }

    if (!this.isInitialized) {
      this.initializeGA();
    }

    window.gtag!("config", this.GA_ID!, {
      page_path: url,
      page_title:
        title || (typeof document !== "undefined" ? document.title : ""),
    });
  }

  /**
   * Track custom event
   */
  trackEvent(event: GAEvent): void {
    if (!this.GA_ID || !this.consentGiven || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development" && !this.GA_ID) {
        console.log("GA tracking (event):", event);
      }
      return;
    }

    if (!this.isInitialized) {
      this.initializeGA();
    }

    window.gtag!("event", event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(event: ConversionEvent): void {
    if (!this.GA_ID || !this.consentGiven || typeof window === "undefined") {
      if (process.env.NODE_ENV === "development" && !this.GA_ID) {
        console.log("GA tracking (conversion):", event);
      }
      return;
    }

    if (!this.isInitialized) {
      this.initializeGA();
    }

    window.gtag!("event", event.event_name, {
      currency: event.currency,
      value: event.value,
      transaction_id: event.transaction_id,
      items: event.items,
    });
  }

  /**
   * Track tool usage
   */
  trackToolUsage(
    toolName: string,
    action: string,
    details?: Record<string, unknown>,
  ): void {
    this.trackEvent({
      action: "tool_usage",
      category: "tools",
      label: `${toolName}_${action}`,
      custom_parameters: {
        tool_name: toolName,
        tool_action: action,
        ...details,
      },
    });
  }

  /**
   * Track portfolio interaction
   */
  trackPortfolioInteraction(portfolioId: string, action: string): void {
    this.trackEvent({
      action: "portfolio_interaction",
      category: "portfolio",
      label: `${portfolioId}_${action}`,
      custom_parameters: {
        portfolio_id: portfolioId,
        interaction_type: action,
      },
    });
  }

  /**
   * Track download
   */
  trackDownload(fileName: string, fileType: string, category: string): void {
    this.trackEvent({
      action: "download",
      category: "downloads",
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
        download_category: category,
      },
    });
  }

  /**
   * Track contact form submission
   */
  trackContactForm(formType: string, success: boolean): void {
    this.trackConversion({
      event_name: "contact_form_submission",
      value: success ? 1 : 0,
      items: [
        {
          item_id: `contact_${formType}`,
          item_name: `Contact Form - ${formType}`,
          category: "contact",
          quantity: 1,
          price: success ? 1 : 0,
        },
      ],
    });
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultsCount: number, searchType: string): void {
    this.trackEvent({
      action: "search",
      category: "search",
      label: query,
      value: resultsCount,
      custom_parameters: {
        search_term: query,
        results_count: resultsCount,
        search_type: searchType,
      },
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metrics: {
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        this.trackEvent({
          action: "performance_metric",
          category: "performance",
          label: metric.toUpperCase(),
          value: Math.round(value),
          custom_parameters: {
            metric_name: metric,
            metric_value: value,
          },
        });
      }
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      action: "error",
      category: "errors",
      label: error.message,
      custom_parameters: {
        error_message: error.message,
        error_stack: error.stack?.substring(0, 500), // Limit stack trace length
        error_context: context,
      },
    });
  }

  /**
   * Get client ID for advanced tracking
   */
  getClientId(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.GA_ID || typeof window === "undefined") {
        resolve(null);
        return;
      }

      if (!this.isInitialized) {
        this.initializeGA();
      }

      (window.gtag as (...args: unknown[]) => void)(
        "get",
        this.GA_ID!,
        "client_id",
        (clientId: string) => {
          resolve(clientId);
        },
      );
    });
  }
}

// Export singleton instance
export const analytics = new GoogleAnalytics();

// Convenience functions for common tracking
export const trackPageView = (url: string, title?: string) =>
  analytics.trackPageView(url, title);
export const trackEvent = (event: GAEvent) => analytics.trackEvent(event);
export const trackToolUsage = (
  toolName: string,
  action: string,
  details?: Record<string, unknown>,
) => analytics.trackToolUsage(toolName, action, details);
export const trackPortfolioInteraction = (
  portfolioId: string,
  action: string,
) => analytics.trackPortfolioInteraction(portfolioId, action);
export const trackDownload = (
  fileName: string,
  fileType: string,
  category: string,
) => analytics.trackDownload(fileName, fileType, category);
export const trackContactForm = (formType: string, success: boolean) =>
  analytics.trackContactForm(formType, success);
export const trackSearch = (
  query: string,
  resultsCount: number,
  searchType: string,
) => analytics.trackSearch(query, resultsCount, searchType);
export const trackPerformance = (
  metrics: Parameters<typeof analytics.trackPerformance>[0],
) => analytics.trackPerformance(metrics);
export const trackError = (error: Error, context?: string) =>
  analytics.trackError(error, context);
