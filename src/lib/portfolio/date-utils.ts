/**
 * Date Utility Functions for Portfolio Content Data Enhancement
 * Provides helper functions for date formatting, validation, and manipulation
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import { portfolioDateManager } from "./date-management";

/**
 * Date formatting options
 */
export interface DateFormatOptions {
	locale?: string;
	timezone?: string;
	format?: "iso" | "display" | "short" | "long" | "relative";
	includeTime?: boolean;
}

/**
 * Default date format options
 */
const DEFAULT_OPTIONS: DateFormatOptions = {
	locale: "ja-JP",
	timezone: "Asia/Tokyo",
	format: "display",
	includeTime: false,
};

/**
 * Format date with various options
 */
export function formatDate(
	date: string | Date,
	options: DateFormatOptions = {},
): string {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	let dateObj: Date;
	if (typeof date === "string") {
		dateObj = new Date(date);
	} else {
		dateObj = date;
	}

	if (Number.isNaN(dateObj.getTime())) {
		return "Invalid Date";
	}

	switch (opts.format) {
		case "iso":
			return dateObj.toISOString();

		case "short":
			return dateObj.toLocaleDateString(opts.locale, {
				year: "2-digit",
				month: "2-digit",
				day: "2-digit",
				timeZone: opts.timezone,
			});

		case "long":
			return dateObj.toLocaleDateString(opts.locale, {
				year: "numeric",
				month: "long",
				day: "numeric",
				weekday: "long",
				timeZone: opts.timezone,
				...(opts.includeTime && {
					hour: "2-digit",
					minute: "2-digit",
				}),
			});

		case "relative":
			return formatRelativeDate(dateObj);
		default:
			return dateObj.toLocaleDateString(opts.locale, {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				timeZone: opts.timezone,
				...(opts.includeTime && {
					hour: "2-digit",
					minute: "2-digit",
				}),
			});
	}
}

/**
 * Format date as relative time (e.g., "2 days ago", "1 month ago")
 */
export function formatRelativeDate(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
	const diffMonths = Math.floor(diffDays / 30);
	const diffYears = Math.floor(diffDays / 365);

	if (diffDays === 0) {
		return "今日";
	} else if (diffDays === 1) {
		return "昨日";
	} else if (diffDays < 7) {
		return `${diffDays}日前`;
	} else if (diffDays < 30) {
		const weeks = Math.floor(diffDays / 7);
		return `${weeks}週間前`;
	} else if (diffMonths < 12) {
		return `${diffMonths}ヶ月前`;
	} else {
		return `${diffYears}年前`;
	}
}

/**
 * Get effective date for portfolio item with formatting
 */
export function getFormattedEffectiveDate(
	item: EnhancedContentItem,
	options: DateFormatOptions = {},
): string {
	const effectiveDate = portfolioDateManager.getEffectiveDate(item);
	return formatDate(effectiveDate, options);
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.getTime() > Date.now();
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string | Date): boolean {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is today
 */
export function isToday(date: string | Date): boolean {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const today = new Date();

	return (
		dateObj.getFullYear() === today.getFullYear() &&
		dateObj.getMonth() === today.getMonth() &&
		dateObj.getDate() === today.getDate()
	);
}

/**
 * Get date range string (e.g., "2023年1月 - 2023年3月")
 */
export function formatDateRange(
	startDate: string | Date,
	endDate: string | Date,
	options: DateFormatOptions = {},
): string {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const start = typeof startDate === "string" ? new Date(startDate) : startDate;
	const end = typeof endDate === "string" ? new Date(endDate) : endDate;

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return "Invalid Date Range";
	}

	const startFormatted = start.toLocaleDateString(opts.locale, {
		year: "numeric",
		month: "long",
		timeZone: opts.timezone,
	});

	const endFormatted = end.toLocaleDateString(opts.locale, {
		year: "numeric",
		month: "long",
		timeZone: opts.timezone,
	});

	return `${startFormatted} - ${endFormatted}`;
}

/**
 * Parse various date input formats
 */
export function parseDate(input: string): Date | null {
	if (!input || typeof input !== "string") {
		return null;
	}

	// Try ISO format first
	let date = new Date(input);
	if (!Number.isNaN(date.getTime())) {
		return date;
	}

	// Try Japanese format (YYYY/MM/DD)
	const japaneseMatch = input.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
	if (japaneseMatch) {
		const [, year, month, day] = japaneseMatch;
		date = new Date(
			parseInt(year, 10),
			parseInt(month, 10) - 1,
			parseInt(day, 10),
		);
		if (!Number.isNaN(date.getTime())) {
			return date;
		}
	}

	// Try other common formats
	const formats = [
		/^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
		/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
		/^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
	];

	for (const format of formats) {
		const match = input.match(format);
		if (match) {
			const [, part1, part2, part3] = match;

			// Try different interpretations
			const interpretations = [
				new Date(
					parseInt(part3, 10),
					parseInt(part1, 10) - 1,
					parseInt(part2, 10),
				), // MM/DD/YYYY
				new Date(
					parseInt(part1, 10),
					parseInt(part2, 10) - 1,
					parseInt(part3, 10),
				), // YYYY-MM-DD
			];

			for (const interpretation of interpretations) {
				if (!Number.isNaN(interpretation.getTime())) {
					return interpretation;
				}
			}
		}
	}

	return null;
}

