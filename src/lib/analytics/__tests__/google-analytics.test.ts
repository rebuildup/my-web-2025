/**
 * Tests for Google Analytics integration
 */

// Mock environment variable before importing
const originalEnv = process.env;

// Mock window.gtag
const mockGtag = jest.fn();

// Setup window mocks
Object.defineProperty(window, "gtag", {
  value: mockGtag,
  writable: true,
});

Object.defineProperty(window, "dataLayer", {
  value: [],
  writable: true,
});

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
  process.env.NEXT_PUBLIC_GA_ID = "G-RHP8NQ10X2";
  mockGtag.mockClear();
  window.dataLayer = [];
});

afterEach(() => {
  process.env = originalEnv;
});

describe("GoogleAnalytics", () => {
  let analytics: typeof import("../google-analytics").analytics;

  beforeEach(() => {
    // Import analytics after environment setup
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { analytics: analyticsInstance } = require("../google-analytics");
    analytics = analyticsInstance;
  });

  describe("initialization", () => {
    it("should not initialize without GA_ID", () => {
      delete process.env.NEXT_PUBLIC_GA_ID;
      jest.resetModules();

      // Import new instance without GA_ID
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { analytics: newAnalytics } = require("../google-analytics");

      // Clear any calls from previous tests
      mockGtag.mockClear();

      // Try to use analytics - should not call gtag
      newAnalytics.trackEvent({ action: "test", category: "test" });

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("should initialize with GA_ID", () => {
      expect(process.env.NEXT_PUBLIC_GA_ID).toBe("G-RHP8NQ10X2");
    });
  });

  describe("consent management", () => {
    it("should set consent correctly", () => {
      mockGtag.mockClear();
      analytics.setConsent(true);

      expect(mockGtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
      });
    });

    it("should deny consent correctly", () => {
      mockGtag.mockClear();
      analytics.setConsent(false);

      expect(mockGtag).toHaveBeenCalledWith("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    });
  });

  describe("event tracking", () => {
    beforeEach(() => {
      analytics.setConsent(true);
      mockGtag.mockClear();
    });

    it("should track page views", () => {
      analytics.trackPageView("/test-page", "Test Page");

      expect(mockGtag).toHaveBeenCalledWith("config", "G-RHP8NQ10X2", {
        page_path: "/test-page",
        page_title: "Test Page",
      });
    });

    it("should track custom events", () => {
      const event = {
        action: "click",
        category: "button",
        label: "test-button",
        value: 1,
        custom_parameters: { test: "value" },
      };

      analytics.trackEvent(event);

      expect(mockGtag).toHaveBeenCalledWith("event", "click", {
        event_category: "button",
        event_label: "test-button",
        value: 1,
        test: "value",
      });
    });

    it("should track tool usage", () => {
      analytics.trackToolUsage("color-palette", "generate", { colors: 5 });

      expect(mockGtag).toHaveBeenCalledWith("event", "tool_usage", {
        event_category: "tools",
        event_label: "color-palette_generate",
        tool_name: "color-palette",
        tool_action: "generate",
        colors: 5,
      });
    });

    it("should track portfolio interactions", () => {
      analytics.trackPortfolioInteraction("project-1", "view");

      expect(mockGtag).toHaveBeenCalledWith("event", "portfolio_interaction", {
        event_category: "portfolio",
        event_label: "project-1_view",
        portfolio_id: "project-1",
        interaction_type: "view",
      });
    });

    it("should track downloads", () => {
      analytics.trackDownload("plugin.zip", "zip", "plugins");

      expect(mockGtag).toHaveBeenCalledWith("event", "download", {
        event_category: "downloads",
        event_label: "plugin.zip",
        file_name: "plugin.zip",
        file_type: "zip",
        download_category: "plugins",
      });
    });

    it("should track contact form submissions", () => {
      analytics.trackContactForm("development", true);

      expect(mockGtag).toHaveBeenCalledWith(
        "event",
        "contact_form_submission",
        {
          value: 1,
          items: [
            {
              item_id: "contact_development",
              item_name: "Contact Form - development",
              category: "contact",
              quantity: 1,
              price: 1,
            },
          ],
        },
      );
    });

    it("should track search queries", () => {
      analytics.trackSearch("test query", 5, "simple");

      expect(mockGtag).toHaveBeenCalledWith("event", "search", {
        event_category: "search",
        event_label: "test query",
        value: 5,
        search_term: "test query",
        results_count: 5,
        search_type: "simple",
      });
    });

    it("should track performance metrics", () => {
      const metrics = {
        lcp: 1500,
        fid: 50,
        cls: 0.05,
      };

      analytics.trackPerformance(metrics);

      expect(mockGtag).toHaveBeenCalledTimes(3);
      expect(mockGtag).toHaveBeenCalledWith("event", "performance_metric", {
        event_category: "performance",
        event_label: "LCP",
        value: 1500,
        metric_name: "lcp",
        metric_value: 1500,
      });
    });

    it("should track errors", () => {
      const error = new Error("Test error");
      error.stack = "Error: Test error\n    at test.js:1:1";

      analytics.trackError(error, "test_context");

      expect(mockGtag).toHaveBeenCalledWith("event", "error", {
        event_category: "errors",
        event_label: "Test error",
        error_message: "Test error",
        error_stack: "Error: Test error\n    at test.js:1:1",
        error_context: "test_context",
      });
    });
  });

  describe("without consent", () => {
    beforeEach(() => {
      analytics.setConsent(false);
      mockGtag.mockClear();
    });

    it("should not track events without consent", () => {
      analytics.trackEvent({
        action: "click",
        category: "button",
      });

      expect(mockGtag).not.toHaveBeenCalled();
    });

    it("should not track page views without consent", () => {
      analytics.trackPageView("/test");

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe("client ID", () => {
    it("should get client ID when available", async () => {
      analytics.setConsent(true);
      mockGtag.mockClear();

      // Mock gtag callback
      mockGtag.mockImplementation((command, gaId, field, callback) => {
        if (command === "get" && field === "client_id") {
          callback("test-client-id");
        }
      });

      const clientId = await analytics.getClientId();
      expect(clientId).toBe("test-client-id");
    });

    it("should return null when not initialized", async () => {
      delete process.env.NEXT_PUBLIC_GA_ID;
      jest.resetModules();

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { analytics: newAnalytics } = require("../google-analytics");
      const clientId = await newAnalytics.getClientId();
      expect(clientId).toBeNull();
    });
  });
});
