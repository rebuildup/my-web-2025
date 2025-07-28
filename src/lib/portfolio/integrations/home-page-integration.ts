import { PortfolioContentItem } from "@/types/portfolio";
import { PortfolioDataManager } from "../data-manager";

export interface PortfolioStats {
  totalProjects: number;
  categoryCounts: Record<string, number>;
  technologyCounts: Record<string, number>;
  lastUpdate: Date;
}

export interface UpdateInfo {
  id: string;
  title: string;
  updatedAt: Date;
  category: string;
}

/**
 * ホームページとの連携機能を提供するクラス
 * ポートフォリオデータをホームページで表示するための機能を実装
 */
export class HomePageIntegration {
  private dataManager: PortfolioDataManager;

  constructor(dataManager: PortfolioDataManager) {
    this.dataManager = dataManager;
  }

  /**
   * ホームページに表示する注目プロジェクトを取得
   * 最新の3件を優先度順で返す
   */
  async getFeaturedProjects(): Promise<PortfolioContentItem[]> {
    try {
      const allItems = await this.dataManager.getAllItems();

      // 優先度と更新日時でソート
      const sortedItems = allItems
        .filter((item) => item.status === "published")
        .sort((a: PortfolioContentItem, b: PortfolioContentItem) => {
          // 優先度が高い順、同じ場合は更新日時が新しい順
          if (a.priority !== b.priority) {
            return (b.priority || 0) - (a.priority || 0);
          }
          return (
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
          );
        });

      return sortedItems.slice(0, 3);
    } catch (error) {
      console.error("Error fetching featured projects:", error);
      return [];
    }
  }

  /**
   * ポートフォリオの統計情報を取得
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const allItems = await this.dataManager.getAllItems();
      const publishedItems = allItems.filter(
        (item: PortfolioContentItem) => item.status === "published",
      );

      // カテゴリ別カウント
      const categoryCounts: Record<string, number> = {};
      publishedItems.forEach((item) => {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + 1;
      });

      // 技術別カウント
      const technologyCounts: Record<string, number> = {};
      publishedItems.forEach((item) => {
        if (item.technologies) {
          item.technologies.forEach((tech: string) => {
            technologyCounts[tech] = (technologyCounts[tech] || 0) + 1;
          });
        }
      });

      // 最新更新日時
      const lastUpdate =
        publishedItems.length > 0
          ? new Date(
              Math.max(
                ...publishedItems.map((item) =>
                  new Date(item.updatedAt || item.createdAt).getTime(),
                ),
              ),
            )
          : new Date();

      return {
        totalProjects: publishedItems.length,
        categoryCounts,
        technologyCounts,
        lastUpdate,
      };
    } catch (error) {
      console.error("Error fetching portfolio stats:", error);
      return {
        totalProjects: 0,
        categoryCounts: {},
        technologyCounts: {},
        lastUpdate: new Date(),
      };
    }
  }

  /**
   * 最新の更新情報を取得
   */
  async getLatestUpdates(): Promise<UpdateInfo[]> {
    try {
      const allItems = await this.dataManager.getAllItems();

      const updates = allItems
        .filter((item) => item.status === "published")
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        )
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.title,
          updatedAt: new Date(item.updatedAt || item.createdAt),
          category: item.category,
        }));

      return updates;
    } catch (error) {
      console.error("Error fetching latest updates:", error);
      return [];
    }
  }

  /**
   * ホームページ用のポートフォリオセクションデータを一括取得
   */
  async getHomePageData() {
    const [featuredProjects, stats, latestUpdates] = await Promise.all([
      this.getFeaturedProjects(),
      this.getPortfolioStats(),
      this.getLatestUpdates(),
    ]);

    return {
      featuredProjects,
      stats,
      latestUpdates,
    };
  }
}
