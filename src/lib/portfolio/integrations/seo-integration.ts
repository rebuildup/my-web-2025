import type { MetadataRoute } from "next";
import type { PortfolioContentItem } from "@/types/portfolio";
import type { PortfolioDataManager } from "../data-manager";

export interface SitemapEntry {
	url: string;
	lastModified: Date;
	changeFrequency: "weekly" | "monthly" | "yearly";
	priority: number;
}

export interface MetaTags {
	title: string;
	description: string;
	keywords: string[];
	canonical: string;
	openGraph: OpenGraphData;
	twitter: TwitterCardData;
	structuredData: object;
}

export interface OpenGraphData {
	title: string;
	description: string;
	type: string;
	url: string;
	image: string;
	siteName: string;
	locale: string;
}

export interface TwitterCardData {
	card: "summary" | "summary_large_image";
	title: string;
	description: string;
	image: string;
	creator: string;
}

/**
 * SEO・サイトマップとの連携機能を提供するクラス
 * ポートフォリオページのSEO最適化とサイトマップ生成を実装
 */
export class SEOIntegration {
	private dataManager: PortfolioDataManager;
	private baseUrl: string;

	constructor(
		dataManager: PortfolioDataManager,
		baseUrl = "https://yusuke-kim.com",
	) {
		this.dataManager = dataManager;
		this.baseUrl = baseUrl;
	}

	/**
	 * サイトマップエントリを生成
	 */
	async generateSitemapEntries(): Promise<SitemapEntry[]> {
		try {
			const allItems = await this.dataManager.getAllItems();
			const publishedItems = allItems.filter(
				(item) => item.status === "published",
			);

			const entries: SitemapEntry[] = [];

			// 静的ポートフォリオページ
			const staticPages = [
				{
					url: "/portfolio",
					priority: 1.0,
					changeFrequency: "weekly" as const,
				},
				{
					url: "/portfolio/gallery/all",
					priority: 0.9,
					changeFrequency: "weekly" as const,
				},
				{
					url: "/portfolio/gallery/develop",
					priority: 0.8,
					changeFrequency: "weekly" as const,
				},
				{
					url: "/portfolio/gallery/video",
					priority: 0.8,
					changeFrequency: "weekly" as const,
				},
				{
					url: "/portfolio/gallery/video&design",
					priority: 0.8,
					changeFrequency: "weekly" as const,
				},
				{
					url: "/portfolio/detail/develop",
					priority: 0.7,
					changeFrequency: "monthly" as const,
				},
				{
					url: "/portfolio/detail/video",
					priority: 0.7,
					changeFrequency: "monthly" as const,
				},
				{
					url: "/portfolio/detail/video&design",
					priority: 0.7,
					changeFrequency: "monthly" as const,
				},
				{
					url: "/portfolio/playground/design",
					priority: 0.6,
					changeFrequency: "monthly" as const,
				},
				{
					url: "/portfolio/playground/WebGL",
					priority: 0.6,
					changeFrequency: "monthly" as const,
				},
			];

			staticPages.forEach((page) => {
				entries.push({
					url: `${this.baseUrl}${page.url}`,
					lastModified: new Date(),
					changeFrequency: page.changeFrequency,
					priority: page.priority,
				});
			});

			// 動的ポートフォリオ詳細ページ
			publishedItems.forEach((item) => {
				entries.push({
					url: `${this.baseUrl}/portfolio/${item.id}`,
					lastModified: new Date(item.updatedAt || item.createdAt),
					changeFrequency: "monthly",
					priority: this.calculateItemPriority(item),
				});
			});

			return entries.sort((a, b) => b.priority - a.priority);
		} catch (error) {
			console.error("Error generating sitemap entries:", error);
			return [];
		}
	}

	/**
	 * Next.js sitemap.ts用のデータを生成
	 */
	async generateNextSitemap(): Promise<MetadataRoute.Sitemap> {
		const entries = await this.generateSitemapEntries();

		return entries.map((entry) => ({
			url: entry.url,
			lastModified: entry.lastModified,
			changeFrequency: entry.changeFrequency,
			priority: entry.priority,
		}));
	}

