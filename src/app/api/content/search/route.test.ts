/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleGetSearch, handlePostSearch } from './logic';
import type { SearchResult } from '@/types/content';

describe('Search API Logic', () => {
  const mockSearchContent = vi.fn();
  const mockAdvancedSearch = vi.fn();
  const mockUpdateSearchStats = vi.fn();

  const mockDeps = {
    searchContent: mockSearchContent,
    advancedSearch: mockAdvancedSearch,
    updateSearchStats: mockUpdateSearchStats,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockUpdateSearchStats.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('handleGetSearch', () => {
    const mockResults: SearchResult[] = [
      { id: '1', title: 'Test Result', url: '/test', type: 'portfolio', score: 1, highlights: [], description: 'desc' },
    ];

    it('should return search results for valid query', async () => {
      mockSearchContent.mockResolvedValue(mockResults);
      const request = new Request('http://localhost:3000/api/content/search?q=test');
      const response = await handleGetSearch(request, mockDeps);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockResults);
    });

    it('should return 400 for missing query', async () => {
        const request = new Request('http://localhost:3000/api/content/search');
        const response = await handleGetSearch(request, mockDeps);
        expect(response.status).toBe(400);
    });

    it('should return empty results when search function fails', async () => {
        mockSearchContent.mockRejectedValue(new Error('Search failed'));
        const request = new Request('http://localhost:3000/api/content/search?q=test');
        const response = await handleGetSearch(request, mockDeps);
        const data = await response.json();
        expect(response.status).toBe(200);
        expect(data.data).toEqual([]);
        expect(console.warn).toHaveBeenCalledWith('Search operation failed:', expect.any(Error));
    });

    it('should still return results even if stats tracking fails', async () => {
        mockSearchContent.mockResolvedValue(mockResults);
        mockUpdateSearchStats.mockRejectedValue(new Error('Stats failed'));
        const request = new Request('http://localhost:3000/api/content/search?q=test');
        const response = await handleGetSearch(request, mockDeps);
        expect(response.status).toBe(200);
        expect(console.warn).toHaveBeenCalledWith('Failed to update search stats:', expect.any(Error));
    });

    it('should return 500 for invalid request URL', async () => {
        const invalidRequest = { url: 'invalid-url' } as Request;
        const response = await handleGetSearch(invalidRequest, mockDeps);
        expect(response.status).toBe(500);
        expect(console.error).toHaveBeenCalledWith('Search API GET error:', expect.any(TypeError));
    });
  });

  describe('handlePostSearch', () => {
    it('should call basic search when advanced is false', async () => {
        mockSearchContent.mockResolvedValue([]);
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test', advanced: false }),
        });
        await handlePostSearch(request, mockDeps);
        expect(mockSearchContent).toHaveBeenCalled();
    });

    it('should call advanced search when advanced is true', async () => {
        mockAdvancedSearch.mockResolvedValue([]);
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test', advanced: true }),
        });
        await handlePostSearch(request, mockDeps);
        expect(mockAdvancedSearch).toHaveBeenCalled();
    });

    it.each([
        { query: '' },
        { limit: 99 },
        { threshold: 1.1 },
    ])('should return 400 for invalid parameters: %s', async (body) => {
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test', ...body }),
        });
        const response = await handlePostSearch(request, mockDeps);
        expect(response.status).toBe(400);
    });

    it('should return 500 on json parsing failure', async () => {
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: 'not-json',
        });
        const response = await handlePostSearch(request, mockDeps);
        expect(response.status).toBe(500);
    });

    it('should return 500 on unexpected error', async () => {
        mockUpdateSearchStats.mockImplementation(() => {
            throw new Error('Unexpected sync error');
        });
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test' }),
        });
        const response = await handlePostSearch(request, mockDeps);
        expect(response.status).toBe(500);
        expect(console.error).toHaveBeenCalledWith('Search API POST error:', expect.any(Error));
    });

    it('should still return results even if stats tracking fails on POST', async () => {
        mockSearchContent.mockResolvedValue([]);
        mockUpdateSearchStats.mockRejectedValue(new Error('Stats failed on POST'));
        const request = new Request('http://localhost:3000/api/content/search', {
            method: 'POST',
            body: JSON.stringify({ query: 'test' }),
        });
        const response = await handlePostSearch(request, mockDeps);
        expect(response.status).toBe(200);
        expect(console.warn).toHaveBeenCalledWith('Failed to update search stats:', expect.any(Error));
    });
  });
});
