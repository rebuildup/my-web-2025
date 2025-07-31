/**
 * Tests for Date Management System
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import { promises as fs } from "fs";
import { PortfolioDateManager, createDateManager } from "../date-management";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("PortfolioDateManager", () => {
  let dateManager: PortfolioDateManager;
  const testDataPath = "/test/dates.json";

  beforeEach(() => {
    jest.clearAllMocks();
    dateManager = createDateManager(testDataPath);
    dateManager.resetCache();
  });

  describe("Date Validation", () => {
    it("should validate correct ISO 8601 date strings", () => {
      const validDates = [
        "2023-01-01T00:00:00.000Z",
        "2023-12-31T23:59:59.999Z",
        "2023-06-15T12:30:45.123Z",
      ];

      validDates.forEach((date) => {
        expect(dateManager.validateDate(date)).toBe(true);
      });
    });

    it("should reject invalid date strings", () => {
      const invalidDates = [
        "",
        "invalid-date",
        "2023-13-01", // Invalid month
        "2023-01-32", // Invalid day
        "2023/01/01", // Wrong format
        "2023-01-01 12:00:00", // Wrong format
        null,
        undefined,
        123,
      ];

      invalidDates.forEach((date) => {
        expect(dateManager.validateDate(date as string)).toBe(false);
      });
    });
  });

  describe("Date Formatting", () => {
    it("should format date for display", () => {
      const testDate = "2023-06-15T12:30:45.123Z";
      const formatted = dateManager.formatDateForDisplay(testDate);

      // Should be in Japanese format (YYYY/MM/DD)
      expect(formatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it("should format Date object for storage", () => {
      const testDate = new Date("2023-06-15T12:30:45.123Z");
      const formatted = dateManager.formatDateForStorage(testDate);

      expect(formatted).toBe("2023-06-15T12:30:45.123Z");
    });

    it("should handle invalid dates in formatting", () => {
      expect(dateManager.formatDateForDisplay("invalid")).toBe("Invalid Date");
      expect(() =>
        dateManager.formatDateForStorage(new Date("invalid")),
      ).toThrow();
    });

    it("should convert date to different formats", () => {
      const testDate = "2023-06-15T12:30:45.123Z";

      expect(dateManager.convertDateFormat(testDate, "iso")).toBe(testDate);
      expect(dateManager.convertDateFormat(testDate, "display")).toMatch(
        /^\d{4}\/\d{2}\/\d{2}$/,
      );
      expect(dateManager.convertDateFormat(testDate, "short")).toMatch(
        /^\d{2}\/\d{2}\/\d{2}$/,
      );
      expect(dateManager.convertDateFormat(testDate, "long")).toContain("2023");
    });
  });

  describe("Manual Date Management", () => {
    beforeEach(() => {
      // Mock successful file operations
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" }); // File doesn't exist initially
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should set manual date for an item", async () => {
      const itemId = "test-item-1";
      const testDate = "2023-06-15T12:30:45.123Z";

      await dateManager.setManualDate(itemId, testDate);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining(testDate),
        "utf-8",
      );
    });

    it("should reject invalid item ID or date", async () => {
      await expect(
        dateManager.setManualDate("", "2023-01-01T00:00:00.000Z"),
      ).rejects.toThrow();
      await expect(
        dateManager.setManualDate("test", "invalid-date"),
      ).rejects.toThrow();
    });

    it("should get manual date for an item", async () => {
      const itemId = "test-item-1";
      const testDate = "2023-06-15T12:30:45.123Z";

      // Mock file read with existing data
      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          itemDates: { [itemId]: testDate },
          lastUpdated: new Date().toISOString(),
        }),
      );

      const result = await dateManager.getManualDate(itemId);
      expect(result).toBe(testDate);
    });

    it("should return null for non-existent manual date", async () => {
      const result = await dateManager.getManualDate("non-existent");
      expect(result).toBeNull();
    });

    it("should remove manual date", async () => {
      const itemId = "test-item-1";
      const testDate = "2023-06-15T12:30:45.123Z";

      // First set a date
      await dateManager.setManualDate(itemId, testDate);

      // Then remove it
      await dateManager.removeManualDate(itemId);

      expect(mockFs.writeFile).toHaveBeenCalledTimes(2); // Once for set, once for remove
    });

    it("should check if item has manual date", async () => {
      const itemId = "test-item-1";
      const testDate = "2023-06-15T12:30:45.123Z";

      // Mock file read with existing data
      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          itemDates: { [itemId]: testDate },
          lastUpdated: new Date().toISOString(),
        }),
      );

      const hasDate = await dateManager.hasManualDate(itemId);
      expect(hasDate).toBe(true);

      const hasNoDate = await dateManager.hasManualDate("non-existent");
      expect(hasNoDate).toBe(false);
    });
  });

  describe("Effective Date Calculation", () => {
    const mockItem: EnhancedContentItem = {
      id: "test-item",
      title: "Test Item",
      description: "Test description",
      categories: ["develop"],
      tags: [],
      images: [],
      thumbnail: "",
      createdAt: "2023-01-01T00:00:00.000Z",
      updatedAt: "2023-01-01T00:00:00.000Z",
      status: "published",
    };

    it("should return manual date when useManualDate is true and manualDate is set", () => {
      const itemWithManualDate: EnhancedContentItem = {
        ...mockItem,
        useManualDate: true,
        manualDate: "2023-06-15T12:30:45.123Z",
      };

      const effectiveDate = dateManager.getEffectiveDate(itemWithManualDate);
      expect(effectiveDate.toISOString()).toBe("2023-06-15T12:30:45.123Z");
    });

    it("should return creation date when manual date is not set", () => {
      const effectiveDate = dateManager.getEffectiveDate(mockItem);
      expect(effectiveDate.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should return creation date when useManualDate is false", () => {
      const itemWithDisabledManualDate: EnhancedContentItem = {
        ...mockItem,
        useManualDate: false,
        manualDate: "2023-06-15T12:30:45.123Z",
      };

      const effectiveDate = dateManager.getEffectiveDate(
        itemWithDisabledManualDate,
      );
      expect(effectiveDate.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should handle invalid manual dates gracefully", () => {
      const itemWithInvalidManualDate: EnhancedContentItem = {
        ...mockItem,
        useManualDate: true,
        manualDate: "invalid-date",
      };

      const effectiveDate = dateManager.getEffectiveDate(
        itemWithInvalidManualDate,
      );
      expect(effectiveDate.toISOString()).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should throw error for missing item", () => {
      expect(() =>
        dateManager.getEffectiveDate(null as unknown as EnhancedContentItem),
      ).toThrow();
    });
  });

  describe("Bulk Operations", () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should bulk set manual dates", async () => {
      const dates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-02-01T00:00:00.000Z",
        "item-3": "2023-03-01T00:00:00.000Z",
      };

      await dateManager.bulkSetManualDates(dates);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining("item-1"),
        "utf-8",
      );
    });

    it("should validate all dates in bulk operation", async () => {
      const invalidDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "invalid-date",
      };

      await expect(
        dateManager.bulkSetManualDates(invalidDates),
      ).rejects.toThrow();
    });

    it("should get all manual dates", async () => {
      const testDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-02-01T00:00:00.000Z",
      };

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          itemDates: testDates,
          lastUpdated: new Date().toISOString(),
        }),
      );

      const result = await dateManager.getAllManualDates();
      expect(result).toEqual(testDates);
    });
  });

  describe("Date Parsing", () => {
    it("should parse and format various date inputs", () => {
      const testDate = new Date("2023-06-15T12:30:45.123Z");
      const dateString = "2023-06-15T12:30:45.123Z";

      expect(dateManager.parseAndFormatDate(testDate)).toBe(
        "2023-06-15T12:30:45.123Z",
      );
      expect(dateManager.parseAndFormatDate(dateString)).toBe(
        "2023-06-15T12:30:45.123Z",
      );
    });

    it("should handle invalid date inputs", () => {
      expect(() => dateManager.parseAndFormatDate("invalid")).toThrow();
      expect(() =>
        dateManager.parseAndFormatDate(123 as unknown as string),
      ).toThrow();
    });
  });

  describe("Statistics", () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should get date statistics", async () => {
      const testDates = {
        "item-1": "2023-01-01T00:00:00.000Z",
        "item-2": "2023-06-15T12:30:45.123Z",
        "item-3": "2023-12-31T23:59:59.999Z",
      };

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          itemDates: testDates,
          lastUpdated: new Date().toISOString(),
        }),
      );

      const stats = await dateManager.getDateStats();

      expect(stats.totalManualDates).toBe(3);
      expect(stats.oldestManualDate).toBe("2023-01-01T00:00:00.000Z");
      expect(stats.newestManualDate).toBe("2023-12-31T23:59:59.999Z");
      expect(Array.isArray(stats.recentlyUpdated)).toBe(true);
    });

    it("should handle empty statistics", async () => {
      // Reset the date manager cache first
      dateManager.resetCache();

      // Mock empty file read
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      const stats = await dateManager.getDateStats();

      expect(stats.totalManualDates).toBe(0);
      expect(stats.oldestManualDate).toBeUndefined();
      expect(stats.newestManualDate).toBeUndefined();
      expect(stats.recentlyUpdated).toEqual([]);
    });
  });

  describe("File Operations", () => {
    it("should handle file read errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Permission denied"));

      // Should not throw, but log warning
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await dateManager.getManualDate("test");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading dates file:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle file write errors", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
      mockFs.writeFile.mockRejectedValue(new Error("Disk full"));

      await expect(
        dateManager.setManualDate("test", "2023-01-01T00:00:00.000Z"),
      ).rejects.toThrow("Failed to save dates data");
    });

    it("should handle corrupted JSON data", async () => {
      mockFs.readFile.mockResolvedValue("invalid json");

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await dateManager.getManualDate("test");

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("Caching", () => {
    it("should use cache when available", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          itemDates: { test: "2023-01-01T00:00:00.000Z" },
          lastUpdated: new Date().toISOString(),
        }),
      );

      // First call should read from file
      await dateManager.getManualDate("test");
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await dateManager.getManualDate("test");
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // Still 1
    });

    it("should provide cache utilities", () => {
      expect(typeof dateManager.getCacheSize()).toBe("number");
      expect(() => dateManager.resetCache()).not.toThrow();
    });
  });

  describe("Timezone Support", () => {
    it("should format date for specific timezone", () => {
      const testDate = "2023-06-15T12:30:45.123Z";

      const tokyoFormat = dateManager.formatDateForTimezone(
        testDate,
        "Asia/Tokyo",
      );
      const utcFormat = dateManager.formatDateForTimezone(testDate, "UTC");

      expect(typeof tokyoFormat).toBe("string");
      expect(typeof utcFormat).toBe("string");
      expect(tokyoFormat).toContain("2023");
      expect(utcFormat).toContain("2023");
    });

    it("should handle invalid dates in timezone formatting", () => {
      const result = dateManager.formatDateForTimezone("invalid");
      expect(result).toBe("Invalid Date");
    });
  });
});
