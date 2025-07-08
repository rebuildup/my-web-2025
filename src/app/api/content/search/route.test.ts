import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import type { SearchResult } from '@/types/content';

// Mock the search module
vi.mock('@/lib/search', () => ({
  searchContent: vi.fn(),
  advancedSearch: vi.fn(),
  buildSearchIndex: vi.fn(),
  getSearchSuggestions: vi.fn(),
  updateSearchStats: vi.fn(),
}));

// Mock the stats module
vi.mock('@/lib/stats', () => ({
  trackSearch: vi.fn(),
}));

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

describe('Search API Route', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.log = mockConsole.log;
  });

  describe('GET - Search', () => {
    it('should return search results for valid query', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          description: 'Test description',
          url: '/portfolio/test-result',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Test content'],
        },
        {
          id: '2',
          title: 'Another Result',
          description: 'Another description',
          url: '/blog/another-result',
          type: 'blog',
          score: 0.8,
          highlights: ['Another content'],
        },
      ];

      const { searchContent } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockResolvedValue(undefined);

      const request = new Request('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
      expect(data.query).toBe('test');
    });

    it('should handle missing query parameter', async () => {
      const request = new Request('http://localhost:3000/api/content/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query parameter "q" is required');
    });

    it('should handle empty query parameter', async () => {
      const request = new Request('http://localhost:3000/api/content/search?q=');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query parameter "q" is required');
    });

    it('should handle search with filters', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Portfolio Item',
          description: 'Test description',
          url: '/portfolio/test-item',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Test content'],
        },
      ];

      const { searchContent } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockResolvedValue(undefined);

      const request = new Request(
        'http://localhost:3000/api/content/search?q=test&type=portfolio&category=web&limit=5'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
      expect(searchContent).toHaveBeenCalledWith('test', {
        type: 'portfolio',
        category: 'web',
        limit: 5,
      });
    });

    it('should track search analytics', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          description: 'Test description',
          url: '/portfolio/test-result',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Test content'],
        },
      ];

      const { searchContent } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockResolvedValue(undefined);

      const request = new Request('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(updateSearchStats).toHaveBeenCalledWith('test');
    });

    it('should handle search errors gracefully', async () => {
      const { searchContent } = await import('@/lib/search');
      vi.mocked(searchContent).mockRejectedValue(new Error('Search failed'));

      const request = new Request('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search operation failed');
    });

    it('should warn when tracking fails but continue with search', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          description: 'Test description',
          url: '/portfolio/test-result',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Test content'],
        },
      ];

      const { searchContent } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockRejectedValue(new Error('Tracking failed'));

      const request = new Request('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockConsole.warn).toHaveBeenCalledWith(
        'Failed to update search stats:',
        expect.any(Error)
      );
    });
  });

  describe('POST - Search', () => {
    it('should return search results for valid query', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Test Result',
          description: 'Test description',
          url: '/portfolio/test-result',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Test content'],
        },
      ];

      const { searchContent } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockResolvedValue(undefined);

      const request = new Request('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
      expect(data.query).toBe('test');
    });

    it('should handle missing query in request body', async () => {
      const request = new Request('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query is required and must be a non-empty string');
    });

    it('should handle empty query in request body', async () => {
      const request = new Request('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query is required and must be a non-empty string');
    });

    it('should handle advanced search', async () => {
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Advanced Result',
          description: 'Advanced description',
          url: '/portfolio/advanced-result',
          type: 'portfolio',
          score: 0.9,
          highlights: ['Advanced content'],
        },
      ];

      const { advancedSearch } = await import('@/lib/search');
      const { updateSearchStats } = await import('@/lib/search');
      vi.mocked(advancedSearch).mockResolvedValue(mockResults);
      vi.mocked(updateSearchStats).mockResolvedValue(undefined);

      const request = new Request('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test',
          advanced: true,
          type: ['portfolio'],
          category: ['web'],
          tags: ['javascript'],
          limit: 10,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
      expect(advancedSearch).toHaveBeenCalledWith({
        query: 'test',
        type: ['portfolio'],
        category: ['web'],
        tags: ['javascript'],
        limit: 10,
      });
    });

    it('should handle POST search errors gracefully', async () => {
      const { searchContent } = await import('@/lib/search');
      vi.mocked(searchContent).mockRejectedValue(new Error('Search failed'));

      const request = new Request('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search operation failed');
    });
  });
});
