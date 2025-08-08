/**
 * Tests for production initialization
 */

import * as productionConfig from "@/lib/config/production";
import * as performanceMonitoring from "@/lib/monitoring/performance";
import * as sentryMonitoring from "@/lib/monitoring/sentry";
import {
  checkProductionReadiness,
  getProductionStatus,
  initProduction,
} from "../production";

// Mock dependencies
jest.mock("@/lib/config/production");
jest.mock("@/lib/monitoring/performance");
jest.mock("@/lib/monitoring/sentry");

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

describe("production initialization", () => {
  const mockConfig = {
    monitoring: {
      sentry: { enabled: true, dsn: "test-dsn" },
      analytics: { enabled: true, gaId: "GA-TEST-123" },
      performance: { enabled: true },
    },
    security: {
      csp: { enabled: true },
      hsts: { enabled: true },
    },
    webgl: {
      debug: false,
      performanceMonitoring: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console
    Object.assign(console, mockConsole);

    // Setup default mocks
    (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
      mockConfig,
    );
    (productionConfig.validateProductionConfig as jest.Mock).mockReturnValue(
      [],
    );
    (performanceMonitoring.initWebVitals as jest.Mock).mockImplementation(
      () => {},
    );
    (performanceMonitoring.monitorPageLoad as jest.Mock).mockImplementation(
      () => {},
    );
    (performanceMonitoring.monitorMemoryUsage as jest.Mock).mockImplementation(
      () => {},
    );
    (sentryMonitoring.initSentry as jest.Mock).mockImplementation(() => {});

    // Reset environment variables
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NODE_ENV;
    delete process.env.NEXT_BUILD_TIME;
    delete process.env.npm_package_version;

    // Mock window and document
    (global as unknown as { window: unknown }).window = {
      addEventListener: jest.fn(),
      location: { href: "https://example.com" },
      dataLayer: [],
      PerformanceObserver: jest.fn(),
    };

    (global as unknown as { document: unknown }).document = {
      title: "Test Page",
      createElement: jest.fn(() => ({
        async: false,
        src: "",
      })),
      head: {
        appendChild: jest.fn(),
      },
    };
  });

  describe("initProduction", () => {
    it("should initialize production environment with all features enabled", () => {
      initProduction();

      expect(productionConfig.getProductionConfig).toHaveBeenCalled();
      expect(productionConfig.validateProductionConfig).toHaveBeenCalledWith(
        mockConfig,
      );
      expect(sentryMonitoring.initSentry).toHaveBeenCalled();
      expect(performanceMonitoring.initWebVitals).toHaveBeenCalled();
      expect(performanceMonitoring.monitorPageLoad).toHaveBeenCalled();
      expect(performanceMonitoring.monitorMemoryUsage).toHaveBeenCalled();
      expect(mockConsole.log).toHaveBeenCalledWith(
        "Production environment initialized",
        expect.objectContaining({
          monitoring: {
            sentry: true,
            analytics: true,
            performance: true,
          },
          security: {
            csp: true,
            hsts: true,
          },
          webgl: {
            debug: false,
            performanceMonitoring: true,
          },
        }),
      );
    });

    it("should handle configuration validation errors", () => {
      const validationErrors = ["Missing required config", "Invalid setting"];
      (productionConfig.validateProductionConfig as jest.Mock).mockReturnValue(
        validationErrors,
      );

      initProduction();

      expect(mockConsole.warn).toHaveBeenCalledWith(
        "Production configuration issues:",
        validationErrors,
      );
    });

    it("should skip disabled features", () => {
      const disabledConfig = {
        ...mockConfig,
        monitoring: {
          sentry: { enabled: false },
          analytics: { enabled: false },
          performance: { enabled: false },
        },
      };
      (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
        disabledConfig,
      );

      initProduction();

      expect(sentryMonitoring.initSentry).not.toHaveBeenCalled();
      expect(performanceMonitoring.initWebVitals).not.toHaveBeenCalled();
      expect(performanceMonitoring.monitorPageLoad).not.toHaveBeenCalled();
      expect(performanceMonitoring.monitorMemoryUsage).not.toHaveBeenCalled();
    });

    it("should handle server-side environment gracefully", () => {
      // Remove window object to simulate server-side
      (global as unknown as { window: unknown }).window = undefined;

      expect(() => initProduction()).not.toThrow();
    });
  });

  describe("checkProductionReadiness", () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    });

    it("should return ready when all requirements are met", () => {
      const result = checkProductionReadiness();

      expect(result.ready).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it("should identify missing environment variables", () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const result = checkProductionReadiness();

      expect(result.ready).toBe(false);
      expect(result.issues).toContain("NEXT_PUBLIC_SITE_URL is not set");
    });

    it("should identify missing Google Analytics configuration", () => {
      const configWithoutGA = {
        ...mockConfig,
        monitoring: {
          ...mockConfig.monitoring,
          analytics: { enabled: true, gaId: "" },
        },
      };
      (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
        configWithoutGA,
      );

      const result = checkProductionReadiness();

      expect(result.ready).toBe(false);
      expect(result.issues).toContain(
        "Google Analytics ID is required but not set",
      );
    });

    it("should identify missing Sentry configuration", () => {
      const configWithoutSentry = {
        ...mockConfig,
        monitoring: {
          ...mockConfig.monitoring,
          sentry: { enabled: true, dsn: "" },
        },
      };
      (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
        configWithoutSentry,
      );

      const result = checkProductionReadiness();

      expect(result.ready).toBe(false);
      expect(result.issues).toContain("Sentry DSN is required but not set");
    });

    it("should identify security warnings", () => {
      const insecureConfig = {
        ...mockConfig,
        security: {
          csp: { enabled: false },
          hsts: { enabled: false },
        },
      };
      (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
        insecureConfig,
      );

      const result = checkProductionReadiness();

      expect(result.warnings).toContain("Content Security Policy is disabled");
      expect(result.warnings).toContain("HSTS is disabled");
    });

    it("should identify WebGL debug mode warning", () => {
      const debugConfig = {
        ...mockConfig,
        webgl: {
          ...mockConfig.webgl,
          debug: true,
        },
      };
      (productionConfig.getProductionConfig as jest.Mock).mockReturnValue(
        debugConfig,
      );

      const result = checkProductionReadiness();

      expect(result.warnings).toContain(
        "WebGL debug mode is enabled in production",
      );
    });
  });

  describe("getProductionStatus", () => {
    it("should return current production status", () => {
      process.env.NODE_ENV = "production";
      process.env.NEXT_BUILD_TIME = "2023-01-01T00:00:00Z";
      process.env.npm_package_version = "1.0.0";

      const status = getProductionStatus();

      expect(status).toEqual({
        environment: "production",
        buildTime: "2023-01-01T00:00:00Z",
        version: "1.0.0",
        monitoring: {
          sentry: true,
          analytics: true,
          performance: true,
        },
        security: {
          csp: true,
          hsts: true,
        },
      });
    });

    it("should handle missing environment variables", () => {
      delete process.env.NODE_ENV;
      delete process.env.NEXT_BUILD_TIME;
      delete process.env.npm_package_version;

      const status = getProductionStatus();

      expect(status.environment).toBe("unknown");
      expect(status.buildTime).toBe("unknown");
      expect(status.version).toBe("unknown");
    });
  });
});
