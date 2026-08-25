/**
 * Search Index Generation for Portfolio
 * Task 1.2: 検索インデックス生成機能
 */

import type { SearchIndex, SearchOptions, SearchResult } from "@/types/content";
import type { PortfolioContentItem } from "./data-processor";

export interface PortfolioSearchIndex extends SearchIndex {
	technologies: string[];
	projectType?: string;
	videoType?: string;
	experimentType?: string;
	aspectRatio?: number;
	gridSize?: string;
	priority: number;
	createdAt: string;
	updatedAt?: string;
}

export interface SearchFilter {
	type: "category" | "technology" | "tag" | "year" | "projectType";
	options: Array<{
		value: string;
		label: string;
		count: number;
	}>;
}

export interface SearchStats {
	totalItems: number;
	categoryDistribution: Record<string, number>;
	technologyDistribution: Record<string, number>;
	yearDistribution: Record<string, number>;
}

/**
 * Portfolio Search Index Generator
 */
export class PortfolioSearchIndexGenerator {
	/**
	 * Generate comprehensive search index from portfolio items
	 */
	generateSearchIndex(items: PortfolioContentItem[]): PortfolioSearchIndex[] {
		return items.map((item) => this.createSearchIndexEntry(item));
	}

	/**
	 * Create search index entry for a single portfolio item
	 */
	private createSearchIndexEntry(
		item: PortfolioContentItem,
	): PortfolioSearchIndex {
		// Create comprehensive searchable content
		const searchableContent = this.buildSearchableContent(item);

		return {
			id: item.id,
			type: item.type,
			title: item.title,
			description: item.description,
			content: item.content || "",
			tags: item.tags,
			category: item.category,
			searchableContent,

			// Portfolio-specific fields
			technologies: item.technologies,
			projectType: item.projectType,
			videoType: item.videoType,
			experimentType: item.experimentType,
			aspectRatio: item.aspectRatio,
			gridSize: item.gridSize,
			priority: item.priority,
			createdAt: item.createdAt,
			updatedAt: item.updatedAt,
		};
	}

	/**
	 * Build comprehensive searchable content string
	 */
	private buildSearchableContent(item: PortfolioContentItem): string {
		const contentParts = [
			item.title,
			item.description,
			item.content || "",
			...item.tags,
			...item.technologies,
			item.category,
			item.projectType || "",
			item.videoType || "",
			item.experimentType || "",
			item.client || "",
		];

		// Add external link titles and descriptions
		if (item.externalLinks) {
			item.externalLinks.forEach(
				(link: import("@/types/content").ExternalLink) => {
					contentParts.push(link.title, link.description || "");
				},
			);
		}

		return contentParts
			.filter(Boolean)
			.join(" ")
			.toLowerCase()
			.replace(/[^\w\s]/g, " ") // Remove special characters
			.replace(/\s+/g, " ") // Normalize whitespace
			.trim();
	}

	/**
	 * Search portfolio items with advanced filtering
	 */
	searchPortfolioItems(
		query: string,
		searchIndex: PortfolioSearchIndex[],
		options: SearchOptions = {},
	): SearchResult[] {
		const { type, category, limit = 50, includeContent = true } = options;

		let filteredIndex = searchIndex;

		// Apply type filter
		if (type) {
			filteredIndex = filteredIndex.filter((item) => item.type === type);
		}

		// Apply category filter
		if (category && category !== "all") {
			filteredIndex = filteredIndex.filter(
				(item) => item.category === category,
			);
		}

		// Perform search
		const results = this.performSearch(query, filteredIndex, includeContent);

		// Apply limit
		return results.slice(0, limit);
	}

