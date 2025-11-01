/**
 * Portfolio Integration Classes
 * Task 5.1: 他ページとの連携機能
 */

import type { PortfolioDataManager } from "./data-manager";
import type { PortfolioContentItem } from "./data-processor";

// Type definitions
export interface SearchResult {
	item: PortfolioContentItem;
	score: number;
	matchedFields: string[];
}

export interface SearchFilter {
	type: "category" | "technology" | "tag" | "year" | "projectType";
	options: Array<{
		value: string;
		label: string;
		count: number;
	}>;
}

export interface SearchIndex {
	id: string;
	title: string;
	description: string;
	content: string;
	category: string;
	tags: string[];
	searchableContent: string;
	type: string;
}

export interface SearchStats {
	totalItems: number;
	categoryDistribution: Record<string, number>;
	technologyDistribution: Record<string, number>;
	yearDistribution: Record<string, number>;
}

export interface Skill {
	name: string;
	level: number;
	category: string;
	projectCount: number;
	lastUsed: Date;
}

export interface TechnologyExperience {
	technology: string;
	yearsOfExperience: number;
	projectCount: number;
	proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
	relatedProjects: string[];
}

export interface ClientProject {
	id: string;
	title: string;
	client: string;
	category: string;
	completedAt: Date;
	technologies: string[];
	description: string;
}

export interface UpdateInfo {
	id: string;
	title: string;
	category: string;
	updatedAt: Date;
	changeType: "new" | "updated" | "featured";
}

export interface PortfolioStats {
	totalProjects: number;
	categoryCounts: Record<string, number>;
	technologyCounts: Record<string, number>;
	lastUpdate: Date;
}

export interface SitemapEntry {
	url: string;
	lastModified: Date;
	changeFrequency:
		| "always"
		| "hourly"
		| "daily"
		| "weekly"
		| "monthly"
		| "yearly"
		| "never";
	priority: number;
}

export interface MetaTags {
	title: string;
	description: string;
	keywords: string[];
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	twitterImage?: string;
}

export interface OpenGraphData {
	title: string;
	description: string;
	image: string;
	url: string;
	type: string;
	siteName: string;
}

export interface TwitterCardData {
	card: "summary" | "summary_large_image" | "app" | "player";
	title: string;
	description: string;
	image: string;
	creator?: string;
}

export interface AnalyticsEvent {
	type: string;
	itemId?: string;
	category?: string;
	action: string;
	timestamp: Date;
	metadata?: Record<string, unknown>;
}

export interface AnalyticsReport {
	summary: {
		totalViews: number;
		uniqueViews: number;
		topCategories: Array<{ category: string; views: number }>;
		topItems: Array<{ id: string; title: string; views: number }>;
	};
	timeRange: {
		start: Date;
		end: Date;
	};
	events: AnalyticsEvent[];
}

export interface PortfolioAnalytics {
	views: Record<string, number>;
	interactions: Record<string, number>;
	searchQueries: Record<string, number>;
	categoryViews: Record<string, number>;
}

/**
 * Home Page Integration
 */
export class HomePageIntegration {
	constructor(private dataManager: PortfolioDataManager) {}

	async getHomePageData() {
		const portfolioData = await this.dataManager.getPortfolioData();
		const stats = await this.dataManager.getPortfolioStats();
		const featured = await this.dataManager.getFeaturedProjects(3);

		return {
			featuredProjects: featured,
			stats,
			latestUpdates: portfolioData
				.sort(
					(a, b) =>
						new Date(b.updatedAt || b.createdAt || Date.now()).getTime() -
						new Date(a.updatedAt || a.createdAt || Date.now()).getTime(),
				)
				.slice(0, 5)
				.map((item) => ({
					id: item.id,
					title: item.title,
					category: item.category,
					updatedAt: new Date(item.updatedAt || item.createdAt || Date.now()),
				})),
		};
	}
}

/**
 * Search Integration
 */
export class SearchIntegration {
	constructor(private dataManager: PortfolioDataManager) {}

