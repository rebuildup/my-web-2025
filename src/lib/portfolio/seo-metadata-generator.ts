/**
 * Portfolio SEO Metadata Generator
 * Generates dynamic SEO metadata, structured data, OpenGraph, and Twitter Cards
 * for all portfolio pages with proper optimization
 */

import type { Metadata } from "next";
import type { PortfolioContentItem } from "@/types/portfolio";
import type { PortfolioDataManager } from "./data-manager";

export interface PortfolioSEOConfig {
	baseUrl: string;
	siteName: string;
	twitterHandle: string;
	defaultImage: string;
	locale: string;
}

export interface PortfolioPageMetadata {
	metadata: Metadata;
	structuredData: object;
}

export interface CategoryInfo {
	title: string;
	description: string;
	keywords: string[];
	image: string;
}

export interface PlaygroundInfo {
	title: string;
	description: string;
	keywords: string[];
	image: string;
	features: string[];
}

/**
 * Portfolio SEO Metadata Generator Class
 */
export class PortfolioSEOMetadataGenerator {
	private config: PortfolioSEOConfig;
	private dataManager: PortfolioDataManager;

	constructor(
		dataManager: PortfolioDataManager,
		config: Partial<PortfolioSEOConfig> = {},
	) {
		this.dataManager = dataManager;
		this.config = {
			baseUrl: "https://yusuke-kim.com",
			siteName: "samuido",
			twitterHandle: "@361do_sleep",
			defaultImage: "/images/portfolio-og-default.jpg",
			locale: "ja_JP",
			...config,
		};
	}

	/**
	 * Generate metadata for portfolio top page
	 */
	async generatePortfolioTopMetadata(): Promise<PortfolioPageMetadata> {
		try {
			const stats = await this.dataManager.getPortfolioStats();
			const featuredProjects = await this.dataManager.getFeaturedProjects(3);

			const title = "Portfolio - samuido | 作品集・開発・映像・デザイン";
			const description = `samuidoの作品集.Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介.${stats.totalProjects}件のプロジェクトを掲載中.技術スタックと制作プロセスも掲載.`;

			const keywords = [
				"ポートフォリオ",
				"作品集",
				"Web開発",
				"ゲーム開発",
				"映像制作",
				"デザイン",
				"React",
				"Unity",
				"AfterEffects",
				"samuido",
				"木村友亮",
				...Object.keys(stats.technologyCounts || {}).slice(0, 10),
			];

			const metadata: Metadata = {
				title,
				description,
				keywords,
				robots: "index, follow",
				alternates: {
					canonical: `${this.config.baseUrl}/portfolio`,
				},
				openGraph: {
					title,
					description,
					type: "website",
					url: `${this.config.baseUrl}/portfolio`,
					images: [
						{
							url: `${this.config.baseUrl}/images/portfolio-og-main.jpg`,
							width: 1200,
							height: 630,
							alt: "Portfolio - samuido",
						},
					],
					siteName: this.config.siteName,
					locale: this.config.locale,
				},
				twitter: {
					card: "summary_large_image",
					title,
					description,
					images: [`${this.config.baseUrl}/images/portfolio-twitter-main.jpg`],
					creator: this.config.twitterHandle,
				},
			};

			const structuredData = {
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: "samuido Portfolio",
				description: "Web開発、ゲーム開発、映像制作、デザインの作品集",
				url: `${this.config.baseUrl}/portfolio`,
				creator: {
					"@type": "Person",
					name: "木村友亮",
					alternateName: "samuido",
					url: this.config.baseUrl,
					sameAs: [
						"https://github.com/samuido",
						"https://twitter.com/361do_sleep",
					],
				},
				mainEntity: {
					"@type": "ItemList",
					numberOfItems: stats.totalProjects,
					itemListElement: featuredProjects.map((project, index) => ({
						"@type": "ListItem",
						position: index + 1,
						item: {
							"@type": "CreativeWork",
							name: project.title,
							description: project.description,
							url: `${this.config.baseUrl}/portfolio/${project.id}`,
							image: project.thumbnail,
							creator: {
								"@type": "Person",
								name: "木村友亮",
							},
						},
					})),
				},
				genre: [
					"Web Development",
					"Game Development",
					"Video Production",
					"Design",
				],
				workExample: this.generateWorkExamples(featuredProjects),
			};

			return { metadata, structuredData };
		} catch (error) {
			console.error("Error generating portfolio top metadata:", error);
			return this.generateFallbackMetadata();
		}
	}

