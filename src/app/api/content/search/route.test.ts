import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';
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
      vi.mocked(searchContent).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
      expect(data.query).toBe('test');
    });

    it('should handle missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query parameter "q" is required');
    });

    it('should handle empty query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/search?q=');
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
      vi.mocked(searchContent).mockResolvedValue(mockResults);

      const request = new NextRequest(
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
      const { trackSearch } = await import('@/lib/stats');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(trackSearch).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/content/search?q=test');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(trackSearch).toHaveBeenCalledWith('test', mockResults.length);
    });

    it('should handle search errors gracefully', async () => {
      const { searchContent } = await import('@/lib/search');
      vi.mocked(searchContent).mockRejectedValue(new Error('Search failed'));

      const request = new NextRequest('http://localhost:3000/api/content/search?q=test');
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
      const { trackSearch } = await import('@/lib/stats');
      vi.mocked(searchContent).mockResolvedValue(mockResults);
      vi.mocked(trackSearch).mockRejectedValue(new Error('Tracking failed'));

      const request = new NextRequest('http://localhost:3000/api/content/search?q=test');
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
      vi.mocked(searchContent).mockResolvedValue(mockResults);

      const request = new NextRequest('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', limit: 5 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockResults);
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search operation failed');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Search operation failed');
    });

    it('should handle missing query in suggestions request', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 5 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Query is required and must be a non-empty string');
    });

    it('should handle suggestions error', async () => {
      const { getSearchSuggestions } = await import('@/lib/search');
      vi.mocked(getSearchSuggestions).mockRejectedValue(new Error('Suggestions failed'));

      const request = new NextRequest('http://localhost:3000/api/content/search', {
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