	/**
	 * Generate sitemap entries for sitemap-generator integration
	 */
	async generatePortfolioSitemapEntries(): Promise<
		Array<{
			url: string;
			lastModified?: Date;
			changeFrequency?:
				| "always"
				| "hourly"
				| "daily"
				| "weekly"
				| "monthly"
				| "yearly"
				| "never";
			priority?: number;
		}>
	> {
		const entries = await this.generateSitemapEntries();
		return entries.map((entry) => ({
			url: entry.url.replace(this.baseUrl, ""), // Remove base URL for sitemap-generator
			lastModified: entry.lastModified,
			changeFrequency: entry.changeFrequency,
			priority: entry.priority,
		}));
	}

	/**
	 * ページタイプに応じたメタタグを生成
	 */
	async updateMetaTags(
		pageType: string,
		data: Record<string, unknown>,
	): Promise<MetaTags> {
		try {
			switch (pageType) {
				case "portfolio-top":
					return this.generatePortfolioTopMeta();
				case "gallery":
					return this.generateGalleryMeta(data.category as string);
				case "detail":
					return this.generateDetailMeta(data.item as PortfolioContentItem);
				case "playground":
					return this.generatePlaygroundMeta(data.type as string);
				default:
					return this.generateDefaultMeta();
			}
		} catch (error) {
			console.error("Error updating meta tags:", error);
			return this.generateDefaultMeta();
		}
	}

	/**
	 * ポートフォリオアイテムの構造化データを生成
	 */
	async generateStructuredData(item: PortfolioContentItem): Promise<object> {
		try {
			const baseStructuredData = {
				"@context": "https://schema.org",
				"@type": "CreativeWork",
				name: item.title,
				description: item.description,
				creator: {
					"@type": "Person",
					name: "木村友亮",
					url: this.baseUrl,
					sameAs: ["https://github.com/samuido", "https://twitter.com/samuido"],
				},
				dateCreated: item.createdAt,
				dateModified: item.updatedAt,
				url: `${this.baseUrl}/portfolio/${item.id}`,
				image: item.thumbnail || item.images?.[0],
				keywords: [...(item.tags || []), ...(item.technologies || [])].join(
					", ",
				),
			};

			// カテゴリ別の追加データ
			switch (item.category) {
				case "develop":
					return {
						...baseStructuredData,
						"@type": "SoftwareApplication",
						applicationCategory: "WebApplication",
						programmingLanguage: item.technologies,
						codeRepository: item.repository?.url,
					};

				case "video":
					return {
						...baseStructuredData,
						"@type": "VideoObject",
						duration: item.duration ? `PT${item.duration}S` : undefined,
						embedUrl: item.videos?.[0]?.url,
						uploadDate: item.createdAt,
					};

				case "design":
					return {
						...baseStructuredData,
						"@type": "VisualArtwork",
						artMedium: "Digital Design",
						artworkSurface: "Digital",
					};

				default:
					return baseStructuredData;
			}
		} catch (error) {
			console.error("Error generating structured data:", error);
			return {};
		}
	}

	/**
	 * ポートフォリオトップページのメタデータ
	 */
	private async generatePortfolioTopMeta(): Promise<MetaTags> {
		const stats = await this.getPortfolioStats();

		return {
			title: "ポートフォリオ | samuido - 木村友亮",
			description: `Web開発、映像制作、デザインの作品を紹介.${stats.totalProjects}件のプロジェクトを掲載中.React、Next.js、Unity、After Effectsなどを使用した多様な制作実績をご覧ください.`,
			keywords: [
				"ポートフォリオ",
				"Web開発",
				"映像制作",
				"デザイン",
				"React",
				"Next.js",
				"Unity",
				"After Effects",
			],
			canonical: `${this.baseUrl}/portfolio`,
			openGraph: {
				title: "ポートフォリオ | samuido",
				description: `Web開発、映像制作、デザインの作品集（${stats.totalProjects}件掲載）`,
				type: "website",
				url: `${this.baseUrl}/portfolio`,
				image: `${this.baseUrl}/images/portfolio-og.jpg`,
				siteName: "samuido",
				locale: "ja_JP",
			},
			twitter: {
				card: "summary_large_image",
				title: "ポートフォリオ | samuido",
				description: `Web開発、映像制作、デザインの作品集（${stats.totalProjects}件掲載）`,
				image: `${this.baseUrl}/images/portfolio-twitter.jpg`,
				creator: "@samuido",
			},
			structuredData: {
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: "ポートフォリオ",
				description: "Web開発、映像制作、デザインの作品集",
				mainEntity: {
					"@type": "ItemList",
					numberOfItems: stats.totalProjects,
				},
			},
		};
	}

