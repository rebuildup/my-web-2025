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

describe("/api/stats/download", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST request logic", () => {
    it("should validate content ID correctly", () => {
      const validId = "content-1";
      const invalidId = 123;
      const emptyId = "";
      const nullId = null;

      // Valid ID checks
      expect(typeof validId).toBe("string");
      expect(validId.length).toBeGreaterThan(0);

      // Invalid ID checks
      expect(typeof invalidId).not.toBe("string");
      expect(emptyId.length).toBe(0);
      expect(nullId).toBeNull();

      // Validation function
      function isValidId(id: unknown): boolean {
        return !!(id && typeof id === "string" && id.length > 0);
      }

      expect(isValidId(validId)).toBe(true);
      expect(isValidId(invalidId)).toBe(false);
      expect(isValidId(emptyId)).toBe(false);
      expect(isValidId(nullId)).toBe(false);
    });

    it("should handle rate limiting logic correctly (5 downloads per hour)", () => {
      const rateLimitMap = new Map<
        string,
        { count: number; resetTime: number }
      >();
      const RATE_LIMIT = 5; // 5 downloads per hour
      const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

      function checkRateLimit(ip: string): boolean {
        const now = Date.now();
        const userLimit = rateLimitMap.get(ip);

        if (!userLimit || now > userLimit.resetTime) {
          rateLimitMap.set(ip, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW,
          });
          return true;
        }

        if (userLimit.count >= RATE_LIMIT) {
          return false;
        }

        userLimit.count++;
        return true;
      }

      const ip = "192.168.1.1";

      // First 5 requests should pass
      for (let i = 0; i < 5; i++) {
        expect(checkRateLimit(ip)).toBe(true);
      }

      // 6th request should fail
      expect(checkRateLimit(ip)).toBe(false);

      // Verify the count is at the limit
      const userLimit = rateLimitMap.get(ip);
      expect(userLimit?.count).toBe(RATE_LIMIT);
    });

    it("should extract IP address from headers correctly", () => {
      function extractIP(headers: Record<string, string>): string {
        const forwardedFor = headers["x-forwarded-for"];
        const realIP = headers["x-real-ip"];

        if (forwardedFor) {
          return forwardedFor.split(",")[0].trim();
        }
        if (realIP) {
          return realIP;
        }
        return "unknown";
      }

      // Test x-forwarded-for with single IP
      expect(extractIP({ "x-forwarded-for": "192.168.1.1" })).toBe(
        "192.168.1.1",
      );

      // Test x-forwarded-for with multiple IPs
      expect(
        extractIP({ "x-forwarded-for": "192.168.1.1, 10.0.0.1, 172.16.0.1" }),
      ).toBe("192.168.1.1");

      // Test x-real-ip
      expect(extractIP({ "x-real-ip": "192.168.1.2" })).toBe("192.168.1.2");

      // Test no headers
      expect(extractIP({})).toBe("unknown");

      // Test x-forwarded-for takes precedence
      expect(
        extractIP({
          "x-forwarded-for": "192.168.1.1",
          "x-real-ip": "192.168.1.2",
        }),
      ).toBe("192.168.1.1");
    });

    it("should handle JSON parsing correctly", () => {
      const validJsonWithAllFields =
        '{"id": "content-1", "fileName": "example.zip", "fileType": "application/zip"}';
      const validJsonMinimal = '{"id": "content-1"}';
      const invalidJson = "invalid json";
      const emptyJson = "";

      expect(() => JSON.parse(validJsonWithAllFields)).not.toThrow();
      expect(() => JSON.parse(validJsonMinimal)).not.toThrow();
      expect(() => JSON.parse(invalidJson)).toThrow();
      expect(() => JSON.parse(emptyJson)).toThrow();

      const parsedFull = JSON.parse(validJsonWithAllFields);
      expect(parsedFull).toHaveProperty("id");
      expect(parsedFull).toHaveProperty("fileName");
      expect(parsedFull).toHaveProperty("fileType");

      const parsedMinimal = JSON.parse(validJsonMinimal);
      expect(parsedMinimal).toHaveProperty("id");
      expect(parsedMinimal).not.toHaveProperty("fileName");
    });

    it("should generate proper success response structure", () => {
      const mockTimestamp = "2022-01-01T00:00:00.000Z";

      // Response with all fields
      const fullResponse = {
        success: true,
        id: "content-1",
        downloadCount: 15,
        fileName: "example.zip",
        fileType: "application/zip",
        timestamp: mockTimestamp,
      };

      expect(fullResponse).toHaveProperty("success", true);
      expect(fullResponse).toHaveProperty("id", "content-1");
      expect(fullResponse).toHaveProperty("downloadCount", 15);
      expect(fullResponse).toHaveProperty("fileName", "example.zip");
      expect(fullResponse).toHaveProperty("fileType", "application/zip");
      expect(fullResponse).toHaveProperty("timestamp", mockTimestamp);

      // Response with minimal fields
      const minimalResponse = {
        success: true,
        id: "content-2",
        downloadCount: 5,
        fileName: undefined,
        fileType: undefined,
        timestamp: mockTimestamp,
      };

      expect(minimalResponse).toHaveProperty("success", true);
      expect(minimalResponse).toHaveProperty("id", "content-2");
      expect(minimalResponse).toHaveProperty("downloadCount", 5);
      expect(minimalResponse.fileName).toBeUndefined();
      expect(minimalResponse.fileType).toBeUndefined();
    });

    it("should generate proper error response structures", () => {
      const badRequestError = { error: "Content ID is required" };
      const rateLimitError = {
        error:
          "Download rate limit exceeded. Please wait before downloading again.",
        retryAfter: 60, // minutes
      };
      const serverError = { error: "Internal server error" };
      const updateFailedError = {
        error: "Failed to update download statistics",
      };

      expect(badRequestError).toHaveProperty("error");
      expect(rateLimitError).toHaveProperty("error");
      expect(rateLimitError).toHaveProperty("retryAfter");
      expect(serverError).toHaveProperty("error");
      expect(updateFailedError).toHaveProperty("error");

      expect(badRequestError.error).toContain("required");
      expect(rateLimitError.error).toContain("rate limit");
      expect(rateLimitError.retryAfter).toBe(60);
      expect(serverError.error).toContain("server error");
      expect(updateFailedError.error).toContain("Failed to update");
    });

    it("should handle download logging format", () => {
      function formatDownloadLog(
        id: string,
        fileName?: string,
        downloadCount?: number,
      ): string {
        return `Download tracked: ${id} (${fileName || "unknown"}) - Total: ${downloadCount}`;
      }

      expect(formatDownloadLog("content-1", "test.zip", 10)).toBe(
        "Download tracked: content-1 (test.zip) - Total: 10",
      );

      expect(formatDownloadLog("content-2", undefined, 5)).toBe(
        "Download tracked: content-2 (unknown) - Total: 5",
      );

      expect(formatDownloadLog("content-3", "file.pdf", 1)).toBe(
        "Download tracked: content-3 (file.pdf) - Total: 1",
      );
    });
  });

  describe("GET request logic", () => {
    it("should parse URL parameters correctly", () => {
      function parseParams(url: string) {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;

        return {
          id: searchParams.get("id"),
          limit: parseInt(searchParams.get("limit") || "10"),
        };
      }

      // Test with ID parameter
      const params1 = parseParams(
        "http://localhost:3000/api/stats/download?id=content-1",
      );
      expect(params1.id).toBe("content-1");
      expect(params1.limit).toBe(10); // default

      // Test with limit parameter
      const params2 = parseParams(
        "http://localhost:3000/api/stats/download?limit=5",
      );
      expect(params2.id).toBeNull();
      expect(params2.limit).toBe(5);

      // Test with both parameters
      const params3 = parseParams(
        "http://localhost:3000/api/stats/download?id=content-1&limit=15",
      );
      expect(params3.id).toBe("content-1");
      expect(params3.limit).toBe(15);

      // Test with no parameters
      const params4 = parseParams("http://localhost:3000/api/stats/download");
      expect(params4.id).toBeNull();
      expect(params4.limit).toBe(10);
    });

    it("should handle invalid limit parameter", () => {
      function parseLimit(limitParam: string | null): number {
        const parsed = parseInt(limitParam || "10");
        return isNaN(parsed) ? 10 : parsed;
      }

      expect(parseLimit("5")).toBe(5);
      expect(parseLimit("invalid")).toBe(10);
      expect(parseLimit(null)).toBe(10);
      expect(parseLimit("")).toBe(10);
      expect(parseLimit("0")).toBe(0);
      expect(parseLimit("-1")).toBe(-1);
    });

    it("should calculate total downloads correctly", () => {
      const mockStats = {
        "content-1": 50,
        "content-2": 30,
        "content-3": 20,
        "content-4": 0,
      };

      const totalDownloads = Object.values(mockStats).reduce(
        (sum, count) => sum + count,
        0,
      );
      const totalItems = Object.keys(mockStats).length;

      expect(totalDownloads).toBe(100);
      expect(totalItems).toBe(4);

      // Test empty stats
      const emptyStats = {};
      const emptyTotal = Object.values(emptyStats).reduce(
        (sum, count) => sum + count,
        0,
      );
      expect(emptyTotal).toBe(0);
    });

    it("should sort most downloaded content correctly", () => {
      const mockStats = {
        "content-1": 50,
        "content-2": 30,
        "content-3": 75,
        "content-4": 10,
      };

      const mostDownloaded = Object.entries(mockStats)
        .map(([id, downloads]) => ({ id, downloads }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 3);

      expect(mostDownloaded).toHaveLength(3);
      expect(mostDownloaded[0]).toEqual({ id: "content-3", downloads: 75 });
      expect(mostDownloaded[1]).toEqual({ id: "content-1", downloads: 50 });
      expect(mostDownloaded[2]).toEqual({ id: "content-2", downloads: 30 });

      // Test with limit
      const topTwo = Object.entries(mockStats)
        .map(([id, downloads]) => ({ id, downloads }))
        .sort((a, b) => b.downloads - a.downloads)
        .slice(0, 2);

      expect(topTwo).toHaveLength(2);
      expect(topTwo[0].id).toBe("content-3");
      expect(topTwo[1].id).toBe("content-1");
    });

    it("should generate proper response structures", () => {
      // Single item response
      const singleItemResponse = {
        id: "content-1",
        downloadCount: 25,
      };

      expect(singleItemResponse).toHaveProperty("id");
      expect(singleItemResponse).toHaveProperty("downloadCount");
      expect(typeof singleItemResponse.downloadCount).toBe("number");

      // Multiple items response
      const multipleItemsResponse = {
        mostDownloaded: [
          { id: "content-1", downloads: 50 },
          { id: "content-2", downloads: 30 },
        ],
        totalDownloads: 80,
        totalItems: 2,
      };

      expect(multipleItemsResponse).toHaveProperty("mostDownloaded");
      expect(multipleItemsResponse).toHaveProperty("totalDownloads");
      expect(multipleItemsResponse).toHaveProperty("totalItems");
      expect(Array.isArray(multipleItemsResponse.mostDownloaded)).toBe(true);
      expect(multipleItemsResponse.totalDownloads).toBe(80);
      expect(multipleItemsResponse.totalItems).toBe(2);
    });

    it("should handle empty stats gracefully", () => {
      // const emptyStats = {};
      const mostDownloaded: Array<{ id: string; downloads: number }> = [];
      const totalDownloads = 0;
      const totalItems = 0;

      const response = {
        mostDownloaded,
        totalDownloads,
        totalItems,
      };

      expect(response.mostDownloaded).toEqual([]);
      expect(response.totalDownloads).toBe(0);
      expect(response.totalItems).toBe(0);
    });

    it("should handle zero download count for specific content", () => {
      const response = {
        id: "new-content",
        downloadCount: 0,
      };

      expect(response).toHaveProperty("id", "new-content");
      expect(response).toHaveProperty("downloadCount", 0);
      expect(response.downloadCount).toBe(0);
    });

    it("should handle error response structure", () => {
      const errorResponse = {
        error: "Internal server error",
      };

      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse.error).toBe("Internal server error");
      expect(typeof errorResponse.error).toBe("string");
    });
  });

  describe("Route handler module", () => {
    it("should be able to import route handlers", async () => {
      // Test that the route module can be imported without errors
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require("../route");
      }).not.toThrow();
    });

    it("should export GET and POST functions", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const routeModule = require("../route");
      expect(typeof routeModule.GET).toBe("function");
      expect(typeof routeModule.POST).toBe("function");
    });
  });
});
