import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  updateStats,
  getStats,
  getItemStats,
  getTopItems,
  getStatsSummary,
  trackView,
  trackDownload,
  trackSearch,
  getLocalDownloadHistory,
  getLocalSearchHistory,
  clearLocalHistory,
  exportStats,
  subscribeToStatsUpdates,
  sendAnalyticsEvent,
  trackPageView,
  trackFileDownload,
  trackSearchQuery,
  trackToolUsage,
} from './index';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const mockLocalStorage = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: vi.fn(() => {
    mockLocalStorage.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window properties
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test',
    pathname: '/test',
  },
  writable: true,
});

Object.defineProperty(window, 'document', {
  value: {
    title: 'Test Page',
  },
  writable: true,
});

// Mock gtag for analytics
(window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag = vi.fn();

describe('Stats Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.store = {};
    vi.mocked(fetch).mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('updateStats', () => {
    it('should update stats successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      const result = await updateStats('view', 'test-id');

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-id' }),
      });
    });

    it('should handle update stats failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await updateStats('view', 'test-id');

      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await updateStats('view', 'test-id');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should get stats for specific item', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: 42 }),
      } as Response);

      const result = await getStats('view', 'test-id');

      expect(result).toBe(42);
      expect(fetch).toHaveBeenCalledWith('/api/stats/view?id=test-id');
    });

    it('should get all stats', async () => {
      const mockStats = { item1: 10, item2: 20 };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStats }),
      } as Response);

      const result = await getStats('view');

      expect(result).toEqual(mockStats);
      expect(fetch).toHaveBeenCalledWith('/api/stats/view');
    });

    it('should return default values on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const resultWithId = await getStats('view', 'test-id');
      const resultWithoutId = await getStats('view');

      expect(resultWithId).toBe(0);
      expect(resultWithoutId).toEqual({});
    });
  });

  describe('getItemStats', () => {
    it('should get all stats for an item', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: 10 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: 5 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: 3 }),
        } as Response);

      const result = await getItemStats('test-id');

      expect(result).toEqual({
        views: 10,
        downloads: 5,
        searches: 3,
      });
    });

    it('should return zero stats on error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const result = await getItemStats('test-id');

      expect(result).toEqual({
        views: 0,
        downloads: 0,
        searches: 0,
      });
    });
  });

  describe('getTopItems', () => {
    it('should get top items sorted by count', async () => {
      const mockStats = { item1: 30, item2: 10, item3: 20 };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStats }),
      } as Response);

      const result = await getTopItems('view', 2);

      expect(result).toEqual([
        { id: 'item1', count: 30 },
        { id: 'item3', count: 20 },
      ]);
    });

    it('should return empty array on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await getTopItems('view');

      expect(result).toEqual([]);
    });
  });

  describe('getStatsSummary', () => {
    it('should get comprehensive stats summary', async () => {
      const mockViewStats = { item1: 10, item2: 20 };
      const mockDownloadStats = { item1: 5, item2: 15 };
      const mockSearchStats = { query1: 8, query2: 12 };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockViewStats }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockDownloadStats }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockSearchStats }),
        } as Response);

      const result = await getStatsSummary();

      expect(result).toEqual({
        totalViews: 30,
        totalDownloads: 20,
        totalSearches: 20,
        topViewed: [
          { id: 'item2', count: 20 },
          { id: 'item1', count: 10 },
        ],
        topDownloaded: [
          { id: 'item2', count: 15 },
          { id: 'item1', count: 5 },
        ],
        topSearched: [
          { id: 'query2', count: 12 },
          { id: 'query1', count: 8 },
        ],
      });
    });
  });

  describe('trackView', () => {
    it('should track view if not recently tracked', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await trackView('test-id');

      expect(fetch).toHaveBeenCalledWith('/api/stats/view', expect.any(Object));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'view_tracked_test-id',
        expect.any(String)
      );
    });

    it('should not track view if recently tracked', async () => {
      const recentTime = Date.now() - 30000; // 30 seconds ago
      mockLocalStorage.store['view_tracked_test-id'] = recentTime.toString();

      await trackView('test-id');

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('trackDownload', () => {
    it('should track download and store local history', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await trackDownload('test-id', 'test-file.zip');

      expect(fetch).toHaveBeenCalledWith('/api/stats/download', expect.any(Object));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'download_history',
        expect.stringContaining('test-id')
      );
    });
  });

  describe('trackSearch', () => {
    it('should track search and store local history', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);

      await trackSearch('test query');

      expect(fetch).toHaveBeenCalledWith('/api/stats/search', expect.any(Object));
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'search_history',
        expect.stringContaining('test query')
      );
    });
  });

  describe('Local history functions', () => {
    it('should get local download history', () => {
      const mockHistory = [
        { id: 'test-id', filename: 'test.zip', timestamp: '2023-01-01T00:00:00Z' },
      ];
      mockLocalStorage.store['download_history'] = JSON.stringify(mockHistory);

      const result = getLocalDownloadHistory();

      expect(result).toEqual(mockHistory);
    });

    it('should get local search history', () => {
      const mockHistory = ['query1', 'query2'];
      mockLocalStorage.store['search_history'] = JSON.stringify(mockHistory);

      const result = getLocalSearchHistory();

      expect(result).toEqual(mockHistory);
    });

    it('should return empty arrays for invalid localStorage data', () => {
      mockLocalStorage.store['download_history'] = 'invalid-json';
      mockLocalStorage.store['search_history'] = 'invalid-json';

      expect(getLocalDownloadHistory()).toEqual([]);
      expect(getLocalSearchHistory()).toEqual([]);
    });

    it('should clear local history', () => {
      clearLocalHistory('downloads');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('download_history');

      clearLocalHistory('searches');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('search_history');

      clearLocalHistory('all');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('download_history');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('search_history');
    });
  });

  describe('exportStats', () => {
    it('should export all stats', async () => {
      const mockStats = { item1: 10 };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStats }),
      } as Response);

      const result = await exportStats();

      expect(result).toMatchObject({
        downloads: mockStats,
        views: mockStats,
        searches: mockStats,
        lastUpdated: expect.any(String),
      });
    });

    it('should return null on error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await exportStats();

      expect(result).toBeNull();
    });
  });

  describe('subscribeToStatsUpdates', () => {
    it('should set up polling for stats updates', async () => {
      vi.useFakeTimers();
      const mockCallback = vi.fn();
      const mockUpdates = [{ type: 'view', id: 'test-id', count: 5 }];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockUpdates),
      } as Response);

      const unsubscribe = subscribeToStatsUpdates(mockCallback);

      // Fast-forward time to trigger polling once (test environment uses 1000ms)
      vi.advanceTimersByTime(1000);
      await vi.runOnlyPendingTimersAsync();

      expect(fetch).toHaveBeenCalledWith('/api/stats/updates');
      expect(mockCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
      vi.useRealTimers();
    });
  });

  describe('Analytics functions', () => {
    it('should send analytics event', () => {
      const mockGtag = vi.fn();
      (window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag =
        mockGtag;

      sendAnalyticsEvent('test_event', { param1: 'value1' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', { param1: 'value1' });
    });

    it('should track page view', () => {
      const mockGtag = vi.fn();
      (window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag =
        mockGtag;

      trackPageView('/test-page', 'Test Page');

      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Test Page',
        page_location: 'https://example.com/test',
        page_path: '/test-page',
      });
    });

    it('should track file download', () => {
      const mockGtag = vi.fn();
      (window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag =
        mockGtag;

      trackFileDownload('file-123', 'document.pdf');

      expect(mockGtag).toHaveBeenCalledWith('event', 'file_download', {
        file_id: 'file-123',
        file_name: 'document.pdf',
        value: 1,
      });
    });

    it('should track search query', () => {
      const mockGtag = vi.fn();
      (window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag =
        mockGtag;

      trackSearchQuery('test query', 5);

      expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
        search_term: 'test query',
        result_count: 5,
      });
    });

    it('should track tool usage', () => {
      const mockGtag = vi.fn();
      (window as Window & typeof globalThis & { gtag: (...args: unknown[]) => void }).gtag =
        mockGtag;

      trackToolUsage('color-palette', 'generate');

      expect(mockGtag).toHaveBeenCalledWith('event', 'tool_usage', {
        tool_id: 'color-palette',
        action: 'generate',
        value: 1,
      });
    });
  });
});