	/**
	 * Generate metadata for gallery pages
	 */
	async generateGalleryMetadata(
		category: string,
	): Promise<PortfolioPageMetadata> {
		try {
			// Check if dataManager is properly initialized
			if (
				!this.dataManager ||
				typeof this.dataManager.getPortfolioItemsByCategory !== "function"
			) {
				throw new Error("PortfolioDataManager is not properly initialized");
			}

			const categoryInfo = this.getCategoryInfo(category);
			const items =
				await this.dataManager.getPortfolioItemsByCategory(category);

			const title =
				category === "all"
					? "All Projects | ポートフォリオ | samuido"
					: `${categoryInfo.title} | ポートフォリオ | samuido`;
			const description = `${categoryInfo.description}の作品一覧（${items.length}件）.${categoryInfo.keywords.join("、")}などの技術を使用した制作実績をご覧ください.`;

			const metadata: Metadata = {
				title,
				description,
				keywords: [
					"ポートフォリオ",
					categoryInfo.title,
					...categoryInfo.keywords,
					"samuido",
				],
				robots: "index, follow",
				alternates: {
					canonical: `${this.config.baseUrl}/portfolio/gallery/${category}`,
				},
				openGraph: {
					title: `${categoryInfo.title} | ポートフォリオ`,
					description: `${categoryInfo.description}の作品一覧（${items.length}件掲載）`,
					type: "website",
					url: `${this.config.baseUrl}/portfolio/gallery/${category}`,
					images: [
						{
							url: `${this.config.baseUrl}${categoryInfo.image}`,
							width: 1200,
							height: 630,
							alt: `${categoryInfo.title} Portfolio`,
						},
					],
					siteName: this.config.siteName,
					locale: this.config.locale,
				},
				twitter: {
					card: "summary_large_image",
					title: `${categoryInfo.title} | ポートフォリオ`,
					description: `${categoryInfo.description}の作品一覧（${items.length}件掲載）`,
					images: [`${this.config.baseUrl}${categoryInfo.image}`],
					creator: this.config.twitterHandle,
				},
			};

			const structuredData = {
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: `${categoryInfo.title}ポートフォリオ`,
				description: categoryInfo.description,
				url: `${this.config.baseUrl}/portfolio/gallery/${category}`,
				mainEntity: {
					"@type": "ItemList",
					numberOfItems: items.length,
					itemListElement: items.slice(0, 10).map((item, index) => ({
						"@type": "ListItem",
						position: index + 1,
						item: this.generateItemStructuredData(item),
					})),
				},
				breadcrumb: {
					"@type": "BreadcrumbList",
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: this.config.baseUrl,
						},
						{
							"@type": "ListItem",
							position: 2,
							name: "Portfolio",
							item: `${this.config.baseUrl}/portfolio`,
						},
						{
							"@type": "ListItem",
							position: 3,
							name: categoryInfo.title,
							item: `${this.config.baseUrl}/portfolio/gallery/${category}`,
						},
					],
				},
			};

