/**
 * Date management system without direct DB access.
 * Manual dates are kept in process memory during development.
 */

import type {
	DateManagementSystem,
	EnhancedContentItem,
} from "@/types/enhanced-content";

const runtimeManualDates = new Map<string, string>();

export class PortfolioDateManager implements DateManagementSystem {
	private readonly CACHE_TTL = 5 * 60 * 1000;
	private dateCache: Map<string, string> = new Map();
	private cacheLastLoaded = 0;

	async setManualDate(itemId: string, date: string): Promise<void> {
		if (!itemId || typeof itemId !== "string") {
			throw new Error("Item ID must be a non-empty string");
		}
		if (!this.validateDate(date)) {
			throw new Error("Invalid date format. Expected ISO 8601 format");
		}
		runtimeManualDates.set(itemId, date);
		this.dateCache.set(itemId, date);
		this.cacheLastLoaded = Date.now();
	}

	getEffectiveDate(item: EnhancedContentItem): Date {
		if (item.manualDate) {
			const manual = new Date(item.manualDate);
			if (!Number.isNaN(manual.getTime())) return manual;
		}
		const cachedDate = this.dateCache.get(item.id) || runtimeManualDates.get(item.id);
		if (cachedDate) {
			const parsed = new Date(cachedDate);
			if (!Number.isNaN(parsed.getTime())) return parsed;
		}
		return new Date(item.createdAt);
	}

	validateDate(date: string): boolean {
		if (!date || typeof date !== "string") return false;
		const parsed = new Date(date);
		return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === date;
	}

	formatDateForDisplay(date: string): string {
		if (!this.validateDate(date)) return "Invalid Date";
		return new Date(date).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			timeZone: "Asia/Tokyo",
		});
	}

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
		if (format === "short") {
			return this.formatDateForDisplay(date).replaceAll("/", "-");
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

	formatDateForStorage(date: Date): string {
		if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
			throw new Error("Invalid Date object");
		}
		return date.toISOString();
	}

	parseAndFormatDate(dateInput: string | Date): string {
		const date =
			dateInput instanceof Date ? dateInput : new Date(String(dateInput));
		if (Number.isNaN(date.getTime())) {
			throw new Error("Invalid date input");
		}
		return date.toISOString();
	}

	async getManualDate(itemId: string): Promise<string | null> {
		await this.ensureCache();
		return this.dateCache.get(itemId) ?? null;
	}

	async hasManualDate(itemId: string): Promise<boolean> {
		return typeof (await this.getManualDate(itemId)) === "string";
	}

	async removeManualDate(itemId: string): Promise<void> {
		runtimeManualDates.delete(itemId);
		this.dateCache.delete(itemId);
		this.cacheLastLoaded = Date.now();
	}

	async getAllManualDates(): Promise<Record<string, string>> {
		await this.ensureCache();
		return Object.fromEntries(this.dateCache.entries());
	}

	async bulkSetManualDates(dates: Record<string, string>): Promise<void> {
		for (const [itemId, date] of Object.entries(dates)) {
			await this.setManualDate(itemId, date);
		}
	}

	async getDateStats(): Promise<{
		totalManualDates: number;
		oldestManualDate?: string;
		newestManualDate?: string;
		recentlyUpdated: Array<{ itemId: string; date: string }>;
	}> {
		await this.ensureCache();
		const entries = Array.from(this.dateCache.entries()).sort((a, b) =>
			a[1].localeCompare(b[1]),
		);
		return {
			totalManualDates: entries.length,
			oldestManualDate: entries[0]?.[1],
			newestManualDate: entries.at(-1)?.[1],
			recentlyUpdated: entries
				.slice(-10)
				.reverse()
				.map(([itemId, date]) => ({ itemId, date })),
		};
	}

	private async ensureCache(): Promise<void> {
		if (Date.now() - this.cacheLastLoaded < this.CACHE_TTL) {
			return;
		}
		this.dateCache = new Map(runtimeManualDates);
		this.cacheLastLoaded = Date.now();
	}
}

export const portfolioDateManager = new PortfolioDateManager();
