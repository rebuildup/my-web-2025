import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackStat, getStats, getTopStats, clearStatsCache } from './index';
import fs from 'fs/promises';
// import path from 'path'; // Removed unused import

// Mock fs.readFile and fs.writeFile
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

// Mock path.join
vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
}));

describe('Statistics Tracking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearStatsCache();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('trackStat', () => {
    it('should track a new statistic', async () => {
      // Mock file not existing
      (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(1);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('views-stats.json'),
        expect.stringContaining('"test-item":1'),
        undefined
      );
      expect(fs.mkdir).toHaveBeenCalled();
    });

    it('should increment an existing statistic', async () => {
      // Mock existing stats
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        JSON.stringify({
          views: { 'test-item': 5 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(6);
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('views-stats.json'),
        expect.stringContaining('"test-item":6'),
        undefined
      );
    });

    it('should handle different stat types', async () => {
      // Mock file not existing
      (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));

      await trackStat('download', 'test-download');

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('downloads-stats.json'),
        expect.any(String),
        undefined
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock read success but write failure
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        JSON.stringify({
          views: { 'test-item': 5 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );
      (fs.writeFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Write failed'));

      // Spy on console.error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const count = await trackStat('view', 'test-item');

      expect(count).toBe(0);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getStats', () => {
    it('should get all statistics for a type', async () => {
      // Mock existing stats
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
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
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
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
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
        JSON.stringify({
          views: { 'item-1': 5 },
          lastUpdated: '2024-01-01T12:00:00Z',
        })
      );

      const stats = await getStats('view', 'non-existent');

      expect(stats).toEqual({ 'non-existent': 0 });
    });

    it('should handle file not existing', async () => {
      // Mock file not existing
      (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));

      const stats = await getStats('view');

      expect(stats).toEqual({});
    });
  });

  describe('getTopStats', () => {
    it('should get top statistics sorted by count', async () => {
      // Mock existing stats
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
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

      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
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
      (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(
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