	/**
	 * ギャラリーページのメタデータ
	 */
	private async generateGalleryMeta(category: string): Promise<MetaTags> {
		const categoryInfo = this.getCategoryInfo(category);
		const items = await this.dataManager.getItemsByCategory(category);

		return {
			title: `${categoryInfo.title} | ポートフォリオ | samuido`,
			description: `${categoryInfo.description}の作品一覧（${items.length}件）.${categoryInfo.keywords.join("、")}などの技術を使用した制作実績をご覧ください.`,
			keywords: [
				"ポートフォリオ",
				categoryInfo.title,
				...categoryInfo.keywords,
			],
			canonical: `${this.baseUrl}/portfolio/gallery/${category}`,
			openGraph: {
				title: `${categoryInfo.title} | ポートフォリオ`,
				description: `${categoryInfo.description}の作品一覧（${items.length}件掲載）`,
				type: "website",
				url: `${this.baseUrl}/portfolio/gallery/${category}`,
				image: `${this.baseUrl}/images/portfolio-${category}-og.jpg`,
				siteName: "samuido",
				locale: "ja_JP",
			},
			twitter: {
				card: "summary_large_image",
				title: `${categoryInfo.title} | ポートフォリオ`,
				description: `${categoryInfo.description}の作品一覧（${items.length}件掲載）`,
				image: `${this.baseUrl}/images/portfolio-${category}-twitter.jpg`,
				creator: "@samuido",
			},
			structuredData: {
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: `${categoryInfo.title}ポートフォリオ`,
				description: categoryInfo.description,
				mainEntity: {
					"@type": "ItemList",
					numberOfItems: items.length,
				},
			},
		};
	}

	/**
	 * 詳細ページのメタデータ
	 */
	private async generateDetailMeta(
		item: PortfolioContentItem,
	): Promise<MetaTags> {
		return {
			title: `${item.title} | ポートフォリオ | samuido`,
			description: item.description,
			keywords: [
				item.title,
				item.category,
				...(item.tags || []),
				...(item.technologies || []),
			],
			canonical: `${this.baseUrl}/portfolio/${item.id}`,
			openGraph: {
				title: item.title,
				description: item.description,
				type: "article",
				url: `${this.baseUrl}/portfolio/${item.id}`,
				image:
					item.thumbnail ||
					item.images?.[0] ||
					`${this.baseUrl}/images/default-og.jpg`,
				siteName: "samuido",
				locale: "ja_JP",
			},
			twitter: {
				card: "summary_large_image",
				title: item.title,
				description: item.description,
				image:
					item.thumbnail ||
					item.images?.[0] ||
					`${this.baseUrl}/images/default-twitter.jpg`,
				creator: "@samuido",
			},
			structuredData: await this.generateStructuredData(item),
		};
	}

	/**
	 * プレイグラウンドページのメタデータ
	 */
	private async generatePlaygroundMeta(type: string): Promise<MetaTags> {
		const playgroundInfo = this.getPlaygroundInfo(type);

		return {
			title: `${playgroundInfo.title} | ポートフォリオ | samuido`,
			description: playgroundInfo.description,
			keywords: [
				"ポートフォリオ",
				"プレイグラウンド",
				playgroundInfo.title,
				...playgroundInfo.keywords,
			],
			canonical: `${this.baseUrl}/portfolio/playground/${type}`,
			openGraph: {
				title: `${playgroundInfo.title} | プレイグラウンド`,
				description: playgroundInfo.description,
				type: "website",
				url: `${this.baseUrl}/portfolio/playground/${type}`,
				image: `${this.baseUrl}/images/playground-${type}-og.jpg`,
				siteName: "samuido",
				locale: "ja_JP",
			},
			twitter: {
				card: "summary_large_image",
				title: `${playgroundInfo.title} | プレイグラウンド`,
				description: playgroundInfo.description,
				image: `${this.baseUrl}/images/playground-${type}-twitter.jpg`,
				creator: "@samuido",
			},
			structuredData: {
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: `${playgroundInfo.title}プレイグラウンド`,
				description: playgroundInfo.description,
			},
		};
	}

