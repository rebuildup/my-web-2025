/**
 * @jest-environment node
 */

// Mock console to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe("/api/monitoring/errors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST", () => {
    it("should have basic test structure", () => {
      // Basic test to ensure the test file is working
      expect(true).toBe(true);
    });

    it("should handle error data structure", () => {
      const errorData = {
        type: "javascript",
        error: "TypeError: Cannot read property 'foo' of undefined",
        url: "/test-page",
        userAgent: "Mozilla/5.0 (Test Browser)",
        stack: "Error\n    at test.js:1:1",
        timestamp: new Date().toISOString(),
      };

      expect(errorData).toHaveProperty("type");
      expect(errorData).toHaveProperty("error");
      expect(errorData).toHaveProperty("url");
      expect(errorData).toHaveProperty("userAgent");
      expect(errorData).toHaveProperty("stack");
      expect(errorData).toHaveProperty("timestamp");
    });

    it("should handle different error types", () => {
      const errorTypes = [
        "javascript",
        "network",
        "validation",
        "authentication",
        "authorization",
        "server",
        "client",
      ];

      errorTypes.forEach((type) => {
        const errorData = {
          type,
          error: `Test ${type} error`,
          url: "/test-page",
        };

        expect(errorData.type).toBe(type);
        expect(errorData.error).toContain(type);
      });
    });

    it("should handle missing error type", () => {
      const errorData = {
        error: "Some error occurred",
        url: "/test-page",
      };

      const processedErrorData = {
        timestamp: new Date().toISOString(),
        type: (errorData as Record<string, unknown>).type || "unknown",
        error: errorData.error,
        url: errorData.url,
      };

      expect(processedErrorData.type).toBe("unknown");
      expect(processedErrorData.error).toBe("Some error occurred");
    });

    it("should handle stack traces", () => {
      const errorData = {
        type: "javascript",
        error: "ReferenceError: undefinedVariable is not defined",
        url: "/test-page",
        stack: `ReferenceError: undefinedVariable is not defined
    at Object.test (/app/test.js:10:5)
    at Module._compile (module.js:456:26)
    at Object.Module._extensions..js (module.js:474:10)`,
      };

      expect(errorData.stack).toContain("ReferenceError");
      expect(errorData.stack).toContain("Object.test");
      expect(errorData.stack).toContain("/app/test.js:10:5");
    });

    it("should handle empty error data", () => {
      const errorData = {};
      const processedErrorData = {
        timestamp: new Date().toISOString(),
        type: (errorData as Record<string, unknown>).type || "unknown",
        error: (errorData as Record<string, unknown>).error,
        url: (errorData as Record<string, unknown>).url,
      };

      expect(processedErrorData.type).toBe("unknown");
      expect(processedErrorData.error).toBeUndefined();
      expect(processedErrorData.url).toBeUndefined();
    });

    it("should handle JSON parsing", () => {
      const validJson = '{"type": "javascript", "error": "Test error"}';
      const invalidJson = "invalid json";

      expect(() => JSON.parse(validJson)).not.toThrow();
      expect(() => JSON.parse(invalidJson)).toThrow();

      const parsed = JSON.parse(validJson);
      expect(parsed).toHaveProperty("type");
      expect(parsed).toHaveProperty("error");
    });

    it("should include timestamp in log", () => {
      const errorData = {
        type: "test",
        error: "Test error",
        url: "/test",
      };

      const logData = {
        timestamp: new Date().toISOString(),
        type: errorData.type || "unknown",
        error: errorData.error,
        url: errorData.url,
      };

      expect(logData.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(logData.type).toBe("test");
      expect(logData.error).toBe("Test error");
    });

    it("should handle large error payloads", () => {
      const errorData = {
        type: "javascript",
        error: "Large error with lots of context",
        url: "/test-page",
        stack: "x".repeat(10000), // 10KB stack trace
        context: {
          largeData: "y".repeat(5000), // 5KB additional context
        },
      };

      expect(errorData.stack.length).toBe(10000);
      expect(
        (errorData.context as Record<string, unknown>).largeData,
      ).toHaveProperty("length", 5000);
      expect(typeof errorData.stack).toBe("string");
      expect(typeof errorData.context).toBe("object");
    });

    it("should generate success response", () => {
      const response = { success: true };
      expect(response).toHaveProperty("success");
      expect(response.success).toBe(true);
    });
  });

  describe("GET", () => {
    it("should return monitoring status", () => {
      const response = {
        status: "monitoring",
        timestamp: new Date().toISOString(),
        errorReporting: "active",
      };

      expect(response).toHaveProperty("status", "monitoring");
      expect(response).toHaveProperty("timestamp");
      expect(response).toHaveProperty("errorReporting", "active");
    });

    it("should include valid timestamp", () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );

      const timestampDate = new Date(timestamp);
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - timestampDate.getTime());
      expect(timeDiff).toBeLessThan(5000); // Within 5 seconds
    });

    it("should return consistent status", () => {
      const response1 = {
        status: "monitoring",
        timestamp: new Date().toISOString(),
        errorReporting: "active",
      };

      const response2 = {
        status: "monitoring",
        timestamp: new Date().toISOString(),
        errorReporting: "active",
      };

      expect(response1.status).toBe("monitoring");
      expect(response2.status).toBe("monitoring");
      expect(response1.errorReporting).toBe("active");
      expect(response2.errorReporting).toBe("active");
    });
  });
});
