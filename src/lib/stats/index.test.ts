import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateStats, getStats, getItemStats, getTopItems } from './index';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as typeof fetch;

describe('Stats Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('updateStats', () => {
    it('should update stats successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response);

      const result = await updateStats('view', 'test-item');
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-item' }),
      });
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await updateStats('view', 'test-item');
      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should fetch stats successfully', async () => {
      const mockStats = { views: 100, downloads: 50 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      } as Response);

      const result = await getStats('view');
      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith('/api/stats/view');
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getStats('view');
      expect(result).toEqual({});
    });
  });

  describe('getItemStats', () => {
    it('should fetch item stats successfully', async () => {
      // Mock the getStats calls that getItemStats makes internally
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: 10 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: 5 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: 2 }),
        } as Response);

      const result = await getItemStats('test-item');
      expect(result).toEqual({ views: 10, downloads: 5, searches: 2 });
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await getItemStats('test-item');
      expect(result).toEqual({ views: 0, downloads: 0, searches: 0 });
    });
  });

  describe('getTopItems', () => {
    it('should fetch top items successfully', async () => {
      const mockStats = { item1: 100, item2: 50 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      } as Response);

      const result = await getTopItems('view');
      expect(result).toEqual([
        { id: 'item1', count: 100 },
        { id: 'item2', count: 50 },
      ]);
    });

    it('should fetch with custom limit', async () => {
      const mockStats = { item1: 100, item2: 50, item3: 25 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      } as Response);

      const result = await getTopItems('view', 2);
      expect(result).toEqual([
        { id: 'item1', count: 100 },
        { id: 'item2', count: 50 },
      ]);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getTopItems('view');
      expect(result).toEqual([]);
    });
  });
});
