/**
 * Statistics Management System
 * Based on documents/01_global.md specifications
 */

import { promises as fs } from "fs";
import path from "path";

const STATS_DIR = path.join(process.cwd(), "public/data/stats");

/**
 * Load statistics from file
 */
async function loadStats(filePath: string): Promise<Record<string, number>> {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    // Return empty object if file doesn't exist
    return {};
  }
}

/**
 * Save statistics to file
 */
async function saveStats(
  filePath: string,
  stats: Record<string, number>,
): Promise<boolean> {
  try {
    await fs.writeFile(filePath, JSON.stringify(stats, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to save stats:", error);
    return false;
  }
}

/**
 * Update download statistics
 */
export async function updateDownloadStats(id: string): Promise<boolean> {
  try {
    const statsPath = path.join(STATS_DIR, "download-stats.json");
    const stats = await loadStats(statsPath);

    if (!stats[id]) {
      stats[id] = 0;
    }
    stats[id]++;

    return await saveStats(statsPath, stats);
  } catch (error) {
    console.error("Failed to update download stats:", error);
    return false;
  }
}

/**
 * Update view statistics
 */
export async function updateViewStats(id: string): Promise<boolean> {
  try {
    const statsPath = path.join(STATS_DIR, "view-stats.json");
    const stats = await loadStats(statsPath);

    if (!stats[id]) {
      stats[id] = 0;
    }
    stats[id]++;

    return await saveStats(statsPath, stats);
  } catch (error) {
    console.error("Failed to update view stats:", error);
    return false;
  }
}

/**
 * Update search statistics
 */
export async function updateSearchStats(query: string): Promise<boolean> {
  try {
    const statsPath = path.join(STATS_DIR, "search-stats.json");
    const stats = await loadStats(statsPath);

    const normalizedQuery = query.toLowerCase().trim();
    if (!stats[normalizedQuery]) {
      stats[normalizedQuery] = 0;
    }
    stats[normalizedQuery]++;

    return await saveStats(statsPath, stats);
  } catch (error) {
    console.error("Failed to update search stats:", error);
    return false;
  }
}

/**
 * Get download statistics
 */
export async function getDownloadStats(
  id?: string,
): Promise<number | Record<string, number>> {
  try {
    const statsPath = path.join(STATS_DIR, "download-stats.json");
    const stats = await loadStats(statsPath);

    if (id) {
      return stats[id] || 0;
    }

    return stats;
  } catch (error) {
    console.error("Failed to get download stats:", error);
    return id ? 0 : {};
  }
}

/**
 * Get view statistics
 */
export async function getViewStats(
  id?: string,
): Promise<number | Record<string, number>> {
  try {
    const statsPath = path.join(STATS_DIR, "view-stats.json");
    const stats = await loadStats(statsPath);

    if (id) {
      return stats[id] || 0;
    }

    return stats;
  } catch (error) {
    console.error("Failed to get view stats:", error);
    return id ? 0 : {};
  }
}

/**
 * Get search statistics
 */
export async function getSearchStats(): Promise<Record<string, number>> {
  try {
    const statsPath = path.join(STATS_DIR, "search-stats.json");
    return await loadStats(statsPath);
  } catch (error) {
    console.error("Failed to get search stats:", error);
    return {};
  }
}

/**
 * Get popular search queries
 */
export async function getPopularSearchQueries(
  limit: number = 10,
): Promise<Array<{ query: string; count: number }>> {
  try {
    const stats = await getSearchStats();

    return Object.entries(stats)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get popular search queries:", error);
    return [];
  }
}

/**
 * Get most viewed content
 */
export async function getMostViewedContent(
  limit: number = 10,
): Promise<Array<{ id: string; views: number }>> {
  try {
    const stats = (await getViewStats()) as Record<string, number>;

    return Object.entries(stats)
      .map(([id, views]) => ({ id, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get most viewed content:", error);
    return [];
  }
}

/**
 * Get most downloaded content
 */
export async function getMostDownloadedContent(
  limit: number = 10,
): Promise<Array<{ id: string; downloads: number }>> {
  try {
    const stats = (await getDownloadStats()) as Record<string, number>;

    return Object.entries(stats)
      .map(([id, downloads]) => ({ id, downloads }))
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to get most downloaded content:", error);
    return [];
  }
}

/**
 * Get comprehensive statistics summary
 */
export async function getStatsSummary(): Promise<{
  totalViews: number;
  totalDownloads: number;
  totalSearches: number;
  topQueries: Array<{ query: string; count: number }>;
  topContent: Array<{ id: string; views: number }>;
  topDownloads: Array<{ id: string; downloads: number }>;
}> {
  try {
    const [viewStats, downloadStats, searchStats] = await Promise.all([
      getViewStats() as Promise<Record<string, number>>,
      getDownloadStats() as Promise<Record<string, number>>,
      getSearchStats(),
    ]);

    const totalViews = Object.values(viewStats).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalDownloads = Object.values(downloadStats).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalSearches = Object.values(searchStats).reduce(
      (sum, count) => sum + count,
      0,
    );

    const [topQueries, topContent, topDownloads] = await Promise.all([
      getPopularSearchQueries(5),
      getMostViewedContent(5),
      getMostDownloadedContent(5),
    ]);

    return {
      totalViews,
      totalDownloads,
      totalSearches,
      topQueries,
      topContent,
      topDownloads,
    };
  } catch (error) {
    console.error("Failed to get stats summary:", error);
    return {
      totalViews: 0,
      totalDownloads: 0,
      totalSearches: 0,
      topQueries: [],
      topContent: [],
      topDownloads: [],
    };
  }
}
