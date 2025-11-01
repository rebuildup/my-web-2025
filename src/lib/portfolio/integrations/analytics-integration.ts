import type { PortfolioDataManager } from "../data-manager";

export interface AnalyticsEvent {
	event: string;
	category: "portfolio";
	action: string;
	label?: string;
	value?: number;
	customParameters?: Record<string, unknown>;
}

export interface PortfolioAnalytics {
	pageViews: Record<string, number>;
	itemClicks: Record<string, number>;
	galleryInteractions: Record<string, number>;
	playgroundUsage: Record<string, number>;
	downloadCounts: Record<string, number>;
	searchQueries: Record<string, number>;
	filterUsage: Record<string, number>;
}

export interface AnalyticsReport {
	summary: {
		totalPageViews: number;
		totalItemClicks: number;
		totalInteractions: number;
		topItems: Array<{
			id: string;
			title: string;
			views: number;
			clicks: number;
		}>;
		topCategories: Array<{ category: string; views: number }>;
		topTechnologies: Array<{ technology: string; interest: number }>;
	};
	timeRange: {
		start: Date;
		end: Date;
	};
	trends: {
		dailyViews: Array<{ date: string; views: number }>;
		categoryTrends: Array<{
			category: string;
			trend: "up" | "down" | "stable";
			change: number;
		}>;
	};
}

/**
 * アナリティクスとの連携機能を提供するクラス
 * ポートフォリオ関連のユーザー行動を追跡・分析する機能を実装
 */
export class AnalyticsIntegration {
	private dataManager: PortfolioDataManager;
	private analyticsProvider: "google" | "custom";

	constructor(
		dataManager: PortfolioDataManager,
		analyticsProvider: "google" | "custom" = "google",
	) {
		this.dataManager = dataManager;
		this.analyticsProvider = analyticsProvider;
	}

	/**
	 * ポートフォリオページビューを記録
	 */
	trackPortfolioView(
		itemId: string,
		additionalData?: Record<string, unknown>,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_view",
				category: "portfolio",
				action: "view",
				label: itemId,
				customParameters: {
					item_id: itemId,
					page_type: "portfolio_detail",
					...additionalData,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking portfolio view:", error);
		}
	}

	/**
	 * ギャラリーページビューを記録
	 */
	trackGalleryView(
		galleryType: string,
		filterState?: Record<string, unknown>,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "gallery_view",
				category: "portfolio",
				action: "gallery_view",
				label: galleryType,
				customParameters: {
					gallery_type: galleryType,
					filters_applied: filterState ? Object.keys(filterState).length : 0,
					filter_state: filterState,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking gallery view:", error);
		}
	}

	/**
	 * ギャラリーでのインタラクションを記録
	 */
	trackGalleryInteraction(
		galleryType: string,
		action: string,
		itemId?: string,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "gallery_interaction",
				category: "portfolio",
				action: action,
				label: galleryType,
				customParameters: {
					gallery_type: galleryType,
					interaction_type: action,
					item_id: itemId,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking gallery interaction:", error);
		}
	}

	/**
	 * プレイグラウンドの使用を記録
	 */
	trackPlaygroundUsage(
		experimentId: string,
		interactionType: string,
		duration?: number,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "playground_usage",
				category: "portfolio",
				action: "playground_interaction",
				label: experimentId,
				value: duration,
				customParameters: {
					experiment_id: experimentId,
					interaction_type: interactionType,
					duration_seconds: duration,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking playground usage:", error);
		}
	}

