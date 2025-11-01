import type { PortfolioDataManager } from "./data-manager";
import {
	AboutIntegration,
	AnalyticsIntegration,
	HomePageIntegration,
	SEOIntegration,
	SearchIntegration,
} from "./integrations";

/**
 * ポートフォリオの他ページ連携を統合管理するクラス
 * 各種連携機能を一元的に提供
 */
export class PortfolioIntegrationManager {
	private dataManager: PortfolioDataManager;

	public readonly homePage: HomePageIntegration;
	public readonly search: SearchIntegration;
	public readonly about: AboutIntegration;
	public readonly seo: SEOIntegration;
	public readonly analytics: AnalyticsIntegration;

	constructor(dataManager: PortfolioDataManager) {
		this.dataManager = dataManager;

		// 各連携クラスを初期化
		this.homePage = new HomePageIntegration(dataManager);
		this.search = new SearchIntegration(dataManager);
		this.about = new AboutIntegration(dataManager);
		this.seo = new SEOIntegration(dataManager);
		this.analytics = new AnalyticsIntegration(dataManager);
	}

	/**
	 * 全連携機能の初期化
	 */
	async initialize(): Promise<void> {
		try {
			// 必要に応じて各連携機能の初期化処理を実行
		} catch (error) {
			console.error("Error initializing portfolio integration manager:", error);
			throw error;
		}
	}

	/**
	 * 全連携機能のデータを一括更新
	 */
	async refreshAllIntegrations(): Promise<void> {
		try {
			// データマネージャーのキャッシュをクリア
			await this.dataManager.clearCache();

			// 各連携機能で必要なデータを再生成
			await Promise.all([
				this.search.generateSearchIndex(),
				this.about.extractSkillsFromProjects(),
				this.seo.generateSitemapEntries(),
			]);
		} catch (error) {
			console.error("Error refreshing portfolio integrations:", error);
			throw error;
		}
	}

	/**
	 * 統合ダッシュボード用のデータを取得
	 */
	async getDashboardData() {
		try {
			const [homePageData, searchStats, aboutData, analyticsReport] =
				await Promise.all([
					this.homePage.getHomePageData(),
					this.search.getSearchStats(),
					this.about.getAboutData(),
					this.analytics.generatePortfolioReport(),
				]);

			return {
				homePage: homePageData,
				search: searchStats,
				about: {
					totalSkills: aboutData.skills.length,
					totalClientWork: aboutData.clientWork.length,
					topSkills: aboutData.summary.topSkills,
				},
				analytics: analyticsReport.summary,
				lastUpdated: new Date(),
			};
		} catch (error) {
			console.error("Error getting dashboard data:", error);
			return null;
		}
	}

	/**
	 * 特定のポートフォリオアイテムに関連する全連携データを取得
	 */
	async getItemIntegrationData(itemId: string) {
		try {
			const item = await this.dataManager.getItemById(itemId);
			if (!item) {
				throw new Error(`Portfolio item not found: ${itemId}`);
			}

			const [seoMeta, structuredData, relatedItems, skillsUsed] =
				await Promise.all([
					this.seo.updateMetaTags("detail", { item }),
					this.seo.generateStructuredData(item),
					this.search.searchPortfolioItems("", [
						{ type: "category", value: item.category },
					]),
					this.about.getRelevantPortfolioItems(item.category),
				]);

			return {
				item,
				seo: seoMeta,
				structuredData,
				relatedItems: relatedItems.slice(0, 3).map((r) => r.item),
				skillsUsed: skillsUsed.slice(0, 5),
			};
		} catch (error) {
			console.error("Error getting item integration data:", error);
			return null;
		}
	}

	/**
	 * 検索機能の統合データを取得
	 */
	async getSearchIntegrationData(
		query?: string,
		filters?: Array<{ type: string; value: string }>,
	) {
		try {
			const [searchResults, availableFilters, searchStats] = await Promise.all([
				query
					? this.search.searchPortfolioItems(query, filters)
					: Promise.resolve([]),
				this.search.getSearchFilters(),
				this.search.getSearchStats(),
			]);

			return {
				results: searchResults,
				filters: availableFilters,
				stats: searchStats,
				query: query || "",
				appliedFilters: filters || [],
			};
		} catch (error) {
			console.error("Error getting search integration data:", error);
			return null;
		}
	}

	/**
	 * ヘルスチェック - 全連携機能の状態を確認
	 */
	async healthCheck(): Promise<{
		status: "healthy" | "degraded" | "unhealthy";
		checks: Record<string, { status: "ok" | "error"; message?: string }>;
	}> {
		const checks: Record<string, { status: "ok" | "error"; message?: string }> =
			{};

		try {
			// データマネージャーの状態確認
			await this.dataManager.getAllItems();
			checks.dataManager = { status: "ok" };
		} catch {
			checks.dataManager = { status: "error", message: "Data manager failed" };
		}

		try {
			// 検索インデックスの状態確認
			await this.search.generateSearchIndex();
			checks.search = { status: "ok" };
		} catch {
			checks.search = { status: "error", message: "Search integration failed" };
		}

		try {
			// SEO機能の状態確認
			await this.seo.generateSitemapEntries();
			checks.seo = { status: "ok" };
		} catch {
			checks.seo = { status: "error", message: "SEO integration failed" };
		}

		try {
			// About連携の状態確認
			await this.about.extractSkillsFromProjects();
			checks.about = { status: "ok" };
		} catch {
			checks.about = { status: "error", message: "About integration failed" };
		}

		try {
			// ホームページ連携の状態確認
			await this.homePage.getHomePageData();
			checks.homePage = { status: "ok" };
		} catch {
			checks.homePage = {
				status: "error",
				message: "Home page integration failed",
			};
		}

		// 全体的な状態を判定
		const errorCount = Object.values(checks).filter(
			(check) => check.status === "error",
		).length;
		let status: "healthy" | "degraded" | "unhealthy";

		if (errorCount === 0) {
			status = "healthy";
		} else if (errorCount <= 2) {
			status = "degraded";
		} else {
			status = "unhealthy";
		}

		return { status, checks };
	}
}