	async getSearchData() {
		const portfolioData = await this.dataManager.getPortfolioData();
		const searchFilters = await this.dataManager.getSearchFilters();

		return {
			searchableContent: portfolioData.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.description,
				content: item.content || "",
				category: item.category,
				tags: item.tags || [],
				searchableContent: item.searchIndex?.searchableContent || "",
				type: "portfolio",
			})),
			searchFilters,
		};
	}

	async searchPortfolioItems(
		query: string,
		filters: Array<{ type: string; value: string }> = [],
	): Promise<SearchResult[]> {
		const portfolioData = await this.dataManager.getPortfolioData();

		let filteredData = portfolioData;

		// Apply filters
		filters.forEach((filter) => {
			switch (filter.type) {
				case "category":
					filteredData = filteredData.filter(
						(item) => item.category === filter.value,
					);
					break;
				case "tag":
					filteredData = filteredData.filter(
						(item) =>
							item.tags?.includes(filter.value) ||
							item.technologies?.includes(filter.value),
					);
					break;
			}
		});

		// Apply search query
		if (query) {
			const searchTerm = query.toLowerCase();
			filteredData = filteredData.filter(
				(item) =>
					item.title.toLowerCase().includes(searchTerm) ||
					item.description.toLowerCase().includes(searchTerm) ||
					item.content?.toLowerCase().includes(searchTerm) ||
					item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
					item.technologies?.some((tech) =>
						tech.toLowerCase().includes(searchTerm),
					),
			);
		}

		return filteredData.map((item) => ({
			item,
			score: 1,
			matchedFields: ["title", "description"],
		}));
	}

	async getSearchFilters(): Promise<SearchFilter[]> {
		return await this.dataManager.getSearchFilters();
	}

	async getSearchStats(): Promise<SearchStats> {
		const portfolioData = await this.dataManager.getPortfolioData();

		const categoryDistribution: Record<string, number> = {};
		const technologyDistribution: Record<string, number> = {};
		const yearDistribution: Record<string, number> = {};

		portfolioData.forEach((item) => {
			// Category distribution
			if (item.category) {
				categoryDistribution[item.category] =
					(categoryDistribution[item.category] || 0) + 1;
			}

			// Technology distribution
			const technologies = item.technologies || item.tags || [];
			technologies.forEach((tech) => {
				technologyDistribution[tech] = (technologyDistribution[tech] || 0) + 1;
			});

			// Year distribution
			const year = new Date(item.createdAt || Date.now())
				.getFullYear()
				.toString();
			yearDistribution[year] = (yearDistribution[year] || 0) + 1;
		});

		return {
			totalItems: portfolioData.length,
			categoryDistribution,
			technologyDistribution,
			yearDistribution,
		};
	}

	async generateSearchIndex(): Promise<SearchIndex[]> {
		const portfolioData = await this.dataManager.getPortfolioData();

		return portfolioData.map((item) => ({
			id: item.id,
			title: item.title,
			description: item.description,
			content: item.content || "",
			category: item.category,
			tags: item.tags || [],
			searchableContent: [
				item.title,
				item.description,
				item.content || "",
				...(item.tags || []),
				...(item.technologies || []),
			]
				.join(" ")
				.toLowerCase(),
			type: "portfolio",
		}));
	}
}

/**
 * About Page Integration
 */
export class AboutIntegration {
	constructor(private dataManager: PortfolioDataManager) {}

	async getAboutData() {
		const skills = await this.extractSkillsFromProjects();
		const clientWork = await this.getClientWorkExamples();

		return {
			skillsFromProjects: skills,
			clientWork,
			summary: {
				totalProjects: skills.reduce(
					(sum, skill) => sum + skill.projectCount,
					0,
				),
				topSkills: skills.slice(0, 5),
				yearsActive: new Date().getFullYear() - 2020, // Assuming started in 2020
			},
			skills,
		};
	}

	async extractSkillsFromProjects(): Promise<Skill[]> {
		const portfolioData = await this.dataManager.getPortfolioData();
		const skillMap = new Map<string, Skill>();

		portfolioData.forEach((item) => {
			const technologies = item.technologies || item.tags || [];
			const lastUsed = new Date(item.updatedAt || item.createdAt || Date.now());

			technologies.forEach((tech) => {
				if (skillMap.has(tech)) {
					const skill = skillMap.get(tech)!;
					skill.projectCount++;
					if (lastUsed > skill.lastUsed) {
						skill.lastUsed = lastUsed;
					}
				} else {
					skillMap.set(tech, {
						name: tech,
						level: 80, // Default level
						category: this.categorizeTechnology(tech),
						projectCount: 1,
						lastUsed,
					});
				}
			});
		});

		return Array.from(skillMap.values()).sort(
			(a, b) => b.projectCount - a.projectCount,
		);
	}

	async getClientWorkExamples(): Promise<ClientProject[]> {
		const portfolioData = await this.dataManager.getPortfolioData();

		return portfolioData
			.filter(
				(item) => item.category === "develop" || item.category === "video",
			)
			.slice(0, 5)
			.map((item) => ({
				id: item.id,
				title: item.title,
				client: "Client", // Default client name
				category: item.category,
				completedAt: new Date(item.publishedAt || item.createdAt || Date.now()),
				technologies: item.technologies || item.tags || [],
				description: item.description,
			}));
	}

	async getRelevantPortfolioItems(
		category: string,
	): Promise<PortfolioContentItem[]> {
		const portfolioData = await this.dataManager.getPortfolioData();
		return portfolioData
			.filter((item) => item.category === category)
			.slice(0, 5);
	}

	private categorizeTechnology(tech: string): string {
		const techLower = tech.toLowerCase();
		if (
			["react", "vue", "angular", "javascript", "typescript"].includes(
				techLower,
			)
		) {
			return "frontend";
		}
		if (["node", "express", "python", "java", "c#"].includes(techLower)) {
			return "backend";
		}
		if (["after effects", "premiere", "davinci"].includes(techLower)) {
			return "video";
		}
		if (["photoshop", "illustrator", "figma"].includes(techLower)) {
			return "design";
		}
		return "other";
	}
}