	/**
	 * Perform actual search with scoring
	 */
	private performSearch(
		query: string,
		searchIndex: PortfolioSearchIndex[],
		includeContent: boolean,
	): SearchResult[] {
		if (!query.trim()) {
			// Return all items sorted by priority if no query
			return searchIndex
				.sort((a, b) => b.priority - a.priority)
				.map((item) => ({
					id: item.id,
					type: item.type,
					title: item.title,
					description: item.description,
					url: `/portfolio/${item.id}`,
					score: 1.0,
					highlights: [],
				}));
		}

		const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
		const results: SearchResult[] = [];
		const priorityById = new Map(
			searchIndex.map((item) => [item.id, item.priority] as const),
		);

		for (const item of searchIndex) {
			const score = this.calculateSearchScore(queryTerms, item, includeContent);

			if (score > 0) {
				const highlights = this.generateHighlights(queryTerms, item);

				results.push({
					id: item.id,
					type: item.type,
					title: item.title,
					description: item.description,
					url: `/portfolio/${item.id}`,
					score,
					highlights,
				});
			}
		}

		// Sort by score (descending) and then by priority
		return results.sort((a, b) => {
			if (Math.abs(a.score - b.score) < 0.01) {
				const priorityA = priorityById.get(a.id) ?? 0;
				const priorityB = priorityById.get(b.id) ?? 0;
				return priorityB - priorityA;
			}
			return b.score - a.score;
		});
	}

	/**
	 * Calculate search score for an item
	 */
	private calculateSearchScore(
		queryTerms: string[],
		item: PortfolioSearchIndex,
		includeContent: boolean,
	): number {
		let score = 0;

		// Precompute lowercase versions once per item to avoid repeated work per term
		const lowerTitle = item.title.toLowerCase();
		const lowerCategory = item.category.toLowerCase();
		const lowerDescription = item.description.toLowerCase();
		const lowerContent = item.content.toLowerCase();
		const lowerTechs = item.technologies.map((tech) => tech.toLowerCase());
		const lowerTags = item.tags.map((tag) => tag.toLowerCase());
		const techSet = new Set(lowerTechs);
		const tagSet = new Set(lowerTags);

		for (const term of queryTerms) {
			// Title match (highest weight)
			if (lowerTitle.includes(term)) {
				score += 3.0;
			}

			// Technology exact match (high weight)
			if (techSet.has(term)) {
				score += 2.5;
			}

			// Tag exact match (high weight)
			if (tagSet.has(term)) {
				score += 2.0;
			}

			// Category match
			if (lowerCategory.includes(term)) {
				score += 1.5;
			}

			// Description match
			if (lowerDescription.includes(term)) {
				score += 1.0;
			}

			// Technology partial match
			if (lowerTechs.some((tech) => tech.includes(term))) {
				score += 0.8;
			}

			// Tag partial match
			if (lowerTags.some((tag) => tag.includes(term))) {
				score += 0.6;
			}

			// Content match (if enabled)
			if (includeContent && lowerContent.includes(term)) {
				score += 0.4;
			}

			// General searchable content match
			if (item.searchableContent.includes(term)) {
				score += 0.2;
			}
		}

		// Boost score based on item priority
		score *= 1 + item.priority / 100;

		// Boost recent items slightly
		const daysSinceUpdate =
			(Date.now() - new Date(item.updatedAt || item.createdAt).getTime()) /
			(1000 * 60 * 60 * 24);
		if (daysSinceUpdate < 30) {
			score *= 1.1;
		}

		return score;
	}

	/**
	 * Generate search result highlights
	 */
	private generateHighlights(
		queryTerms: string[],
		item: PortfolioSearchIndex,
	): string[] {
		const highlights: string[] = [];

		for (const term of queryTerms) {
			// Check title
			if (item.title.toLowerCase().includes(term)) {
				highlights.push(`Title: ${this.highlightTerm(item.title, term)}`);
			}

			// Check description
			if (item.description.toLowerCase().includes(term)) {
				const snippet = this.extractSnippet(item.description, term);
				highlights.push(`Description: ${this.highlightTerm(snippet, term)}`);
			}

			// Check technologies
			const matchingTech = item.technologies.find((tech) =>
				tech.toLowerCase().includes(term),
			);
			if (matchingTech) {
				highlights.push(
					`Technology: ${this.highlightTerm(matchingTech, term)}`,
				);
			}

			// Check tags
			const matchingTag = item.tags.find((tag) =>
				tag.toLowerCase().includes(term),
			);
			if (matchingTag) {
				highlights.push(`Tag: ${this.highlightTerm(matchingTag, term)}`);
			}
		}

		return highlights.slice(0, 3); // Limit to 3 highlights
	}

