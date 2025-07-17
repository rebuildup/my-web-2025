// Statistics tracking utilities
import { StatData } from '@/types/content';

// Types of statistics that can be tracked
export type StatType = 'view' | 'download' | 'search';

// In-memory cache for stats data
interface StatsCache {
  [key: string]: StatData;
}

const statsCache: StatsCache = {};

// Default empty stats data
const createEmptyStatsData = (): StatData => ({
  views: {},
  downloads: {},
  searches: {},
  lastUpdated: new Date().toISOString(),
});

/**
 * Tracks a statistic event (view, download, search)
 * @param type Type of statistic to track
 * @param id ID of the item being tracked
 * @returns Updated count for the item
 */
export async function trackStat(type: StatType, id: string): Promise<number> {
  // Normalize type for file naming
  const fileType = `${type}s`; // views, downloads, searches

  try {
    // Load stats data
    const statsData = await loadStatsData(fileType);

    // Update stats
    if (!statsData[id]) {
      statsData[id] = 0;
    }

    statsData[id] += 1;

    // Save updated stats
    await saveStatsData(fileType, statsData);

    return statsData[id];
  } catch (error) {
    console.error(`Failed to track ${type} for ${id}:`, error);
    return 0;
  }
}

/**
 * Gets statistics for a specific type
 * @param type Type of statistic to get
 * @param id Optional ID to filter by
 * @returns Statistics data
 */
export async function getStats(type: StatType, id?: string): Promise<Record<string, number>> {
  // Normalize type for file naming
  const fileType = `${type}s`; // views, downloads, searches

  try {
    // Load stats data
    const statsData = await loadStatsData(fileType);

    // Return filtered data if ID is provided
    if (id) {
      return { [id]: statsData[id] || 0 };
    }

    return statsData;
  } catch (error) {
    console.error(`Failed to get ${type} stats:`, error);
    return {};
  }
}

/**
 * Gets the top items by statistic count
 * @param type Type of statistic to get
 * @param limit Maximum number of items to return
 * @returns Array of [id, count] pairs sorted by count
 */
export async function getTopStats(
  type: StatType,
  limit: number = 10
): Promise<Array<[string, number]>> {
  try {
    // Load stats data
    const statsData = await getStats(type);

    // Sort by count (descending) and limit
    return Object.entries(statsData)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  } catch (error) {
    console.error(`Failed to get top ${type} stats:`, error);
    return [];
  }
}

/**
 * Loads statistics data from localStorage or memory cache
 * @param fileType Type of statistics file to load
 * @returns Statistics data
 */
async function loadStatsData(fileType: string): Promise<Record<string, number>> {
  // Check cache first
  if (statsCache[fileType]) {
    if (fileType === 'views') return statsCache[fileType].views || {};
    if (fileType === 'downloads') return statsCache[fileType].downloads || {};
    if (fileType === 'searches') return statsCache[fileType].searches || {};
    return {};
  }

  // In browser environment, use localStorage
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `stats_${fileType}`;
      const storedData = localStorage.getItem(storageKey);

      if (storedData) {
        const statsData = JSON.parse(storedData) as StatData;

        // Update cache
        statsCache[fileType] = statsData;

        if (fileType === 'views') return statsData.views || {};
        if (fileType === 'downloads') return statsData.downloads || {};
        if (fileType === 'searches') return statsData.searches || {};
      }
    } catch (error) {
      console.error(`Error loading stats from localStorage: ${error}`);
    }
  }

  // If we get here, either we're not in browser or localStorage failed
  // Return empty data
  const emptyStats: Record<string, number> = {};
  const statsData = createEmptyStatsData();

  // Update cache
  statsCache[fileType] = statsData;

  if (fileType === 'views') return emptyStats;
  if (fileType === 'downloads') return emptyStats;
  if (fileType === 'searches') return emptyStats;
  return {};
}

/**
 * Saves statistics data to localStorage and memory cache
 * @param fileType Type of statistics file to save
 * @param data Statistics data to save
 */
async function saveStatsData(fileType: string, data: Record<string, number>): Promise<void> {
  // Create stats data object with proper structure
  const statsData: StatData = {
    views: fileType === 'views' ? data : {},
    downloads: fileType === 'downloads' ? data : {},
    searches: fileType === 'searches' ? data : {},
    lastUpdated: new Date().toISOString(),
  };

  // Update cache
  statsCache[fileType] = statsData;

  // In browser environment, use localStorage
  if (typeof window !== 'undefined') {
    try {
      const storageKey = `stats_${fileType}`;
      localStorage.setItem(storageKey, JSON.stringify(statsData));
    } catch (error) {
      console.error(`Error saving stats to localStorage: ${error}`);
    }
  }
}

/**
 * Clears the statistics cache
 * @param fileType Optional type to clear, or all if not specified
 */
export function clearStatsCache(fileType?: string): void {
  if (fileType) {
    delete statsCache[fileType];

    // Also clear from localStorage if in browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`stats_${fileType}`);
      } catch (error) {
        console.error(`Error clearing stats from localStorage: ${error}`);
      }
    }
  } else {
    Object.keys(statsCache).forEach(key => {
      delete statsCache[key];

      // Also clear from localStorage if in browser
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`stats_${key}`);
        } catch (error) {
          console.error(`Error clearing stats from localStorage: ${error}`);
        }
      }
    });
  }
}
