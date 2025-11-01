/**
 * Client-side Date Management for Portfolio Content Data Enhancement
 * Provides date management functionality that works in the browser
 */

import type {
	DateManagementSystem,
	EnhancedContentItem,
} from "@/types/enhanced-content";

export class ClientDateManager implements DateManagementSystem {
	/**
	 * Set manual date for a specific portfolio item (client-side only)
	 * This would typically make an API call to persist the data
	 */
	async setManualDate(itemId: string, date: string): Promise<void> {
		if (!itemId || typeof itemId !== "string") {
			throw new Error("Item ID must be a non-empty string");
		}

		if (!this.validateDate(date)) {
			throw new Error("Invalid date format. Expected ISO 8601 format");
		}

		// In a real implementation, this would make an API call
		// For now, we'll just validate the input
		console.log(`Setting manual date for ${itemId}: ${date}`);
	}

	/**
	 * Get the effective date for an item (manual date if set, otherwise creation date)
	 */
	getEffectiveDate(item: EnhancedContentItem): Date {
		if (!item) {
			throw new Error("Item is required");
		}

		// If manual date is enabled and set, use it
		if (item.useManualDate && item.manualDate) {
			const manualDate = new Date(item.manualDate);
			if (!Number.isNaN(manualDate.getTime())) {
				return manualDate;
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
		return (
			!Number.isNaN(parsedDate.getTime()) && date === parsedDate.toISOString()
		);
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
		if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) {
			throw new Error("Invalid Date object");
		}

		return date.toISOString();
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
			default:
				return this.formatDateForDisplay(date);
		}
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
}

// Export singleton instance for client-side use
export const clientDateManager = new ClientDateManager();

// Export factory function for custom instances
export const createClientDateManager = (): ClientDateManager => {
	return new ClientDateManager();
};