	/**
	 * ダウンロードイベントを記録
	 */
	trackDownload(itemId: string, downloadType: string, fileName?: string): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_download",
				category: "portfolio",
				action: "download",
				label: itemId,
				customParameters: {
					item_id: itemId,
					download_type: downloadType,
					file_name: fileName,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking download:", error);
		}
	}

	/**
	 * 検索イベントを記録
	 */
	trackSearch(
		query: string,
		resultsCount: number,
		filters?: Record<string, unknown>,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_search",
				category: "portfolio",
				action: "search",
				label: query,
				value: resultsCount,
				customParameters: {
					search_query: query,
					results_count: resultsCount,
					filters_applied: filters,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking search:", error);
		}
	}

	/**
	 * フィルター使用を記録
	 */
	trackFilterUsage(
		filterType: string,
		filterValue: string,
		resultsCount: number,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_filter",
				category: "portfolio",
				action: "filter",
				label: `${filterType}:${filterValue}`,
				value: resultsCount,
				customParameters: {
					filter_type: filterType,
					filter_value: filterValue,
					results_count: resultsCount,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking filter usage:", error);
		}
	}

	/**
	 * 外部リンククリックを記録
	 */
	trackExternalLink(
		itemId: string,
		linkType: "repository" | "demo" | "client" | "other",
		url: string,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "external_link_click",
				category: "portfolio",
				action: "external_link",
				label: itemId,
				customParameters: {
					item_id: itemId,
					link_type: linkType,
					destination_url: url,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking external link:", error);
		}
	}

	/**
	 * ポートフォリオレポートを生成
	 */
	async generatePortfolioReport(
		startDate?: Date,
		endDate?: Date,
	): Promise<AnalyticsReport> {
		try {
			// 実際の実装では、アナリティクスAPIからデータを取得
			// ここではモックデータを返す
			const allItems = await this.dataManager.getAllItems();
			const publishedItems = allItems.filter(
				(item) => item.status === "published",
			);

			const mockReport: AnalyticsReport = {
				summary: {
					totalPageViews: 1250,
					totalItemClicks: 340,
					totalInteractions: 890,
					topItems: publishedItems.slice(0, 5).map((item, index) => ({
						id: item.id,
						title: item.title,
						views: 100 - index * 15,
						clicks: 50 - index * 8,
					})),
					topCategories: [
						{ category: "develop", views: 450 },
						{ category: "video", views: 380 },
						{ category: "design", views: 420 },
					],
					topTechnologies: [
						{ technology: "React", interest: 85 },
						{ technology: "After Effects", interest: 72 },
						{ technology: "Unity", interest: 68 },
					],
				},
				timeRange: {
					start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					end: endDate || new Date(),
				},
				trends: {
					dailyViews: this.generateMockDailyViews(30),
					categoryTrends: [
						{ category: "develop", trend: "up", change: 15 },
						{ category: "video", trend: "stable", change: 2 },
						{ category: "design", trend: "down", change: -8 },
					],
				},
			};

			return mockReport;
		} catch (error) {
			console.error("Error generating portfolio report:", error);
			return this.getEmptyReport();
		}
	}

	/**
	 * リアルタイム統計を取得
	 */
	async getRealTimeStats(): Promise<{
		activeUsers: number;
		currentPageViews: Record<string, number>;
		recentInteractions: Array<{
			type: string;
			timestamp: Date;
			itemId?: string;
		}>;
	}> {
		try {
			// 実際の実装では、リアルタイムアナリティクスAPIからデータを取得
			return {
				activeUsers: 12,
				currentPageViews: {
					"/portfolio": 5,
					"/portfolio/gallery/all": 3,
					"/portfolio/gallery/develop": 2,
					"/portfolio/some-project": 2,
				},
				recentInteractions: [
					{
						type: "view",
						timestamp: new Date(Date.now() - 30000),
						itemId: "project-1",
					},
					{ type: "filter", timestamp: new Date(Date.now() - 45000) },
					{ type: "search", timestamp: new Date(Date.now() - 60000) },
				],
			};
		} catch (error) {
			console.error("Error getting real-time stats:", error);
			return {
				activeUsers: 0,
				currentPageViews: {},
				recentInteractions: [],
			};
		}
	}

	/**
	 * パフォーマンス指標を記録
	 */
	trackPerformance(
		pageType: string,
		metrics: {
			loadTime: number;
			renderTime: number;
			interactionTime?: number;
		},
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_performance",
				category: "portfolio",
				action: "performance",
				label: pageType,
				customParameters: {
					page_type: pageType,
					load_time: metrics.loadTime,
					render_time: metrics.renderTime,
					interaction_time: metrics.interactionTime,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking performance:", error);
		}
	}

	/**
	 * エラーイベントを記録
	 */
	trackError(
		errorType: string,
		errorMessage: string,
		pageType?: string,
		itemId?: string,
	): void {
		try {
			const event: AnalyticsEvent = {
				event: "portfolio_error",
				category: "portfolio",
				action: "error",
				label: errorType,
				customParameters: {
					error_type: errorType,
					error_message: errorMessage,
					page_type: pageType,
					item_id: itemId,
				},
			};

			this.sendAnalyticsEvent(event);
		} catch (error) {
			console.error("Error tracking error:", error);
		}
	}

	/**
	 * アナリティクスイベントを送信
	 */
	private sendAnalyticsEvent(event: AnalyticsEvent): void {
		if (this.analyticsProvider === "google") {
			// Google Analytics 4 イベント送信
			if (
				typeof window !== "undefined" &&
				(window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
			) {
				(window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
					"event",
					event.event,
					{
						event_category: event.category,
						event_label: event.label,
						value: event.value,
						custom_parameters: event.customParameters,
					},
				);
			}
		} else {
			// カスタムアナリティクス実装
			this.sendCustomAnalyticsEvent(event);
		}
	}

	/**
	 * カスタムアナリティクスイベント送信
	 */
	private sendCustomAnalyticsEvent(event: AnalyticsEvent): void {
		// カスタムアナリティクスサーバーへの送信実装
		if (typeof window !== "undefined") {
			fetch("/api/analytics/track", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...event,
					timestamp: new Date().toISOString(),
					userAgent: navigator.userAgent,
					url: window.location.href,
				}),
			}).catch((error) => {
				console.error("Failed to send custom analytics event:", error);
			});
		}
	}

	/**
	 * モックの日次ビューデータを生成
	 */
	private generateMockDailyViews(
		days: number,
	): Array<{ date: string; views: number }> {
		const data = [];
		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
			const views = Math.floor(Math.random() * 50) + 20; // 20-70のランダムな値
			data.push({
				date: date.toISOString().split("T")[0],
				views,
			});
		}
		return data;
	}

	/**
	 * 空のレポートを返す
	 */
	private getEmptyReport(): AnalyticsReport {
		return {
			summary: {
				totalPageViews: 0,
				totalItemClicks: 0,
				totalInteractions: 0,
				topItems: [],
				topCategories: [],
				topTechnologies: [],
			},
			timeRange: {
				start: new Date(),
				end: new Date(),
			},
			trends: {
				dailyViews: [],
				categoryTrends: [],
			},
		};
	}
}
