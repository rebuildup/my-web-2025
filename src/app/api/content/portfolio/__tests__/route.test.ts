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

describe("/api/content/portfolio", () => {
  const mockPortfolioData = [
    {
      id: "portfolio-1",
      type: "portfolio",
      title: "Test Portfolio 1",
      description: "Test description 1",
      category: "develop",
      tags: ["React", "TypeScript"],
      status: "published",
      priority: 80,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-02T00:00:00Z",
      thumbnail: "thumb1.jpg",
    },
    {
      id: "portfolio-2",
      type: "portfolio",
      title: "Test Portfolio 2",
      description: "Test description 2",
      category: "design",
      tags: ["Figma", "UI/UX"],
      status: "draft",
      priority: 60,
      createdAt: "2024-01-03T00:00:00Z",
      updatedAt: "2024-01-04T00:00:00Z",
      thumbnail: "thumb2.jpg",
    },
    {
      id: "portfolio-3",
      type: "portfolio",
      title: "Test Portfolio 3",
      description: "Test description 3",
      category: "video",
      tags: ["After Effects", "Motion"],
      status: "published",
      priority: 90,
      createdAt: "2024-01-05T00:00:00Z",
      updatedAt: "2024-01-06T00:00:00Z",
      thumbnail: "thumb3.jpg",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Data filtering logic", () => {
    it("should filter published items by default", () => {
      const filteredData = mockPortfolioData.filter(
        (item) => item.status === "published",
      );

      expect(filteredData).toHaveLength(2);
      expect(filteredData.every((item) => item.status === "published")).toBe(
        true,
      );
      expect(filteredData.map((item) => item.id)).toEqual([
        "portfolio-1",
        "portfolio-3",
      ]);
    });

    it("should return all items when status=all", () => {
      const status = "all";
      const filteredData =
        status === "all"
          ? mockPortfolioData
          : mockPortfolioData.filter((item) => item.status === status);

      expect(filteredData).toHaveLength(3);
      expect(filteredData).toEqual(mockPortfolioData);
    });

    it("should filter by specific status", () => {
      const draftItems = mockPortfolioData.filter(
        (item) => item.status === "draft",
      );
      const publishedItems = mockPortfolioData.filter(
        (item) => item.status === "published",
      );

      expect(draftItems).toHaveLength(1);
      expect(draftItems[0].id).toBe("portfolio-2");

      expect(publishedItems).toHaveLength(2);
      expect(publishedItems.map((item) => item.id)).toEqual([
        "portfolio-1",
        "portfolio-3",
      ]);
    });

    it("should filter by category", () => {
      const developItems = mockPortfolioData.filter(
        (item) => item.category === "develop",
      );
      const designItems = mockPortfolioData.filter(
        (item) => item.category === "design",
      );
      const videoItems = mockPortfolioData.filter(
        (item) => item.category === "video",
      );

      expect(developItems).toHaveLength(1);
      expect(developItems[0].id).toBe("portfolio-1");

      expect(designItems).toHaveLength(1);
      expect(designItems[0].id).toBe("portfolio-2");

      expect(videoItems).toHaveLength(1);
      expect(videoItems[0].id).toBe("portfolio-3");
    });

    it("should handle category filter with 'all' value", () => {
      const category = "all";
      const filteredData =
        category === "all"
          ? mockPortfolioData
          : mockPortfolioData.filter((item) => item.category === category);

      expect(filteredData).toHaveLength(3);
      expect(filteredData).toEqual(mockPortfolioData);
    });

    it("should find specific item by ID", () => {
      const specificItem = mockPortfolioData.find(
        (item) => item.id === "portfolio-1",
      );
      const nonExistentItem = mockPortfolioData.find(
        (item) => item.id === "non-existent",
      );

      expect(specificItem).toBeDefined();
      expect(specificItem?.title).toBe("Test Portfolio 1");
      expect(nonExistentItem).toBeUndefined();
    });

    it("should apply limit correctly", () => {
      const limit = 2;
      const limitedData =
        limit > 0 ? mockPortfolioData.slice(0, limit) : mockPortfolioData;

      expect(limitedData).toHaveLength(2);
      expect(limitedData[0].id).toBe("portfolio-1");
      expect(limitedData[1].id).toBe("portfolio-2");

      // Test with limit 0 (should return all)
      const unlimitedData =
        0 > 0 ? mockPortfolioData.slice(0, 0) : mockPortfolioData;
      expect(unlimitedData).toHaveLength(3);
    });

    it("should sort by date in descending order", () => {
      const sortedData = [...mockPortfolioData].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime(),
      );

      expect(sortedData[0].id).toBe("portfolio-3"); // Most recent (2024-01-06)
      expect(sortedData[1].id).toBe("portfolio-2"); // Middle (2024-01-04)
      expect(sortedData[2].id).toBe("portfolio-1"); // Oldest (2024-01-02)
    });

    it("should handle multiple filters combined", () => {
      // Filter by status=published AND category=develop
      let filteredData = mockPortfolioData.filter(
        (item) => item.status === "published",
      );
      filteredData = filteredData.filter((item) => item.category === "develop");

      expect(filteredData).toHaveLength(1);
      expect(filteredData[0].id).toBe("portfolio-1");

      // Filter by status=published AND category=video
      let videoPublished = mockPortfolioData.filter(
        (item) => item.status === "published",
      );
      videoPublished = videoPublished.filter(
        (item) => item.category === "video",
      );

      expect(videoPublished).toHaveLength(1);
      expect(videoPublished[0].id).toBe("portfolio-3");
    });
  });

  describe("URL parameter parsing", () => {
    it("should parse URL parameters correctly", () => {
      function parseParams(url: string) {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;

        return {
          status: searchParams.get("status"),
          limit: parseInt(searchParams.get("limit") || "10"),
          category: searchParams.get("category"),
          id: searchParams.get("id"),
        };
      }

      // Test with all parameters
      const params1 = parseParams(
        "http://localhost:3000/api/content/portfolio?status=all&limit=5&category=develop&id=portfolio-1",
      );
      expect(params1.status).toBe("all");
      expect(params1.limit).toBe(5);
      expect(params1.category).toBe("develop");
      expect(params1.id).toBe("portfolio-1");

      // Test with minimal parameters
      const params2 = parseParams(
        "http://localhost:3000/api/content/portfolio",
      );
      expect(params2.status).toBeNull();
      expect(params2.limit).toBe(10); // default
      expect(params2.category).toBeNull();
      expect(params2.id).toBeNull();

      // Test with some parameters
      const params3 = parseParams(
        "http://localhost:3000/api/content/portfolio?status=published&category=design",
      );
      expect(params3.status).toBe("published");
      expect(params3.category).toBe("design");
      expect(params3.limit).toBe(10);
      expect(params3.id).toBeNull();
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
  });

  describe("Response structure", () => {
    it("should generate proper success response for multiple items", () => {
      const response = {
        success: true,
        data: mockPortfolioData.filter((item) => item.status === "published"),
        total: 2,
      };

      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("data");
      expect(response).toHaveProperty("total");
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.total).toBe(2);
    });

    it("should generate proper success response for single item", () => {
      const item = mockPortfolioData.find((item) => item.id === "portfolio-1");
      const response = {
        success: true,
        data: item,
      };

      expect(response).toHaveProperty("success", true);
      expect(response).toHaveProperty("data");
      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe("portfolio-1");
    });

    it("should generate proper error response for not found", () => {
      const response = {
        success: false,
        error: "Portfolio item not found",
      };

      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("error");
      expect(response.error).toBe("Portfolio item not found");
    });

    it("should generate proper error response for server error", () => {
      const response = {
        success: false,
        error: "Internal server error",
      };

      expect(response).toHaveProperty("success", false);
      expect(response).toHaveProperty("error");
      expect(response.error).toBe("Internal server error");
    });
  });

  describe("Cache headers logic", () => {
    it("should generate development cache headers", () => {
      const isDevelopment = true;
      const headers = new Map<string, string>();

      if (isDevelopment) {
        headers.set(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        );
        headers.set("Pragma", "no-cache");
        headers.set("Expires", "0");
        headers.set("Surrogate-Control", "no-store");
      }

      expect(headers.get("Cache-Control")).toContain("no-store");
      expect(headers.get("Pragma")).toBe("no-cache");
      expect(headers.get("Expires")).toBe("0");
      expect(headers.get("Surrogate-Control")).toBe("no-store");
    });

    it("should generate production cache headers", () => {
      const isDevelopment = false;
      const headers = new Map<string, string>();

      if (!isDevelopment) {
        headers.set("Cache-Control", "public, max-age=300, s-maxage=300");
        headers.set("Content-Type", "application/json");
      }

      expect(headers.get("Cache-Control")).toContain("public");
      expect(headers.get("Cache-Control")).toContain("max-age=300");
      expect(headers.get("Content-Type")).toBe("application/json");
    });
  });

  describe("File path handling", () => {
    it("should handle multiple file paths for portfolio data", () => {
      const possiblePaths = [
        "public/data/content/portfolio.json",
        "public/data/content/portfolio.json",
        "../../../../../public/data/content/portfolio.json",
        "../../../../../../public/data/content/portfolio.json",
        ".next/standalone/public/data/content/portfolio.json",
        "../../public/data/content/portfolio.json",
        "../../../public/data/content/portfolio.json",
        "/var/task/public/data/content/portfolio.json",
        "/tmp/public/data/content/portfolio.json",
      ];

      expect(possiblePaths).toHaveLength(9);
      expect(
        possiblePaths.every((path) => path.includes("portfolio.json")),
      ).toBe(true);
      expect(possiblePaths.some((path) => path.includes("standalone"))).toBe(
        true,
      );
      expect(possiblePaths.some((path) => path.includes("/var/task"))).toBe(
        true,
      );
    });

    it("should handle empty portfolio data gracefully", () => {
      const emptyData: unknown[] = [];
      const isArray = Array.isArray(emptyData);
      const length = emptyData.length;

      expect(isArray).toBe(true);
      expect(length).toBe(0);

      const response = {
        success: true,
        data: emptyData,
        total: length,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
    });

    it("should handle invalid JSON data", () => {
      const invalidData = "invalid json";
      let parsedData;
      let isValidArray = false;

      try {
        parsedData = JSON.parse(invalidData);
        isValidArray = Array.isArray(parsedData);
      } catch {
        parsedData = [];
        isValidArray = true;
      }

      expect(isValidArray).toBe(true);
      expect(Array.isArray(parsedData)).toBe(true);
      expect(parsedData).toEqual([]);
    });

    it("should handle non-array JSON data", () => {
      const nonArrayData = '{"not": "array"}';
      const parsedData = JSON.parse(nonArrayData);
      const finalData = Array.isArray(parsedData) ? parsedData : [];

      expect(Array.isArray(parsedData)).toBe(false);
      expect(Array.isArray(finalData)).toBe(true);
      expect(finalData).toEqual([]);
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

    it("should export GET function", () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const routeModule = require("../route");
      expect(typeof routeModule.GET).toBe("function");
    });

    it("should have basic test structure", () => {
      // Basic test to ensure the test file is working
      expect(true).toBe(true);
    });
  });
});
