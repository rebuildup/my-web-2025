import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackStat, getStats, getTopStats, clearStatsCache } from './index';
// import path from 'path'; // Removed unused import

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock path.join
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
}));

describe('Statistics Tracking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearStatsCache();
    // Reset localStorage mock
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('trackStat', () => {
    it('should track a new statistic', async () => {
      // Mock localStorage to return no existing data
      localStorageMock.getItem.mockReturnValue(null);

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stats_views',
        expect.stringContaining('"test-item":1')
      );
    });

    it('should increment an existing statistic', async () => {
      // Mock existing stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: { 'test-item': 5 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(6);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'stats_views',
        expect.stringContaining('"test-item":6')
      );
    });

    it('should handle different stat types', async () => {
      // Mock localStorage to return no existing data
      localStorageMock.getItem.mockReturnValue(null);

      await trackStat('download', 'test-download');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('stats_downloads', expect.any(String));
    });

    it('should handle errors gracefully', async () => {
      // Mock localStorage to throw an error
      localStorageMock.getItem.mockReturnValue(null);
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(1); // The function still increments the count in memory before failing to save
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getStats', () => {
    it('should get all statistics for a type', async () => {
      // Mock existing stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: { 'item-1': 5, 'item-2': 10 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const stats = await getStats('view');

      expect(stats).toEqual({ 'item-1': 5, 'item-2': 10 });
    });

    it('should get statistics for a specific ID', async () => {
      // Mock existing stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: { 'item-1': 5, 'item-2': 10 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const stats = await getStats('view', 'item-1');

      expect(stats).toEqual({ 'item-1': 5 });
    });

    it('should return 0 for non-existent ID', async () => {
      // Mock existing stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: { 'item-1': 5 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const stats = await getStats('view', 'non-existent');

      expect(stats).toEqual({ 'non-existent': 0 });
    });

    it('should handle file not existing', async () => {
      // Mock localStorage to return no data
      localStorageMock.getItem.mockReturnValue(null);

      const stats = await getStats('view');

      expect(stats).toEqual({});
    });
  });

  describe('getTopStats', () => {
    it('should get top statistics sorted by count', async () => {
      // Mock existing stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: { 'item-1': 5, 'item-2': 10, 'item-3': 3, 'item-4': 8 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const topStats = await getTopStats('view', 2);

      expect(topStats).toEqual([
        ['item-2', 10],
        ['item-4', 8],
      ]);
    });

    it('should limit results correctly', async () => {
      // Mock existing stats with many items
      const mockStats: Record<string, number> = {};
      for (let i = 1; i <= 20; i++) {
        mockStats[`item-${i}`] = i;
      }

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: mockStats,
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const topStats = await getTopStats('view', 5);

      expect(topStats).toHaveLength(5);
      expect(topStats[0]).toEqual(['item-20', 20]);
      expect(topStats[4]).toEqual(['item-16', 16]);
    });

    it('should handle empty stats', async () => {
      // Mock empty stats
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          views: {},
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const topStats = await getTopStats('view');

      expect(topStats).toEqual([]);
    });
  });
});
