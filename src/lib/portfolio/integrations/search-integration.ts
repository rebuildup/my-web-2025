import type { PortfolioContentItem } from "@/types/portfolio";
import type { PortfolioDataManager } from "../data-manager";

export interface SearchIndex {
	id: string;
	type: "portfolio";
	title: string;
	description: string;
	content: string;
	tags: string[];
	category: string;
	technologies?: string[];
	searchableText: string;
	url: string;
	thumbnail: string;
	priority: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface SearchFilter {
	type: "category" | "technology" | "tag" | "year";
	label: string;
	value: string;
	count: number;
}

export interface SearchResult {
	item: SearchIndex;
	score: number;
	matchedFields: string[];
	highlights: string[];
}

/**
 * 検索ページとの連携機能を提供するクラス
 * ポートフォリオアイテムを検索対象に含める機能を実装
 */
export class SearchIntegration {
	private dataManager: PortfolioDataManager;

	constructor(dataManager: PortfolioDataManager) {
		this.dataManager = dataManager;
	}

	/**
	 * ポートフォリオアイテムから検索インデックスを生成
	 */
	async generateSearchIndex(): Promise<SearchIndex[]> {
		try {
			const allItems = await this.dataManager.getAllItems();
			const publishedItems = allItems.filter(
				(item) => item.status === "published",
			);

			return publishedItems.map((item) => this.createSearchIndex(item));
		} catch (error) {
			console.error("Error generating search index:", error);
			return [];
		}
	}

