import {
  getProductionConfig,
  ProductionConfig,
  validateProductionConfig,
} from "../production";

// Mock environment variables
const originalEnv = process.env;

describe("Production Config", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getProductionConfig", () => {
    it("should return development config when NODE_ENV is not production", () => {
      process.env.NODE_ENV = "development";

      const config = getProductionConfig();

      expect(config.security.csp.enabled).toBe(false);
      expect(config.security.hsts.enabled).toBe(false);
      expect(config.monitoring.sentry.tracesSampleRate).toBe(1.0);
    });

    it("should return production config when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";

      const config = getProductionConfig();

      expect(config.security.csp.enabled).toBe(true);
      expect(config.security.hsts.enabled).toBe(true);
      expect(config.monitoring.sentry.tracesSampleRate).toBe(0.1);
    });

    it("should use environment variables for API configuration", () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = "https://custom-api.com";

      const config = getProductionConfig();

      expect(config.api.baseUrl).toBe("https://custom-api.com");
    });

    it("should use default API base URL when not provided", () => {
      delete process.env.NEXT_PUBLIC_API_BASE_URL;

      const config = getProductionConfig();

      expect(config.api.baseUrl).toBe("https://yusuke-kim.com");
    });

    it("should configure Sentry when DSN is provided", () => {
      process.env.NODE_ENV = "production";
      process.env.SENTRY_DSN = "https://test@sentry.io/123";

      const config = getProductionConfig();

      expect(config.monitoring.sentry.enabled).toBe(true);
      expect(config.monitoring.sentry.dsn).toBe("https://test@sentry.io/123");
    });

    it("should disable Sentry when DSN is not provided", () => {
      process.env.NODE_ENV = "production";
      delete process.env.SENTRY_DSN;

      const config = getProductionConfig();

      expect(config.monitoring.sentry.enabled).toBe(false);
    });

    it("should configure Google Analytics when GA ID is provided", () => {
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_GA_ID = "GA-123456789";

      const config = getProductionConfig();

      expect(config.monitoring.analytics.enabled).toBe(true);
      expect(config.monitoring.analytics.gaId).toBe("GA-123456789");
    });

    it("should disable Google Analytics when GA ID is not provided", () => {
      process.env.NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_GA_ID;

      const config = getProductionConfig();

      expect(config.monitoring.analytics.enabled).toBe(false);
    });

    it("should configure CDN when URL is provided", () => {
      process.env.NODE_ENV = "production";
      process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
      process.env.NEXT_PUBLIC_IMAGES_CDN = "https://images.example.com";

      const config = getProductionConfig();

      expect(config.cdn.enabled).toBe(true);
      expect(config.cdn.baseUrl).toBe("https://cdn.example.com");
      expect(config.cdn.imagesUrl).toBe("https://images.example.com");
    });

    it("should disable CDN when URL is not provided", () => {
      process.env.NODE_ENV = "production";
      delete process.env.NEXT_PUBLIC_CDN_URL;

      const config = getProductionConfig();

      expect(config.cdn.enabled).toBe(false);
    });

    it("should parse cache TTL values from environment", () => {
      process.env.CACHE_TTL_STATIC = "86400";
      process.env.CACHE_TTL_CONTENT = "1800";
      process.env.CACHE_TTL_API = "600";

      const config = getProductionConfig();

      expect(config.cache.static).toBe(86400);
      expect(config.cache.content).toBe(1800);
      expect(config.cache.api).toBe(600);
    });

    it("should use default cache TTL values when not provided", () => {
      delete process.env.CACHE_TTL_STATIC;
      delete process.env.CACHE_TTL_CONTENT;
      delete process.env.CACHE_TTL_API;

      const config = getProductionConfig();

      expect(config.cache.static).toBe(31536000); // 1 year
      expect(config.cache.content).toBe(3600); // 1 hour
      expect(config.cache.api).toBe(300); // 5 minutes
    });

    it("should configure WebGL settings from environment", () => {
      process.env.NEXT_PUBLIC_WEBGL_DEBUG = "true";
      process.env.NEXT_PUBLIC_WEBGL_MAX_TEXTURE_SIZE = "4096";
      process.env.NEXT_PUBLIC_WEBGL_PERFORMANCE_MONITORING = "true";

      const config = getProductionConfig();

      expect(config.webgl.debug).toBe(true);
      expect(config.webgl.maxTextureSize).toBe(4096);
      expect(config.webgl.performanceMonitoring).toBe(true);
    });

    it("should use default WebGL settings when not provided", () => {
      delete process.env.NEXT_PUBLIC_WEBGL_DEBUG;
      delete process.env.NEXT_PUBLIC_WEBGL_MAX_TEXTURE_SIZE;
      delete process.env.NEXT_PUBLIC_WEBGL_PERFORMANCE_MONITORING;

      const config = getProductionConfig();

      expect(config.webgl.debug).toBe(false);
      expect(config.webgl.maxTextureSize).toBe(2048);
      expect(config.webgl.performanceMonitoring).toBe(false);
      expect(config.webgl.fallbackEnabled).toBe(true);
    });

    it("should configure Lighthouse CI when token is provided", () => {
      process.env.NODE_ENV = "production";
      process.env.LIGHTHOUSE_CI_TOKEN = "test-token";

      const config = getProductionConfig();

      expect(config.monitoring.performance.lighthouse).toBe(true);
    });

    it("should include Sentry origin in CSP connect-src when DSN is provided", () => {
      process.env.SENTRY_DSN = "https://abc123@o123456.ingest.sentry.io/123456";

      const config = getProductionConfig();

      expect(config.security.csp.directives["connect-src"]).toContain(
        "https://o123456.ingest.sentry.io",
      );
    });

    it("should filter out empty values from CSP directives", () => {
      delete process.env.SENTRY_DSN;

      const config = getProductionConfig();

      expect(config.security.csp.directives["connect-src"]).not.toContain("");
    });

    it("should have correct default API configuration", () => {
      const config = getProductionConfig();

      expect(config.api.timeout).toBe(10000);
      expect(config.api.retries).toBe(3);
    });

    it("should have correct security headers configuration", () => {
      const config = getProductionConfig();

      expect(config.security.xss.enabled).toBe(true);
      expect(config.security.xss.mode).toBe("block");
    });

    it("should have correct HSTS configuration", () => {
      process.env.NODE_ENV = "production";

      const config = getProductionConfig();

      expect(config.security.hsts.maxAge).toBe(31536000); // 1 year
      expect(config.security.hsts.includeSubDomains).toBe(true);
      expect(config.security.hsts.preload).toBe(true);
    });

    it("should have comprehensive CSP directives", () => {
      const config = getProductionConfig();

      expect(config.security.csp.directives["default-src"]).toContain("'self'");
      expect(config.security.csp.directives["object-src"]).toContain("'none'");
      expect(config.security.csp.directives["base-uri"]).toContain("'self'");
      expect(config.security.csp.directives["form-action"]).toContain("'self'");
      expect(config.security.csp.directives["frame-ancestors"]).toContain(
        "'none'",
      );
      expect(
        config.security.csp.directives["upgrade-insecure-requests"],
      ).toEqual([]);
    });
  });

  describe("validateProductionConfig", () => {
    let validConfig: ProductionConfig;

    beforeEach(() => {
      validConfig = {
        api: {
          baseUrl: "https://api.example.com",
          timeout: 10000,
          retries: 3,
        },
        security: {
          csp: {
            enabled: true,
            reportOnly: false,
            directives: {},
          },
          hsts: {
            enabled: true,
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          },
          xss: {
            enabled: true,
            mode: "block",
          },
        },
        cache: {
          static: 31536000,
          content: 3600,
          api: 300,
          webgl: 86400,
        },
        monitoring: {
          sentry: {
            enabled: false,
            environment: "production",
            tracesSampleRate: 0.1,
          },
          analytics: {
            enabled: false,
          },
          performance: {
            enabled: true,
            lighthouse: false,
            webVitals: true,
          },
        },
        webgl: {
          debug: false,
          maxTextureSize: 2048,
          performanceMonitoring: false,
          fallbackEnabled: true,
        },
        cdn: {
          enabled: false,
        },
      };
    });

    it("should return no errors for valid config", () => {
      const errors = validateProductionConfig(validConfig);
      expect(errors).toHaveLength(0);
    });

    it("should return error when Sentry is enabled but DSN is missing", () => {
      validConfig.monitoring.sentry.enabled = true;
      delete validConfig.monitoring.sentry.dsn;

      const errors = validateProductionConfig(validConfig);

      expect(errors).toContain(
        "Sentry DSN is required when Sentry monitoring is enabled",
      );
    });

    it("should not return error when Sentry is enabled and DSN is provided", () => {
      validConfig.monitoring.sentry.enabled = true;
      validConfig.monitoring.sentry.dsn = "https://test@sentry.io/123";

      const errors = validateProductionConfig(validConfig);

      expect(errors.filter((e) => e.includes("Sentry DSN"))).toHaveLength(0);
    });

    it("should return error when Analytics is enabled but GA ID is missing", () => {
      validConfig.monitoring.analytics.enabled = true;
      delete validConfig.monitoring.analytics.gaId;

      const errors = validateProductionConfig(validConfig);

      expect(errors).toContain(
        "Google Analytics ID is required when analytics is enabled",
      );
    });

    it("should not return error when Analytics is enabled and GA ID is provided", () => {
      validConfig.monitoring.analytics.enabled = true;
      validConfig.monitoring.analytics.gaId = "GA-123456789";

      const errors = validateProductionConfig(validConfig);

      expect(
        errors.filter((e) => e.includes("Google Analytics ID")),
      ).toHaveLength(0);
    });

    it("should return error when CDN is enabled but base URL is missing", () => {
      validConfig.cdn.enabled = true;
      delete validConfig.cdn.baseUrl;

      const errors = validateProductionConfig(validConfig);

      expect(errors).toContain("CDN base URL is required when CDN is enabled");
    });

    it("should not return error when CDN is enabled and base URL is provided", () => {
      validConfig.cdn.enabled = true;
      validConfig.cdn.baseUrl = "https://cdn.example.com";

      const errors = validateProductionConfig(validConfig);

      expect(errors.filter((e) => e.includes("CDN base URL"))).toHaveLength(0);
    });

    it("should return multiple errors when multiple validations fail", () => {
      validConfig.monitoring.sentry.enabled = true;
      delete validConfig.monitoring.sentry.dsn;
      validConfig.monitoring.analytics.enabled = true;
      delete validConfig.monitoring.analytics.gaId;
      validConfig.cdn.enabled = true;
      delete validConfig.cdn.baseUrl;

      const errors = validateProductionConfig(validConfig);

      expect(errors).toHaveLength(3);
      expect(errors).toContain(
        "Sentry DSN is required when Sentry monitoring is enabled",
      );
      expect(errors).toContain(
        "Google Analytics ID is required when analytics is enabled",
      );
      expect(errors).toContain("CDN base URL is required when CDN is enabled");
    });

    it("should not return errors when services are disabled", () => {
      validConfig.monitoring.sentry.enabled = false;
      validConfig.monitoring.analytics.enabled = false;
      validConfig.cdn.enabled = false;

      const errors = validateProductionConfig(validConfig);

      expect(errors).toHaveLength(0);
    });
  });
});