			return { metadata, structuredData };
		} catch (error) {
			console.error(
				`Error generating gallery metadata for ${category}:`,
				error,
			);
			return this.generateFallbackMetadata();
		}
	}

	/**
	 * Generate metadata for portfolio detail pages
	 */
	async generateDetailMetadata(
		item: PortfolioContentItem,
	): Promise<PortfolioPageMetadata> {
		try {
			const title = `${item.title} | ポートフォリオ | samuido`;
			const description = item.description;
			const keywords = [
				item.title,
				item.category,
				...(item.tags || []),
				...(item.technologies || []),
				"samuido",
				"ポートフォリオ",
			];

			const metadata: Metadata = {
				title,
				description,
				keywords,
				robots: "index, follow",
				alternates: {
					canonical: `${this.config.baseUrl}/portfolio/${item.id}`,
				},
				openGraph: {
					title: item.title,
					description: item.description,
					type: "article",
					url: `${this.config.baseUrl}/portfolio/${item.id}`,
					images: [
						{
							url: `${this.config.baseUrl}/api/og?title=${encodeURIComponent(
								item.title,
							)}&category=${encodeURIComponent(item.category)}&tags=${encodeURIComponent(
								(item.tags || []).join(","),
							)}`,
							width: 1200,
							height: 630,
							alt: item.title,
						},
					],
					siteName: this.config.siteName,
					locale: this.config.locale,
					publishedTime: item.createdAt,
					modifiedTime: item.updatedAt,
					authors: ["木村友亮"],
					tags: [...(item.tags || []), ...(item.technologies || [])],
				},
				twitter: {
					card: "summary_large_image",
					title: item.title,
					description: item.description,
					images: [
						`${this.config.baseUrl}/api/og?title=${encodeURIComponent(
							item.title,
						)}&category=${encodeURIComponent(item.category)}&tags=${encodeURIComponent(
							(item.tags || []).join(","),
						)}`,
					],
					creator: this.config.twitterHandle,
					// Custom Twitter Data (Type assertion needed for TS)
					// @ts-ignore
					label1: "Category",
					data1: item.category,
					label2: "Top Tech",
					data2: (item.technologies || [])[0] || (item.tags || [])[0] || "N/A",
				},
				other: {
					"theme-color": this.getCategoryThemeColor(item.category),
				},
			};

			const structuredData = this.generateItemStructuredData(item);

			return { metadata, structuredData };
		} catch (error) {
			console.error(`Error generating detail metadata for ${item.id}:`, error);
			return this.generateFallbackMetadata();
		}
	}

	/**
	 * Generate metadata for playground pages
	 */
	async generatePlaygroundMetadata(
		type: string,
	): Promise<PortfolioPageMetadata> {
		try {
			const playgroundInfo = this.getPlaygroundInfo(type);

			const title = `${playgroundInfo.title} | ポートフォリオ | samuido`;
			const description = playgroundInfo.description;

			const metadata: Metadata = {
				title,
				description,
				keywords: [
					"ポートフォリオ",
					"プレイグラウンド",
					playgroundInfo.title,
					...playgroundInfo.keywords,
					"samuido",
				],
				robots: "index, follow",
				alternates: {
					canonical: `${this.config.baseUrl}/portfolio/playground/${type}`,
				},
				openGraph: {
					title: `${playgroundInfo.title} | プレイグラウンド`,
					description: playgroundInfo.description,
					type: "website",
					url: `${this.config.baseUrl}/portfolio/playground/${type}`,
					images: [
						{
							url: `${this.config.baseUrl}${playgroundInfo.image}`,
							width: 1200,
							height: 630,
							alt: `${playgroundInfo.title} Playground`,
						},
					],
					siteName: this.config.siteName,
					locale: this.config.locale,
				},
				twitter: {
					card: "summary_large_image",
					title: `${playgroundInfo.title} | プレイグラウンド`,
					description: playgroundInfo.description,
					images: [`${this.config.baseUrl}${playgroundInfo.image}`],
					creator: this.config.twitterHandle,
				},
			};

			const structuredData = {
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: `${playgroundInfo.title}プレイグラウンド`,
				description: playgroundInfo.description,
				url: `${this.config.baseUrl}/portfolio/playground/${type}`,
				creator: {
					"@type": "Person",
					name: "木村友亮",
					alternateName: "samuido",
				},
				mainEntity: {
					"@type": "SoftwareApplication",
					name: `${playgroundInfo.title} Experiments`,
					description: playgroundInfo.description,
					applicationCategory: "WebApplication",
					operatingSystem: "Web Browser",
					offers: {
						"@type": "Offer",
						price: "0",
						priceCurrency: "JPY",
					},
					featureList: playgroundInfo.features,
				},
				breadcrumb: {
					"@type": "BreadcrumbList",
					itemListElement: [
						{
							"@type": "ListItem",
							position: 1,
							name: "Home",
							item: this.config.baseUrl,
						},
						{
							"@type": "ListItem",
							position: 2,
							name: "Portfolio",
							item: `${this.config.baseUrl}/portfolio`,
						},
						{
							"@type": "ListItem",
							position: 3,
							name: "Playground",
							item: `${this.config.baseUrl}/portfolio/playground/${type}`,
						},
					],
				},
			};

			return { metadata, structuredData };
		} catch (error) {
			console.error(`Error generating playground metadata for ${type}:`, error);
			return this.generateFallbackMetadata();
		}
	}

	/**
	 * Generate structured data for individual portfolio items
	 */
	private generateItemStructuredData(item: PortfolioContentItem): object {
		const baseStructuredData = {
			"@type": "CreativeWork",
			name: item.title,
			description: item.description,
			creator: {
				"@type": "Person",
				name: "木村友亮",
				url: this.config.baseUrl,
				sameAs: [
					"https://github.com/samuido",
					"https://twitter.com/361do_sleep",
				],
			},
			dateCreated: item.createdAt,
			dateModified: item.updatedAt,
			url: `${this.config.baseUrl}/portfolio/${item.id}`,
			image: (() => {
				const img = item.thumbnail || item.images?.[0];
				if (!img) return undefined;
				return img.startsWith("http") ? img : `${this.config.baseUrl}${img}`;
			})(),
			keywords: [...(item.tags || []), ...(item.technologies || [])].join(", "),
		};

		// Category-specific structured data
		switch (item.category) {
			case "develop":
				return {
					...baseStructuredData,
					"@type": "SoftwareApplication",
					applicationCategory: "WebApplication",
					programmingLanguage: item.technologies,
					codeRepository: item.repository?.url,
					operatingSystem: "Web Browser",
				};

			case "video":
				return {
					...baseStructuredData,
					"@type": "VideoObject",
					duration: item.duration ? `PT${item.duration}S` : undefined,
					embedUrl: item.videos?.[0]?.url,
					uploadDate: item.createdAt,
					genre: "Motion Graphics",
				};

			case "design":
			case "video&design":
				return {
					...baseStructuredData,
					"@type": "VisualArtwork",
					artMedium: "Digital Design",
					artworkSurface: "Digital",
					genre: "Digital Art",
				};

			default:
				return baseStructuredData;
		}
	}

	/**
	 * Generate work examples for structured data
	 */
	private generateWorkExamples(projects: PortfolioContentItem[]): object[] {
		return projects.map((project) => {
			switch (project.category) {
				case "develop":
					return {
						"@type": "SoftwareApplication",
						name: project.title,
						applicationCategory: "WebApplication",
						programmingLanguage: project.technologies,
					};
				case "video":
					return {
						"@type": "VideoObject",
						name: project.title,
						genre: "Motion Graphics",
					};
				default:
					return {
						"@type": "CreativeWork",
						name: project.title,
						genre: "Digital Art",
					};
			}
		});
	}

	/**
	 * Get category information
	 */
	private getCategoryInfo(category: string): CategoryInfo {
		const categoryMap: Record<string, CategoryInfo> = {
			all: {
				title: "All Projects",
				description: "Web開発、映像制作、デザインの全作品",
				keywords: ["Web開発", "映像制作", "デザイン", "React", "After Effects"],
				image: "/images/portfolio-gallery-all-og.jpg",
			},
			develop: {
				title: "開発",
				description: "Webアプリケーション、ゲーム、ツール開発",
				keywords: ["React", "Next.js", "TypeScript", "Unity", "C#"],
				image: "/images/portfolio-gallery-develop-og.jpg",
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
				image: "/images/portfolio-gallery-video-og.jpg",
			},
			"video&design": {
				title: "映像・デザイン",
				description: "映像制作とデザインを組み合わせた作品",
				keywords: ["デザイン", "映像", "グラフィック", "ブランディング"],
				image: "/images/portfolio-gallery-video-design-og.jpg",
			},
		};

		return categoryMap[category] || categoryMap.all;
	}

	private getCategoryThemeColor(category: string): string {
		switch (category.toLowerCase()) {
			case "develop":
				return "#3b82f6"; // blue
			case "video":
				return "#ef4444"; // red
			case "design":
				return "#a855f7"; // purple
			case "video&design":
				return "#ec4899"; // pink
			default:
				return "#10b981"; // emerald/default
		}
	}

	/**
	 * Get playground information
	 */
	private getPlaygroundInfo(type: string): PlaygroundInfo {
		const playgroundMap: Record<string, PlaygroundInfo> = {
			design: {
				title: "デザイン実験",
				description: "インタラクティブデザインとアニメーションの実験場",
				keywords: ["インタラクティブ", "アニメーション", "CSS", "JavaScript"],
				image: "/images/portfolio-playground-design-og.jpg",
				features: [
					"インタラクティブアニメーション",
					"CSS実験",
					"SVGアニメーション",
					"Canvas描画",
				],
			},
			WebGL: {
				title: "WebGL実験",
				description: "3Dグラフィックスとシェーダーの実験場",
				keywords: ["WebGL", "Three.js", "3D", "シェーダー", "GLSL"],
				image: "/images/portfolio-playground-webgl-og.jpg",
				features: [
					"3Dグラフィックス",
					"シェーダープログラミング",
					"パーティクルシステム",
					"インタラクティブ3D",
				],
			},
		};

		return playgroundMap[type] || playgroundMap.design;
	}

	/**
	 * Generate fallback metadata for error cases
	 */
	private generateFallbackMetadata(): PortfolioPageMetadata {
		const title = "ポートフォリオ | samuido";
		const description = "Web開発、映像制作、デザインの作品集";

		const metadata: Metadata = {
			title,
			description,
			keywords: [
				"ポートフォリオ",
				"Web開発",
				"映像制作",
				"デザイン",
				"samuido",
			],
			robots: "index, follow",
			alternates: {
				canonical: `${this.config.baseUrl}/portfolio`,
			},
			openGraph: {
				title,
				description,
				type: "website",
				url: `${this.config.baseUrl}/portfolio`,
				images: [
					{
						url: `${this.config.baseUrl}${this.config.defaultImage}`,
						width: 1200,
						height: 630,
						alt: "Portfolio - samuido",
					},
				],
				siteName: this.config.siteName,
				locale: this.config.locale,
			},
			twitter: {
				card: "summary_large_image",
				title,
				description,
				images: [`${this.config.baseUrl}${this.config.defaultImage}`],
				creator: this.config.twitterHandle,
			},
		};

		const structuredData = {
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: title,
			description,
			url: `${this.config.baseUrl}/portfolio`,
		};

		return { metadata, structuredData };
	}

	/**
	 * Generate metadata for item detail (alias for generateDetailMetadata)
	 */
	async generateItemMetadata(itemId: string): Promise<PortfolioPageMetadata> {
		const item = await this.dataManager.getPortfolioItem(itemId);
		if (!item) {
			throw new Error(`Portfolio item not found: ${itemId}`);
		}
		return this.generateDetailMetadata(item);
	}
}

// Export singleton instance
export const seoMetadataGenerator = new PortfolioSEOMetadataGenerator(
	// Will be injected when used
	{} as PortfolioDataManager,
);