	/**
	 * 個別アイテムから検索インデックスを作成
	 */
	private createSearchIndex(item: PortfolioContentItem): SearchIndex {
		// 検索可能なテキストを結合
		const searchableText = [
			item.title,
			item.description,
			item.content,
			...(item.tags || []),
			...(item.technologies || []),
			item.category,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();

		return {
			id: item.id,
			type: "portfolio",
			title: item.title,
			description: item.description,
			content: item.content || "",
			tags: item.tags || [],
			category: item.category,
			technologies: item.technologies,
			searchableText,
			url: `/portfolio/${item.id}`,
			thumbnail:
				item.thumbnail || item.images?.[0] || "/default-portfolio-thumb.jpg",
			priority: item.priority || 0,
			createdAt: new Date(item.createdAt),
			updatedAt: new Date(item.updatedAt || item.createdAt),
		};
	}

	/**
	 * 検索用フィルターオプションを生成
	 */
	async getSearchFilters(): Promise<SearchFilter[]> {
		try {
			const allItems = await this.dataManager.getAllItems();
			const publishedItems = allItems.filter(
				(item) => item.status === "published",
			);

			const filters: SearchFilter[] = [];

			// カテゴリフィルター
			const categoryCount: Record<string, number> = {};
			publishedItems.forEach((item) => {
				categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
			});

			Object.entries(categoryCount).forEach(([category, count]) => {
				filters.push({
					type: "category",
					label: this.getCategoryLabel(category),
					value: category,
					count,
				});
			});

			// 技術フィルター
			const technologyCount: Record<string, number> = {};
			publishedItems.forEach((item) => {
				if (item.technologies) {
					item.technologies.forEach((tech: string) => {
						technologyCount[tech] = (technologyCount[tech] || 0) + 1;
					});
				}
			});

			Object.entries(technologyCount).forEach(([tech, count]) => {
				filters.push({
					type: "technology",
					label: tech,
					value: tech,
					count,
				});
			});

			// タグフィルター
			const tagCount: Record<string, number> = {};
			publishedItems.forEach((item) => {
				if (item.tags) {
					item.tags.forEach((tag: string) => {
						tagCount[tag] = (tagCount[tag] || 0) + 1;
					});
				}
			});

			Object.entries(tagCount).forEach(([tag, count]) => {
				filters.push({
					type: "tag",
					label: tag,
					value: tag,
					count,
				});
			});

			// 年別フィルター
			const yearCount: Record<string, number> = {};
			publishedItems.forEach((item) => {
				const year = new Date(item.createdAt).getFullYear().toString();
				yearCount[year] = (yearCount[year] || 0) + 1;
			});

			Object.entries(yearCount).forEach(([year, count]) => {
				filters.push({
					type: "year",
					label: `${year}年`,
					value: year,
					count,
				});
			});

			return filters.sort((a, b) => b.count - a.count);
		} catch (error) {
			console.error("Error generating search filters:", error);
			return [];
		}
	}

	/**
	 * ポートフォリオアイテムを検索
	 */
	async searchPortfolioItems(
		query: string,
		filters: { type: string; value: string }[] = [],
	): Promise<SearchResult[]> {
		try {
			const searchIndex = await this.generateSearchIndex();
			let filteredItems = searchIndex;

			// フィルター適用
			if (filters.length > 0) {
				filteredItems = searchIndex.filter((item) => {
					return filters.every((filter) => {
						switch (filter.type) {
							case "category":
								return item.category === filter.value;
							case "technology":
								return item.technologies?.includes(filter.value);
							case "tag":
								return item.tags.includes(filter.value);
							case "year":
								return (
									new Date(item.createdAt).getFullYear().toString() ===
									filter.value
								);
							default:
								return true;
						}
					});
				});
			}

			// クエリが空の場合は全件を優先度順で返す
			if (!query.trim()) {
				return filteredItems
					.sort((a, b) => b.priority - a.priority)
					.map((item) => ({
						item,
						score: 1,
						matchedFields: [],
						highlights: [],
					}));
			}

			// 検索実行
			const queryLower = query.toLowerCase();
			const results: SearchResult[] = [];

			filteredItems.forEach((item) => {
				const matchedFields: string[] = [];
				const highlights: string[] = [];
				let score = 0;

				// タイトルマッチ（高スコア）
				if (item.title.toLowerCase().includes(queryLower)) {
					score += 10;
					matchedFields.push("title");
					highlights.push(this.highlightMatch(item.title, query));
				}

				// 説明マッチ（中スコア）
				if (item.description.toLowerCase().includes(queryLower)) {
					score += 5;
					matchedFields.push("description");
					highlights.push(this.highlightMatch(item.description, query));
				}

				// タグマッチ（中スコア）
				item.tags.forEach((tag) => {
					if (tag.toLowerCase().includes(queryLower)) {
						score += 3;
						matchedFields.push("tags");
						highlights.push(tag);
					}
				});

				// 技術マッチ（中スコア）
				if (item.technologies) {
					item.technologies.forEach((tech: string) => {
						if (tech.toLowerCase().includes(queryLower)) {
							score += 3;
							matchedFields.push("technologies");
							highlights.push(tech);
						}
					});
				}

				// コンテンツマッチ（低スコア）
				if (item.content.toLowerCase().includes(queryLower)) {
					score += 1;
					matchedFields.push("content");
				}

				// Only add items that have actual text matches
				if (score > 0) {
					// 優先度ボーナス
					score += item.priority * 0.1;
					results.push({
						item,
						score,
						matchedFields,
						highlights: highlights.slice(0, 3), // 最大3つのハイライト
					});
				}
			});

			return results.sort((a, b) => b.score - a.score);
		} catch (error) {
			console.error("Error searching portfolio items:", error);
			return [];
		}
	}

	/**
	 * 検索結果のハイライト生成
	 */
	private highlightMatch(text: string, query: string): string {
		const regex = new RegExp(`(${query})`, "gi");
		return text.replace(regex, "<mark>$1</mark>");
	}

	/**
	 * カテゴリの表示名を取得
	 */
	private getCategoryLabel(category: string): string {
		const categoryLabels: Record<string, string> = {
			develop: "開発",
			video: "映像",
			"video&design": "映像・デザイン",
			design: "デザイン",
			game: "ゲーム",
			tool: "ツール",
		};

		return categoryLabels[category] || category;
	}

	/**
	 * 検索統計情報を取得
	 */
	async getSearchStats() {
		try {
			const searchIndex = await this.generateSearchIndex();
			const filters = await this.getSearchFilters();

			return {
				totalItems: searchIndex.length,
				categories: filters.filter((f) => f.type === "category").length,
				technologies: filters.filter((f) => f.type === "technology").length,
				tags: filters.filter((f) => f.type === "tag").length,
				lastIndexed: new Date(),
			};
		} catch (error) {
			console.error("Error getting search stats:", error);
			return {
				totalItems: 0,
				categories: 0,
				technologies: 0,
				tags: 0,
				lastIndexed: new Date(),
			};
		}
	}
}
