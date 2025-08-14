/**
 * Date Management System for Portfolio Content Data Enhancement
 * Implements DateManagementSystem interface with manual date setting capabilities
 */

import type {
  DateManagementSystem,
  EnhancedContentItem,
} from "@/types/enhanced-content";
import { promises as fs } from "fs";
import path from "path";

interface DateData {
  itemDates: Record<string, string>; // itemId -> ISO date string
  lastUpdated: string;
}

export class PortfolioDateManager implements DateManagementSystem {
  private readonly dataPath: string;
  private dateCache: Map<string, string> = new Map(); // itemId -> ISO date string
  private cacheLastUpdated: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(dataPath?: string) {
    this.dataPath =
      dataPath || path.join(process.cwd(), "public/data/dates.json");
  }

  /**
   * Set manual date for a specific portfolio item
   */
  async setManualDate(itemId: string, date: string): Promise<void> {
    if (!itemId || typeof itemId !== "string") {
      const err = new globalThis.Error("Item ID must be a non-empty string");
      throw err;
    }

    if (!this.validateDate(date)) {
      const err = new globalThis.Error(
        "Invalid date format. Expected ISO 8601 format",
      );
      throw err;
    }

    await this.loadDatesFromFile();

    this.dateCache.set(itemId, date);
    await this.saveDatesToFile();
  }

  /**
   * Get the effective date for an item (manual date if set, otherwise creation date)
   */
  getEffectiveDate(item: EnhancedContentItem): Date {
    if (!item) {
      const err = new globalThis.Error("Item is required");
      throw err;
    }

    // Always prioritize manual date if available, regardless of useManualDate flag
    if (item.manualDate) {
      const manualDate = new Date(item.manualDate);
      if (!isNaN(manualDate.getTime())) {
        return manualDate;
      }
    }

    // Check if we have a cached manual date for this item
    if (this.dateCache.has(item.id)) {
      const cachedDate = new Date(this.dateCache.get(item.id)!);
      if (!isNaN(cachedDate.getTime())) {
        return cachedDate;
      }
    }

    // Fall back to creation date
    return new Date(item.createdAt);
  }

  /**
   * Validate date string (ISO 8601 format)
   */
  validateDate(date: string): boolean {
    if (!date || typeof date !== "string") {
      return false;
    }

    // Check if it's a valid ISO 8601 date string
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && date === parsedDate.toISOString();
  }

