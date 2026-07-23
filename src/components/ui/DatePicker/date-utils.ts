/**
 * Pure utility functions for the DatePicker.
 * No React dependencies — safe to unit-test in isolation.
 */

const DATE_FORMATS: RegExp[] = [
	// YYYY/MM/DD
	/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
	// YYYY-MM-DD
	/^(\d{4})-(\d{1,2})-(\d{1,2})$/,
	// MM/DD/YYYY
	/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
];

const MM_DD_YYYY_INDEX = 2;

export function formatDateForInput(date: Date): string {
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
}

export function formatDateForDisplay(date: Date): string {
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "long",
		day: "numeric",
		weekday: "short",
	});
}

export function validateDate(dateString: string): Date | null {
	if (!dateString.trim()) return null;

	for (let i = 0; i < DATE_FORMATS.length; i++) {
		const format = DATE_FORMATS[i];
		const match = dateString.match(format);
		if (!match) continue;

		const [, part1, part2, part3] = match;
		let year: number;
		let month: number;
		let day: number;

		if (i === MM_DD_YYYY_INDEX) {
			// MM/DD/YYYY format
			month = parseInt(part1, 10) - 1;
			day = parseInt(part2, 10);
			year = parseInt(part3, 10);
		} else {
			// YYYY/MM/DD or YYYY-MM-DD format
			year = parseInt(part1, 10);
			month = parseInt(part2, 10) - 1;
			day = parseInt(part3, 10);
		}

		// Validate the parsed values
		if (year < 1900 || year > 2100) return null;
		if (month < 0 || month > 11) return null;
		if (day < 1 || day > 31) return null;

		const date = new Date(year, month, day);

		// Check if the date is valid and matches the input
		if (
			date.getFullYear() === year &&
			date.getMonth() === month &&
			date.getDate() === day
		) {
			// Set time to noon to avoid timezone issues
			date.setHours(12, 0, 0, 0);
			return date;
		}
	}

	return null; // Don't use fallback parsing to avoid unexpected results
}

export function generateCalendarDays(year: number, month: number): Date[] {
	const firstDay = new Date(year, month, 1);
	const startDate = new Date(firstDay);
	startDate.setDate(startDate.getDate() - firstDay.getDay());

	const days: Date[] = [];
	const current = new Date(startDate);

	for (let i = 0; i < 42; i++) {
		days.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	return days;
}

export function isToday(date: Date): boolean {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

export function isSelected(date: Date, selected: Date | null): boolean {
	return (
		!!selected &&
		date.getDate() === selected.getDate() &&
		date.getMonth() === selected.getMonth() &&
		date.getFullYear() === selected.getFullYear()
	);
}

export function isCurrentMonth(date: Date, month: number): boolean {
	return date.getMonth() === month;
}

export const WEEK_DAY_LABELS = [
	"日",
	"月",
	"火",
	"水",
	"木",
	"金",
	"土",
] as const;
