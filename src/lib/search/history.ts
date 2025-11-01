/**
 * Search History Management
 * Implements client-side search history and recent searches
 */

const SEARCH_HISTORY_KEY = "samuido_search_history";
const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
	query: string;
	timestamp: number;
	resultCount: number;
}

/**
 * Get search history from localStorage
 */
export function getSearchHistory(): SearchHistoryItem[] {
	if (typeof window === "undefined") {
		return [];
	}

	try {
		const history = localStorage.getItem(SEARCH_HISTORY_KEY);
		if (!history) {
			return [];
		}

		const parsed = JSON.parse(history);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.error("Failed to get search history:", error);
		return [];
	}
}

/**
 * Add search query to history
 */
export function addToSearchHistory(query: string, resultCount: number): void {
	if (typeof window === "undefined" || !query.trim()) {
		return;
	}

	try {
		const history = getSearchHistory();
		const normalizedQuery = query.toLowerCase().trim();

		// Remove existing entry if it exists
		const filteredHistory = history.filter(
			(item) => item.query.toLowerCase() !== normalizedQuery,
		);

		// Add new entry at the beginning
		const newItem: SearchHistoryItem = {
			query: query.trim(),
			timestamp: Date.now(),
			resultCount,
		};

		const updatedHistory = [newItem, ...filteredHistory].slice(
			0,
			MAX_HISTORY_ITEMS,
		);

		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedHistory));
	} catch (error) {
		console.error("Failed to add to search history:", error);
	}
}

/**
 * Remove item from search history
 */
export function removeFromSearchHistory(query: string): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		const history = getSearchHistory();
		const normalizedQuery = query.toLowerCase().trim();

		const filteredHistory = history.filter(
			(item) => item.query.toLowerCase() !== normalizedQuery,
		);

		localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(filteredHistory));
	} catch (error) {
		console.error("Failed to remove from search history:", error);
	}
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
	if (typeof window === "undefined") {
		return;
	}

	try {
		localStorage.removeItem(SEARCH_HISTORY_KEY);
	} catch (error) {
		console.error("Failed to clear search history:", error);
	}
}

/**
 * Get recent searches (last 5)
 */
export function getRecentSearches(): SearchHistoryItem[] {
	return getSearchHistory().slice(0, 5);
}

/**
 * Get popular searches from history
 */
export function getPopularSearches(): Array<{ query: string; count: number }> {
	const history = getSearchHistory();
	const queryCount = new Map<string, number>();

	// Count occurrences of each query
	history.forEach((item) => {
		const normalizedQuery = item.query.toLowerCase();
		queryCount.set(normalizedQuery, (queryCount.get(normalizedQuery) || 0) + 1);
	});

	// Convert to array and sort by count
	return Array.from(queryCount.entries())
		.map(([query, count]) => ({ query, count }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
}

/**
 * Search within history
 */
export function searchHistory(query: string): SearchHistoryItem[] {
	if (!query.trim()) {
		return [];
	}

	const history = getSearchHistory();
	const normalizedQuery = query.toLowerCase();

	return history.filter((item) =>
		item.query.toLowerCase().includes(normalizedQuery),
	);
}