  /**
   * Format date for display (localized format)
   */
  formatDateForDisplay(date: string): string {
    if (!this.validateDate(date)) {
      return "Invalid Date";
    }

    const parsedDate = new Date(date);

    // Format for Japanese locale (can be made configurable)
    return parsedDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Tokyo",
    });
  }

  /**
   * Format Date object for storage (ISO 8601 format)
   */
  formatDateForStorage(date: Date): string {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      const err = new globalThis.Error("Invalid Date object");
      throw err;
    }

    return date.toISOString();
  }

  /**
   * Get manual date for a specific item
   */
  async getManualDate(itemId: string): Promise<string | null> {
    if (!itemId || typeof itemId !== "string") {
      return null;
    }

    await this.loadDatesFromFile();
    return this.dateCache.get(itemId) || null;
  }

  /**
   * Remove manual date for a specific item
   */
  async removeManualDate(itemId: string): Promise<void> {
    if (!itemId || typeof itemId !== "string") {
      return;
    }

    await this.loadDatesFromFile();

    if (this.dateCache.has(itemId)) {
      this.dateCache.delete(itemId);
      await this.saveDatesToFile();
    }
  }

  /**
   * Get all manual dates
   */
  async getAllManualDates(): Promise<Record<string, string>> {
    await this.loadDatesFromFile();
    return Object.fromEntries(this.dateCache.entries());
  }

  /**
   * Bulk set manual dates
   */
  async bulkSetManualDates(dates: Record<string, string>): Promise<void> {
    if (!dates || typeof dates !== "object") {
      const err = new globalThis.Error("Dates must be an object");
      throw err;
    }

    await this.loadDatesFromFile();

    // Validate all dates first
    for (const [itemId, date] of Object.entries(dates)) {
      if (!itemId || typeof itemId !== "string") {
        const err = new globalThis.Error(`Invalid item ID: ${itemId}`);
        throw err;
      }
      if (!this.validateDate(date)) {
        const err = new globalThis.Error(
          `Invalid date format for item ${itemId}: ${date}`,
        );
        throw err;
      }
    }

    // Set all dates
    for (const [itemId, date] of Object.entries(dates)) {
      this.dateCache.set(itemId, date);
    }

    await this.saveDatesToFile();
  }

  /**
   * Parse various date formats and convert to ISO 8601
   */
  parseAndFormatDate(dateInput: string | Date): string {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // Try to parse various formats
      date = new Date(dateInput);
    } else {
      const err = new globalThis.Error("Invalid date input type");
      throw err;
    }

    if (isNaN(date.getTime())) {
      const err = new globalThis.Error("Unable to parse date");
      throw err;
    }

    return this.formatDateForStorage(date);
  }

  /**
   * Get date statistics
   */
  async getDateStats(): Promise<{
    totalManualDates: number;
    oldestManualDate?: string;
    newestManualDate?: string;
    recentlyUpdated: Array<{ itemId: string; date: string }>;
  }> {
    await this.loadDatesFromFile();

    const dates = Array.from(this.dateCache.entries());
    const sortedDates = dates
      .map(([itemId, date]) => ({
        itemId,
        date,
        timestamp: new Date(date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const oldestManualDate =
      sortedDates.length > 0 ? sortedDates[0].date : undefined;
    const newestManualDate =
      sortedDates.length > 0
        ? sortedDates[sortedDates.length - 1].date
        : undefined;

    // Get recently updated (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentlyUpdated = sortedDates
      .filter((item) => item.timestamp > thirtyDaysAgo)
      .slice(-10) // Last 10 items
      .map(({ itemId, date }) => ({ itemId, date }));

    return {
      totalManualDates: dates.length,
      oldestManualDate,
      newestManualDate,
      recentlyUpdated,
    };
  }

  /**
   * Load dates from file with caching
   */
  private async loadDatesFromFile(): Promise<void> {
    const now = Date.now();

    // Use cache if it's still valid
    if (
      this.cacheLastUpdated > 0 &&
      now - this.cacheLastUpdated < this.CACHE_TTL
    ) {
      return;
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });

      // Try to read existing file
      const fileContent = await fs.readFile(this.dataPath, "utf-8");
      const data: DateData = JSON.parse(fileContent);

      // Validate data structure
      if (data && typeof data.itemDates === "object") {
        this.dateCache.clear();
        for (const [itemId, date] of Object.entries(data.itemDates)) {
          if (typeof itemId === "string" && this.validateDate(date)) {
            this.dateCache.set(itemId, date);
          }
        }
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty cache
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn("Error loading dates file:", error);
      }
      this.dateCache.clear();
    }

    this.cacheLastUpdated = now;
  }

  /**
   * Save dates to file
   */
  private async saveDatesToFile(): Promise<void> {
    try {
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });

      const data: DateData = {
        itemDates: Object.fromEntries(this.dateCache.entries()),
        lastUpdated: new Date().toISOString(),
      };

      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), "utf-8");
      this.cacheLastUpdated = Date.now();
    } catch (error) {
      console.error("Error saving dates file:", error);
      const err = new globalThis.Error("Failed to save dates data");
      throw err;
    }
  }

  /**
   * Reset cache (useful for testing)
   */
  public resetCache(): void {
    this.dateCache.clear();
    this.cacheLastUpdated = 0;
  }

  /**
   * Get cache size (useful for monitoring)
   */
  public getCacheSize(): number {
    return this.dateCache.size;
  }

  /**
   * Check if item has manual date set
   */
  async hasManualDate(itemId: string): Promise<boolean> {
    if (!itemId || typeof itemId !== "string") {
      return false;
    }

    await this.loadDatesFromFile();
    return this.dateCache.has(itemId);
  }

  /**
   * Get timezone-aware date formatting
   */
  formatDateForTimezone(date: string, timezone: string = "Asia/Tokyo"): string {
    if (!this.validateDate(date)) {
      return "Invalid Date";
    }

    const parsedDate = new Date(date);

    return parsedDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    });
  }

  /**
   * Convert date to different formats
   */
  convertDateFormat(
    date: string,
    format: "iso" | "display" | "short" | "long" = "display",
  ): string {
    if (!this.validateDate(date)) {
      return "Invalid Date";
    }

    const parsedDate = new Date(date);

    switch (format) {
      case "iso":
        return parsedDate.toISOString();
      case "short":
        return parsedDate.toLocaleDateString("ja-JP", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        });
      case "long":
        return parsedDate.toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        });
      case "display":
      default:
        return this.formatDateForDisplay(date);
    }
  }
}

// Export singleton instance
export const portfolioDateManager = new PortfolioDateManager();

// Export factory function for custom instances
export const createDateManager = (dataPath?: string): PortfolioDateManager => {
  return new PortfolioDateManager(dataPath);
};
