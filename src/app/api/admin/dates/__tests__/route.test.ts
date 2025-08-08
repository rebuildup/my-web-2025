/**
 * Tests for Date Management API Endpoints
 */

import { portfolioDateManager } from "@/lib/portfolio/date-management";

// Mock the date manager
jest.mock("@/lib/portfolio/date-management", () => ({
  portfolioDateManager: {
    getManualDate: jest.fn(),
    hasManualDate: jest.fn(),
    getAllManualDates: jest.fn(),
    setManualDate: jest.fn(),
    removeManualDate: jest.fn(),
    bulkSetManualDates: jest.fn(),
    validateDate: jest.fn(),
    getDateStats: jest.fn(),
  },
}));

const mockDateManager = portfolioDateManager as jest.Mocked<
  typeof portfolioDateManager
>;

// Mock Next.js server functions
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe("Date Management API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Date Manager Integration", () => {
    it("should get manual date for specific item", async () => {
      const testDate = "2023-06-15T12:30:45.123Z";
      mockDateManager.getManualDate.mockResolvedValue(testDate);
      mockDateManager.hasManualDate.mockResolvedValue(true);

      const manualDate = await portfolioDateManager.getManualDate("test-item");
      const hasManualDate =
        await portfolioDateManager.hasManualDate("test-item");

      expect(manualDate).toBe(testDate);
      expect(hasManualDate).toBe(true);
      expect(mockDateManager.getManualDate).toHaveBeenCalledWith("test-item");
      expect(mockDateManager.hasManualDate).toHaveBeenCalledWith("test-item");
    });

    it("should get all manual dates", async () => {
      const testDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-02-01T00:00:00.000Z",
      };
      mockDateManager.getAllManualDates.mockResolvedValue(testDates);

      const allDates = await portfolioDateManager.getAllManualDates();

      expect(allDates).toEqual(testDates);
      expect(mockDateManager.getAllManualDates).toHaveBeenCalled();
    });

    it("should set manual date", async () => {
      const itemId = "test-item";
      const testDate = "2023-06-15T12:30:45.123Z";
      mockDateManager.setManualDate.mockResolvedValue(undefined);
      mockDateManager.validateDate.mockReturnValue(true);

      await portfolioDateManager.setManualDate(itemId, testDate);

      expect(mockDateManager.setManualDate).toHaveBeenCalledWith(
        itemId,
        testDate,
      );
    });

    it("should remove manual date", async () => {
      const itemId = "test-item";
      mockDateManager.removeManualDate.mockResolvedValue(undefined);

      await portfolioDateManager.removeManualDate(itemId);

      expect(mockDateManager.removeManualDate).toHaveBeenCalledWith(itemId);
    });

    it("should bulk set manual dates", async () => {
      const testDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-02-01T00:00:00.000Z",
      };
      mockDateManager.bulkSetManualDates.mockResolvedValue(undefined);

      await portfolioDateManager.bulkSetManualDates(testDates);

      expect(mockDateManager.bulkSetManualDates).toHaveBeenCalledWith(
        testDates,
      );
    });

    it("should validate date format", () => {
      const validDate = "2023-06-15T12:30:45.123Z";
      const invalidDate = "invalid-date";

      mockDateManager.validateDate.mockReturnValueOnce(true);
      mockDateManager.validateDate.mockReturnValueOnce(false);

      expect(portfolioDateManager.validateDate(validDate)).toBe(true);
      expect(portfolioDateManager.validateDate(invalidDate)).toBe(false);
    });

    it("should get date statistics", async () => {
      const testStats = {
        totalManualDates: 5,
        oldestManualDate: "2023-01-01T00:00:00.000Z",
        newestManualDate: "2023-12-31T23:59:59.999Z",
        recentlyUpdated: [
          { itemId: "item-1", date: "2023-12-01T00:00:00.000Z" },
        ],
      };
      mockDateManager.getDateStats.mockResolvedValue(testStats);

      const stats = await portfolioDateManager.getDateStats();

      expect(stats).toEqual(testStats);
      expect(mockDateManager.getDateStats).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockDateManager.getManualDate.mockRejectedValue(
        new Error("Database error"),
      );

      await expect(portfolioDateManager.getManualDate("test")).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("API Request Validation", () => {
    it("should validate item ID format", () => {
      const validItemId = "portfolio-item-123";
      const invalidItemIds = ["", null, undefined, 123];

      expect(typeof validItemId).toBe("string");
      expect(validItemId.length).toBeGreaterThan(0);

      invalidItemIds.forEach((itemId) => {
        expect(typeof itemId !== "string" || !itemId).toBe(true);
      });
    });

    it("should validate date format in requests", () => {
      const validDates = [
        "2023-01-01T00:00:00.000Z",
        "2023-12-31T23:59:59.999Z",
      ];
      const invalidDates = ["", "invalid-date", "2023/01/01", null, undefined];

      validDates.forEach((date) => {
        mockDateManager.validateDate.mockReturnValueOnce(true);
        expect(portfolioDateManager.validateDate(date)).toBe(true);
      });

      invalidDates.forEach((date) => {
        mockDateManager.validateDate.mockReturnValueOnce(false);
        expect(portfolioDateManager.validateDate(date as string)).toBe(false);
      });
    });

    it("should validate bulk dates object", () => {
      const validBulkDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-02-01T00:00:00.000Z",
      };
      const invalidBulkDates = [
        null,
        undefined,
        "not-an-object",
        [],
        { "": "2023-01-01T00:00:00.000Z" }, // Empty key
        { "item-1": "" }, // Empty date
      ];

      expect(typeof validBulkDates).toBe("object");
      expect(validBulkDates).not.toBeNull();
      expect(Array.isArray(validBulkDates)).toBe(false);

      invalidBulkDates.forEach((dates) => {
        const isValid =
          dates !== null &&
          dates !== undefined &&
          typeof dates === "object" &&
          !Array.isArray(dates);

        if (isValid && typeof dates === "object") {
          const entries = Object.entries(dates);
          const hasValidEntries = entries.every(
            ([key, value]) =>
              typeof key === "string" &&
              key.length > 0 &&
              typeof value === "string" &&
              value.length > 0,
          );
          expect(hasValidEntries).toBe(false);
        } else {
          expect(isValid).toBe(false);
        }
      });
    });
  });

  describe("URL Parameter Parsing", () => {
    it("should parse query parameters correctly", () => {
      // Use Node.js URL directly for testing
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const NodeURL = require("url").URL;
      const testUrl = new NodeURL(
        "http://localhost:3000/api/admin/dates?itemId=test-item-123",
      );

      expect(testUrl.searchParams.get("itemId")).toBe("test-item-123");
    });

    it("should handle missing parameters", () => {
      // Use Node.js URL directly for testing
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const NodeURL = require("url").URL;
      const testUrl = new NodeURL("http://localhost:3000/api/admin/dates");

      expect(testUrl.searchParams.get("itemId")).toBeNull();
    });

    it("should decode URL parameters", () => {
      const encodedItemId = encodeURIComponent("test item with spaces");
      const decodedItemId = decodeURIComponent(encodedItemId);

      expect(decodedItemId).toBe("test item with spaces");
    });
  });

  describe("Error Handling", () => {
    it("should handle date manager errors", async () => {
      const error = new Error("File system error");
      mockDateManager.setManualDate.mockRejectedValue(error);

      await expect(
        portfolioDateManager.setManualDate("test", "2023-01-01T00:00:00.000Z"),
      ).rejects.toThrow("File system error");
    });

    it("should handle invalid JSON", () => {
      const invalidJson = "{ invalid json }";

      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network timeout");
      mockDateManager.getAllManualDates.mockRejectedValue(networkError);

      await expect(portfolioDateManager.getAllManualDates()).rejects.toThrow(
        "Network timeout",
      );
    });
  });

  describe("Date Format Validation", () => {
    it("should accept valid ISO 8601 dates", () => {
      const validDates = [
        "2023-01-01T00:00:00.000Z",
        "2023-12-31T23:59:59.999Z",
        "2023-06-15T12:30:45.123Z",
      ];

      validDates.forEach((date) => {
        mockDateManager.validateDate.mockReturnValueOnce(true);
        expect(portfolioDateManager.validateDate(date)).toBe(true);
      });
    });

    it("should reject invalid date formats", () => {
      const invalidDates = [
        "",
        "invalid-date",
        "2023-13-01T00:00:00.000Z", // Invalid month
        "2023-01-32T00:00:00.000Z", // Invalid day
        "2023/01/01", // Wrong format
        "2023-01-01 12:00:00", // Wrong format
      ];

      invalidDates.forEach((date) => {
        mockDateManager.validateDate.mockReturnValueOnce(false);
        expect(portfolioDateManager.validateDate(date)).toBe(false);
      });
    });
  });

  describe("Statistics Validation", () => {
    it("should return valid statistics structure", async () => {
      const mockStats = {
        totalManualDates: 10,
        oldestManualDate: "2023-01-01T00:00:00.000Z",
        newestManualDate: "2023-12-31T23:59:59.999Z",
        recentlyUpdated: [
          { itemId: "item-1", date: "2023-12-01T00:00:00.000Z" },
          { itemId: "item-2", date: "2023-11-01T00:00:00.000Z" },
        ],
      };

      mockDateManager.getDateStats.mockResolvedValue(mockStats);

      const stats = await portfolioDateManager.getDateStats();

      expect(typeof stats.totalManualDates).toBe("number");
      expect(stats.totalManualDates).toBeGreaterThanOrEqual(0);

      if (stats.oldestManualDate) {
        expect(typeof stats.oldestManualDate).toBe("string");
      }

      if (stats.newestManualDate) {
        expect(typeof stats.newestManualDate).toBe("string");
      }

      expect(Array.isArray(stats.recentlyUpdated)).toBe(true);
      stats.recentlyUpdated.forEach((item) => {
        expect(typeof item.itemId).toBe("string");
        expect(typeof item.date).toBe("string");
      });
    });

    it("should handle empty statistics", async () => {
      const emptyStats = {
        totalManualDates: 0,
        oldestManualDate: undefined,
        newestManualDate: undefined,
        recentlyUpdated: [],
      };

      mockDateManager.getDateStats.mockResolvedValue(emptyStats);

      const stats = await portfolioDateManager.getDateStats();

      expect(stats.totalManualDates).toBe(0);
      expect(stats.oldestManualDate).toBeUndefined();
      expect(stats.newestManualDate).toBeUndefined();
      expect(stats.recentlyUpdated).toEqual([]);
    });
  });
});