/**
 * SEO Integration
 */
export class SEOIntegration {
	constructor(private dataManager: PortfolioDataManager) {}

	async getSitemapEntries(): Promise<SitemapEntry[]> {
		const portfolioData = await this.dataManager.getPortfolioData();

		return portfolioData.map((item) => ({
			url: `https://yusuke-kim.com/portfolio/${item.id}`,
			lastModified: new Date(item.updatedAt || item.createdAt || Date.now()),
			changeFrequency: "monthly" as const,
			priority: item.priority ? item.priority / 100 : 0.8,
		}));
	}

	async generateSitemapEntries(): Promise<SitemapEntry[]> {
		return this.getSitemapEntries();
	}

	async updateMetaTags(
		pageType: string,
		data: Record<string, unknown>,
	): Promise<MetaTags> {
		const baseTitle = "samuido | ポートフォリオ";
		const baseDescription = "Web開発、ゲーム開発、映像制作、デザインの作品集";

		switch (pageType) {
			case "detail": {
				const item = data.item as PortfolioContentItem;
				return {
					title: `${item.title} - ${baseTitle}`,
					description: item.description,
					keywords: item.tags || [],
					ogTitle: item.title,
					ogDescription: item.description,
					ogImage: item.thumbnail || item.images?.[0],
				};
			}
			case "gallery": {
				const galleryType = data.galleryType as string;
				return {
					title: `${galleryType} Gallery - ${baseTitle}`,
					description: `${galleryType}カテゴリの作品一覧`,
					keywords: [galleryType, "ポートフォリオ", "作品集"],
				};
			}
			default:
				return {
					title: baseTitle,
					description: baseDescription,
					keywords: ["ポートフォリオ", "作品集", "samuido"],
				};
		}
	}

	async generateStructuredData(
		item: PortfolioContentItem,
	): Promise<Record<string, unknown>> {
		return {
			"@context": "https://schema.org",
			"@type": "CreativeWork",
			name: item.title,
			description: item.description,
			creator: {
				"@type": "Person",
				name: "木村友亮",
				alternateName: "samuido",
			},
			dateCreated: item.createdAt,
			dateModified: item.updatedAt,
			url: `https://yusuke-kim.com/portfolio/${item.id}`,
		};
	}

	async generateNextSitemap(): Promise<
		Array<{ url: string; lastModified: Date }>
	> {
		const entries = await this.getSitemapEntries();
		return entries.map((entry) => ({
			url: entry.url,
			lastModified: entry.lastModified,
		}));
	}
}

/**
 * Analytics Integration
 */
export class AnalyticsIntegration {
	private events: AnalyticsEvent[] = [];

	constructor(private dataManager: PortfolioDataManager) {}

	trackPortfolioView(
		itemId: string,
		additionalData?: Record<string, unknown>,
	): void {
		this.events.push({
			type: "view",
			itemId,
			action: "portfolio_view",
			timestamp: new Date(),
			metadata: additionalData,
		});
	}

	trackGalleryInteraction(
		galleryType: string,
		action: string,
		itemId?: string,
	): void {
		this.events.push({
			type: "interaction",
			category: galleryType,
			itemId,
			action,
			timestamp: new Date(),
		});
	}

	async generatePortfolioReport(
		startDate?: Date,
		endDate?: Date,
	): Promise<AnalyticsReport> {
		const filteredEvents = this.events.filter((event) => {
			if (startDate && event.timestamp < startDate) return false;
			if (endDate && event.timestamp > endDate) return false;
			return true;
		});

		const viewEvents = filteredEvents.filter((event) => event.type === "view");
		const uniqueViews = new Set(viewEvents.map((event) => event.itemId)).size;

		const categoryViews: Record<string, number> = {};
		const itemViews: Record<string, number> = {};

		viewEvents.forEach((event) => {
			if (event.category) {
				categoryViews[event.category] =
					(categoryViews[event.category] || 0) + 1;
			}
			if (event.itemId) {
				itemViews[event.itemId] = (itemViews[event.itemId] || 0) + 1;
			}
		});

		const portfolioData = await this.dataManager.getPortfolioData();
		const topItems = Object.entries(itemViews)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([id, views]) => {
				const item = portfolioData.find((p) => p.id === id);
				return {
					id,
					title: item?.title || "Unknown",
					views,
				};
			});

		return {
			summary: {
				totalViews: viewEvents.length,
				uniqueViews,
				topCategories: Object.entries(categoryViews)
					.sort(([, a], [, b]) => b - a)
					.slice(0, 5)
					.map(([category, views]) => ({ category, views })),
				topItems,
			},
			timeRange: {
				start: startDate || new Date(0),
				end: endDate || new Date(),
			},
			events: filteredEvents,
		};
	}
}
