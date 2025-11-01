/**
 * Date management system backed by the SQLite content catalog.
 * Replaces the legacy JSON persistence layer while keeping the existing API.
 */

// Lazy adapters to avoid loading native modules in test environments
function safeGetManualDateEntry(
	id: string,
): { content_id: string; date: string } | null {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("@/cms/lib/content-db-manager");
		return mod.getManualDateEntry(id);
	} catch {
		return null;
	}
}

function safeListManualDateEntries(): Array<{
	content_id: string;
	date: string;
}> {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("@/cms/lib/content-db-manager");
		return mod.listManualDateEntries();
	} catch {
		return [];
	}
}

function safeUpsertManualDateEntry(id: string, date: string): void {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("@/cms/lib/content-db-manager");
		mod.upsertManualDateEntry(id, date);
	} catch {
		// no-op in test environments
	}
}

function safeRemoveManualDateEntry(id: string): void {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const mod = require("@/cms/lib/content-db-manager");
		mod.removeManualDateEntry(id);
	} catch {
		// no-op in test environments
	}
}

import type {
	DateManagementSystem,
	EnhancedContentItem,
} from "@/types/enhanced-content";

export class PortfolioDateManager implements DateManagementSystem {
	private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
	private dateCache: Map<string, string> = new Map();
	private cacheLastLoaded = 0;

	/**
	 * Set manual date for a specific portfolio item
	 */
	async setManualDate(itemId: string, date: string): Promise<void> {
		if (!itemId || typeof itemId !== "string") {
			throw new Error("Item ID must be a non-empty string");
		}

		if (!this.validateDate(date)) {
			throw new Error("Invalid date format. Expected ISO 8601 format");
		}

		safeUpsertManualDateEntry(itemId, date);
		this.dateCache.set(itemId, date);
		this.cacheLastLoaded = Date.now();
	}

	/**
	 * Get the effective date for an item (manual date if set, otherwise creation date)
	 */
	getEffectiveDate(item: EnhancedContentItem): Date {
		if (!item) {
			throw new Error("Item is required");
		}

		if (item.manualDate) {
			const manual = new Date(item.manualDate);
			if (!Number.isNaN(manual.getTime())) {
				return manual;
			}
		}

		const cachedDate = this.dateCache.get(item.id);
		if (cachedDate) {
			const parsed = new Date(cachedDate);
			if (!Number.isNaN(parsed.getTime())) {
				return parsed;
			}
		}

		const stored = safeGetManualDateEntry(item.id);
		if (stored) {
			this.dateCache.set(item.id, stored.date);
			this.cacheLastLoaded = Date.now();
			const parsed = new Date(stored.date);
			if (!Number.isNaN(parsed.getTime())) {
				return parsed;
			}
		}

		return new Date(item.createdAt);
	}

	/**
	 * Validate date string (ISO 8601 format)
	 */
	validateDate(date: string): boolean {
		if (!date || typeof date !== "string") {
			return false;
		}
		const parsed = new Date(date);
		return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === date;
	}

	/**
	 * Format date for display (localized format)
	 */
	formatDateForDisplay(date: string): string {
		if (!this.validateDate(date)) {
			return "Invalid Date";
		}
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			timeZone: "Asia/Tokyo",
		});
	}

	/**
	 * Backward-compatibility adapter used by some callers
	 */
	convertDateFormat(
		date: string,
		format: "iso" | "display" | "short" | "long" = "display",
	): string {
		if (format === "iso") {
			try {
				return this.formatDateForStorage(new Date(date));
			} catch {
				return date;
			}
		}
		// simple variants for display
		if (format === "short") {
			const d = this.formatDateForDisplay(date);
			return d.replaceAll("/", "-");
		}
		if (format === "long") {
			const d = new Date(date);
			if (Number.isNaN(d.getTime())) return "Invalid Date";
			return d.toLocaleString("ja-JP", {
				year: "numeric",
				month: "long",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				timeZone: "Asia/Tokyo",
			});
		}
		return this.formatDateForDisplay(date);
	}

	/**
	 * Format Date object for storage (ISO 8601 format)
	 */
	formatDateForStorage(date: Date): string {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			throw new Error("Invalid Date object");
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
		await this.ensureCache();
		return this.dateCache.get(itemId) ?? null;
	}

	/**
	 * Check if an item has a manual date
	 */
	async hasManualDate(itemId: string): Promise<boolean> {
		const date = await this.getManualDate(itemId);
		return typeof date === "string";
	}

	/**
	 * Remove manual date for a specific item
	 */
	async removeManualDate(itemId: string): Promise<void> {
		if (!itemId || typeof itemId !== "string") {
			return;
		}
		safeRemoveManualDateEntry(itemId);
		this.dateCache.delete(itemId);
		this.cacheLastLoaded = Date.now();
	}

	/**
	 * Get all manual dates
	 */
	async getAllManualDates(): Promise<Record<string, string>> {
		await this.ensureCache();
		return Object.fromEntries(this.dateCache.entries());
	}

	/**
	 * Bulk set manual dates
	 */
	async bulkSetManualDates(dates: Record<string, string>): Promise<void> {
		if (!dates || typeof dates !== "object") {
			throw new Error("Dates must be an object");
		}

		for (const [itemId, date] of Object.entries(dates)) {
			if (!itemId || typeof itemId !== "string") {
				throw new Error(`Invalid item ID: ${itemId}`);
			}
			if (!this.validateDate(date)) {
				throw new Error(`Invalid date format for item ${itemId}: ${date}`);
			}
		}

		const now = Date.now();
		for (const [itemId, date] of Object.entries(dates)) {
			safeUpsertManualDateEntry(itemId, date);
			this.dateCache.set(itemId, date);
		}
		this.cacheLastLoaded = now;
	}

	/**
	 * Parse various date formats and convert to ISO 8601
	 */
	parseAndFormatDate(dateInput: string | Date): string {
		const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
		if (Number.isNaN(date.getTime())) {
			throw new Error("Unable to parse date");
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
		await this.ensureCache();

		const entries = Array.from(this.dateCache.entries()).map(
			([itemId, date]) => ({
				itemId,
				date,
				timestamp: new Date(date).getTime(),
			}),
		);

		entries.sort((a, b) => a.timestamp - b.timestamp);

		const oldestManualDate = entries.length > 0 ? entries[0].date : undefined;
		const newestManualDate =
			entries.length > 0 ? entries[entries.length - 1].date : undefined;

		const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
		const recentlyUpdated = entries
			.filter((entry) => entry.timestamp > thirtyDaysAgo)
			.slice(-10)
			.map(({ itemId, date }) => ({ itemId, date }));

		return {
			totalManualDates: entries.length,
			oldestManualDate,
			newestManualDate,
			recentlyUpdated,
		};
	}

	private async ensureCache(): Promise<void> {
		const now = Date.now();
		if (
			this.cacheLastLoaded > 0 &&
			now - this.cacheLastLoaded < this.CACHE_TTL
		) {
			return;
		}

		const entries = safeListManualDateEntries();
		this.dateCache = new Map(
			entries.map((entry) => [entry.content_id, entry.date]),
		);
		this.cacheLastLoaded = now;
	}
}

export const portfolioDateManager = new PortfolioDateManager();

export const createDateManager = (): PortfolioDateManager =>
	new PortfolioDateManager();