	/**
	 * Highlight search term in text
	 */
	private highlightTerm(text: string, term: string): string {
		const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(${escaped})`, "gi");
		return text.replace(regex, "<mark>$1</mark>");
	}

	/**
	 * Extract snippet around search term
	 */
	private extractSnippet(
		text: string,
		term: string,
		maxLength: number = 150,
	): string {
		const lowerText = text.toLowerCase();
		const termIndex = lowerText.indexOf(term.toLowerCase());

		if (termIndex === -1) return text.substring(0, maxLength);

		const start = Math.max(0, termIndex - 50);
		const end = Math.min(text.length, termIndex + term.length + 50);

		let snippet = text.substring(start, end);

		if (start > 0) snippet = `...${snippet}`;
		if (end < text.length) snippet = `${snippet}...`;

		return snippet;
	}

	/**
	 * Generate available search filters
	 */
	generateSearchFilters(searchIndex: PortfolioSearchIndex[]): SearchFilter[] {
		const filters: SearchFilter[] = [];

		// Category filters
		const categoryCount: Record<string, number> = {};
		searchIndex.forEach((item) => {
			categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
		});

		const categoryOptions = Object.entries(categoryCount).map(
			([category, count]) => ({
				value: category,
				label: this.getCategoryLabel(category),
				count,
			}),
		);

		if (categoryOptions.length > 0) {
			filters.push({
				type: "category",
				options: categoryOptions,
			});
		}

		// Technology filters
		const technologyCount: Record<string, number> = {};
		searchIndex.forEach((item) => {
			item.technologies.forEach((tech) => {
				technologyCount[tech] = (technologyCount[tech] || 0) + 1;
			});
		});

		const technologyOptions = Object.entries(technologyCount)
			.sort(([, a], [, b]) => b - a) // Sort by count
			.slice(0, 20) // Top 20 technologies
			.map(([tech, count]) => ({
				value: tech,
				label: tech,
				count,
			}));

		if (technologyOptions.length > 0) {
			filters.push({
				type: "technology",
				options: technologyOptions,
			});
		}

		// Year filters
		const yearCount: Record<string, number> = {};
		searchIndex.forEach((item) => {
			const year = new Date(item.createdAt).getFullYear().toString();
			yearCount[year] = (yearCount[year] || 0) + 1;
		});

		const yearOptions = Object.entries(yearCount)
			.sort(([a], [b]) => parseInt(b, 10) - parseInt(a, 10)) // Sort by year descending
			.map(([year, count]) => ({
				value: year,
				label: `${year}年`,
				count,
			}));

		if (yearOptions.length > 0) {
			filters.push({
				type: "year",
				options: yearOptions,
			});
		}

		// Tag filters
		const tagCount: Record<string, number> = {};
		searchIndex.forEach((item) => {
			(item.tags || []).forEach((tag) => {
				tagCount[tag] = (tagCount[tag] || 0) + 1;
			});
		});

		const tagOptions = Object.entries(tagCount)
			.sort(([, a], [, b]) => b - a) // Sort by count
			.slice(0, 15) // Top 15 tags
			.map(([tag, count]) => ({
				value: tag,
				label: tag,
				count,
			}));

		if (tagOptions.length > 0) {
			filters.push({
				type: "tag",
				options: tagOptions,
			});
		}

		return filters;
	}

	/**
	 * Get human-readable category label
	 */
	private getCategoryLabel(category: string): string {
		const labels: Record<string, string> = {
			develop: "開発",
			video: "映像",
			design: "デザイン",
			playground: "プレイグラウンド",
		};

		return labels[category] || category;
	}

	/**
	 * Generate search statistics
	 */
	generateSearchStats(searchIndex: PortfolioSearchIndex[]): SearchStats {
		const categoryDistribution: Record<string, number> = {};
		const technologyDistribution: Record<string, number> = {};
		const yearDistribution: Record<string, number> = {};

		searchIndex.forEach((item) => {
			// Category distribution
			categoryDistribution[item.category] =
				(categoryDistribution[item.category] || 0) + 1;

			// Technology distribution
			item.technologies.forEach((tech) => {
				technologyDistribution[tech] = (technologyDistribution[tech] || 0) + 1;
			});

			// Year distribution
			const year = new Date(item.createdAt).getFullYear().toString();
			yearDistribution[year] = (yearDistribution[year] || 0) + 1;
		});

		return {
			totalItems: searchIndex.length,
			categoryDistribution,
			technologyDistribution,
			yearDistribution,
		};
	}
}

// Export singleton instance
export const portfolioSearchIndexGenerator =
	new PortfolioSearchIndexGenerator();