/**
 * Convert date to ISO string with validation
 */
export function toISOString(date: string | Date): string {
	const dateObj = typeof date === "string" ? parseDate(date) : date;

	if (!dateObj || Number.isNaN(dateObj.getTime())) {
		throw new Error("Invalid date input");
	}

	return dateObj.toISOString();
}

/**
 * Get current date in ISO format
 */
export function getCurrentISODate(): string {
	return new Date().toISOString();
}

/**
 * Get date at start of day (00:00:00)
 */
export function getStartOfDay(date: string | Date): Date {
	const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
	dateObj.setHours(0, 0, 0, 0);
	return dateObj;
}

/**
 * Get date at end of day (23:59:59.999)
 */
export function getEndOfDay(date: string | Date): Date {
	const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
	dateObj.setHours(23, 59, 59, 999);
	return dateObj;
}

/**
 * Add days to a date
 */
export function addDays(date: string | Date, days: number): Date {
	const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
	dateObj.setDate(dateObj.getDate() + days);
	return dateObj;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: string | Date, days: number): Date {
	return addDays(date, -days);
}

/**
 * Get difference between two dates in days
 */
export function getDaysDifference(
	date1: string | Date,
	date2: string | Date,
): number {
	const d1 = typeof date1 === "string" ? new Date(date1) : date1;
	const d2 = typeof date2 === "string" ? new Date(date2) : date2;

	const diffTime = Math.abs(d2.getTime() - d1.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Sort dates in ascending order
 */
export function sortDatesAscending(dates: (string | Date)[]): Date[] {
	return dates
		.map((date) => (typeof date === "string" ? new Date(date) : date))
		.filter((date) => !Number.isNaN(date.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());
}

/**
 * Sort dates in descending order
 */
export function sortDatesDescending(dates: (string | Date)[]): Date[] {
	return sortDatesAscending(dates).reverse();
}

/**
 * Group dates by month
 */
export function groupDatesByMonth(
	dates: (string | Date)[],
): Record<string, Date[]> {
	const groups: Record<string, Date[]> = {};

	dates.forEach((date) => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (!Number.isNaN(dateObj.getTime())) {
			const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;
			if (!groups[monthKey]) {
				groups[monthKey] = [];
			}
			groups[monthKey].push(dateObj);
		}
	});

	return groups;
}

/**
 * Group dates by year
 */
export function groupDatesByYear(
	dates: (string | Date)[],
): Record<string, Date[]> {
	const groups: Record<string, Date[]> = {};

	dates.forEach((date) => {
		const dateObj = typeof date === "string" ? new Date(date) : date;
		if (!Number.isNaN(dateObj.getTime())) {
			const yearKey = String(dateObj.getFullYear());
			if (!groups[yearKey]) {
				groups[yearKey] = [];
			}
			groups[yearKey].push(dateObj);
		}
	});

	return groups;
}

/**
 * Validate date range
 */
export function isValidDateRange(
	startDate: string | Date,
	endDate: string | Date,
): boolean {
	const start = typeof startDate === "string" ? new Date(startDate) : startDate;
	const end = typeof endDate === "string" ? new Date(endDate) : endDate;

	return (
		!Number.isNaN(start.getTime()) &&
		!Number.isNaN(end.getTime()) &&
		start <= end
	);
}

/**
 * Get business days between two dates (excluding weekends)
 */
export function getBusinessDays(
	startDate: string | Date,
	endDate: string | Date,
): number {
	const start =
		typeof startDate === "string" ? new Date(startDate) : new Date(startDate);
	const end =
		typeof endDate === "string" ? new Date(endDate) : new Date(endDate);

	let businessDays = 0;
	const currentDate = new Date(start);

	while (currentDate <= end) {
		const dayOfWeek = currentDate.getDay();
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			// Not Sunday (0) or Saturday (6)
			businessDays++;
		}
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return businessDays;
}

/**
 * Check if date is a weekend
 */
export function isWeekend(date: string | Date): boolean {
	const dateObj = typeof date === "string" ? new Date(date) : date;
	const dayOfWeek = dateObj.getDay();
	return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Get next business day (excluding weekends)
 */
export function getNextBusinessDay(date: string | Date): Date {
	const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
	const nextDay = new Date(dateObj);
	nextDay.setDate(nextDay.getDate() + 1);

	while (isWeekend(nextDay)) {
		nextDay.setDate(nextDay.getDate() + 1);
	}

	return nextDay;
}

/**
 * Get previous business day (excluding weekends)
 */
export function getPreviousBusinessDay(date: string | Date): Date {
	const dateObj = typeof date === "string" ? new Date(date) : new Date(date);
	const prevDay = new Date(dateObj);
	prevDay.setDate(prevDay.getDate() - 1);

	while (isWeekend(prevDay)) {
		prevDay.setDate(prevDay.getDate() - 1);
	}

	return prevDay;
}
