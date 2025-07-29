/**
 * Portfolio Cache Utilities
 * キャッシュ管理とデバッグ用のユーティリティ
 */

import { portfolioDataManager } from "./data-manager";

/**
 * キャッシュをクリアして新しいデータを取得
 */
export async function clearPortfolioCache() {
  console.log("Clearing portfolio cache...");
  portfolioDataManager.invalidateCache();

  // 新しいデータを強制取得
  const data = await portfolioDataManager.getPortfolioData(true);
  console.log(`Cache cleared. Loaded ${data.length} items.`);

  return data;
}

/**
 * キャッシュの状態を確認
 */
export function getPortfolioCacheStatus() {
  const status = portfolioDataManager.getCacheStatus();
  console.log("Portfolio cache status:", status);
  return status;
}

/**
 * 開発環境でのキャッシュクリア（ブラウザコンソールから実行可能）
 */
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).clearPortfolioCache = clearPortfolioCache;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).getPortfolioCacheStatus = getPortfolioCacheStatus;
  console.log("Portfolio cache utilities available:");
  console.log("- clearPortfolioCache()");
  console.log("- getPortfolioCacheStatus()");
}

const cacheUtils = {
  clearPortfolioCache,
  getPortfolioCacheStatus,
};

export default cacheUtils;