	/**
	 * デフォルトメタデータ
	 */
	private generateDefaultMeta(): MetaTags {
		return {
			title: "ポートフォリオ | samuido",
			description: "Web開発、映像制作、デザインの作品集",
			keywords: ["ポートフォリオ", "Web開発", "映像制作", "デザイン"],
			canonical: `${this.baseUrl}/portfolio`,
			openGraph: {
				title: "ポートフォリオ | samuido",
				description: "Web開発、映像制作、デザインの作品集",
				type: "website",
				url: `${this.baseUrl}/portfolio`,
				image: `${this.baseUrl}/images/default-og.jpg`,
				siteName: "samuido",
				locale: "ja_JP",
			},
			twitter: {
				card: "summary_large_image",
				title: "ポートフォリオ | samuido",
				description: "Web開発、映像制作、デザインの作品集",
				image: `${this.baseUrl}/images/default-twitter.jpg`,
				creator: "@samuido",
			},
			structuredData: {},
		};
	}

	/**
	 * アイテムの優先度を計算
	 */
	private calculateItemPriority(item: PortfolioContentItem): number {
		let priority = 0.5; // ベース優先度

		// 優先度設定がある場合
		if (item.priority) {
			priority += item.priority * 0.05; // 0-10 → 0-0.5
		}

		// 最近更新されたアイテムは優先度を上げる
		const daysSinceUpdate =
			(Date.now() - new Date(item.updatedAt || item.createdAt).getTime()) /
			(1000 * 60 * 60 * 24);
		if (daysSinceUpdate < 30) priority += 0.1;
		if (daysSinceUpdate < 7) priority += 0.1;

		// クライアントワークは優先度を上げる
		if (item.client) priority += 0.1;

		return Math.min(priority, 0.9); // 最大0.9
	}

	/**
	 * カテゴリ情報を取得
	 */
	private getCategoryInfo(category: string) {
		const categoryMap: Record<
			string,
			{ title: string; description: string; keywords: string[] }
		> = {
			all: {
				title: "全作品",
				description: "Web開発、映像制作、デザインの全作品",
				keywords: ["Web開発", "映像制作", "デザイン", "React", "After Effects"],
			},
			develop: {
				title: "開発",
				description: "Webアプリケーション、ゲーム、ツール開発",
				keywords: ["React", "Next.js", "TypeScript", "Unity", "C#"],
			},
			video: {
				title: "映像",
				description: "ミュージックビデオ、アニメーション、プロモーション映像",
				keywords: [
					"After Effects",
					"Premiere Pro",
					"Cinema 4D",
					"モーショングラフィックス",
				],
			},
			"video&design": {
				title: "映像・デザイン",
				description: "映像制作とデザインを組み合わせた作品",
				keywords: ["デザイン", "映像", "グラフィック", "ブランディング"],
			},
		};

		return categoryMap[category] || categoryMap.all;
	}

	/**
	 * プレイグラウンド情報を取得
	 */
	private getPlaygroundInfo(type: string) {
		const playgroundMap: Record<
			string,
			{ title: string; description: string; keywords: string[] }
		> = {
			design: {
				title: "デザイン実験",
				description: "インタラクティブデザインとアニメーションの実験場",
				keywords: ["インタラクティブ", "アニメーション", "CSS", "JavaScript"],
			},
			WebGL: {
				title: "WebGL実験",
				description: "3Dグラフィックスとシェーダーの実験場",
				keywords: ["WebGL", "Three.js", "3D", "シェーダー", "GLSL"],
			},
		};

		return playgroundMap[type] || playgroundMap.design;
	}

	/**
	 * ポートフォリオ統計を取得
	 */
	private async getPortfolioStats() {
		try {
			const allItems = await this.dataManager.getAllItems();
			const publishedItems = allItems.filter(
				(item) => item.status === "published",
			);

			return {
				totalProjects: publishedItems.length,
				categories: [...new Set(publishedItems.map((item) => item.category))]
					.length,
				technologies: [
					...new Set(publishedItems.flatMap((item) => item.technologies || [])),
				].length,
			};
		} catch {
			return { totalProjects: 0, categories: 0, technologies: 0 };
		}
	}
}
