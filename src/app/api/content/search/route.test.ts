import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { search } from '@/lib/search/search-engine';

import fs from 'fs/promises';

// Mock search function
vi.mock('@/lib/search/search-engine', () => ({
  search: vi.fn(),
}));

// Mock fs.writeFile and fs.mkdir
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    readFile: vi.fn(),
  },
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readFile: vi.fn(),
}));

describe('Search API', () => {
  const mockSearchResults = {
    results: [
      {
        id: 'test-1',
        type: 'blog',
        title: 'Test Blog Post',
        description: 'Test description',
        url: '/blog/test-1',
        score: 0.9,
        highlights: ['Test <mark>highlight</mark>'],
      },
    ],
    total: 1,
    query: 'test',
    limit: 10,
    offset: 0,
    hasMore: false,
    executionTimeMs: 5,
    suggestedQueries: [],
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (search as ReturnType<typeof vi.fn>).mockResolvedValue(mockSearchResults);
    (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));
    (fs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    (fs.mkdir as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  describe('GET', () => {
    it('should return search results', async () => {
      const url = new URL('http://localhost/api/content/search?q=test');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSearchResults.results);
      expect(data.pagination).toBeDefined();
      expect(data.query).toBe('test');
      expect(search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
        })
      );
    });

    it('should perform search with query parameters', async () => {
      const url = new URL('http://localhost/api/content/search?q=test&type=blog&limit=5');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(search).toHaveBeenCalledWith({
        query: 'test',
        contentTypes: ['blog'],
        limit: 5,
        offset: 0,
        fuzzy: true,
        highlightMatches: true,
      });
    });

    it('should handle multiple content types', async () => {
      const url = new URL('http://localhost/api/content/search?q=test&type=blog&type=portfolio');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(search).toHaveBeenCalledWith({
        query: 'test',
        contentTypes: ['blog', 'portfolio'],
        limit: 10,
        offset: 0,
        fuzzy: true,
        highlightMatches: true,
      });
    });

    it('should handle pagination parameters', async () => {
      const url = new URL('http://localhost/api/content/search?q=test&limit=20&offset=40');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(search).toHaveBeenCalledWith({
        query: 'test',
        limit: 20,
        offset: 40,
        fuzzy: true,
        highlightMatches: true,
      });
    });

    it('should validate limit parameter', async () => {
      const url = new URL('http://localhost/api/content/search?q=test&limit=200');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Limit must be between');
    });

    it('should validate offset parameter', async () => {
      const url = new URL('http://localhost/api/content/search?q=test&offset=-5');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Offset must be non-negative');
    });

    it('should track search queries', async () => {
      const url = new URL('http://localhost/api/content/search?q=test');
      const request = new NextRequest(url);
      await GET(request);

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle search errors', async () => {
      (search as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Search failed'));

      const url = new URL('http://localhost/api/content/search?q=test');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle empty query', async () => {
      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(search).toHaveBeenCalledWith({
        query: '',
        limit: 10,
        offset: 0,
        fuzzy: true,
        highlightMatches: true,
      });
    });
  });

  describe('POST', () => {
    it('should return search results', async () => {
      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockSearchResults.results);
      expect(search).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
        })
      );
    });

    it('should perform search with request body', async () => {
      const searchData = {
        query: 'test query',
        contentTypes: ['blog', 'portfolio'],
        limit: 15,
        offset: 30,
      };

      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(search).toHaveBeenCalledWith({
        query: 'test query',
        contentTypes: ['blog', 'portfolio'],
        limit: 15,
        offset: 30,
        fuzzy: true,
        highlightMatches: true,
      });
    });

    it('should require query parameter', async () => {
      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Query is required');
    });

    it('should validate limit parameter', async () => {
      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test',
          limit: 200,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Limit must be between');
    });

    it('should validate offset parameter in POST', async () => {
      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test', offset: -10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Offset must be non-negative');
    });

    it('should handle search errors', async () => {
      (search as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Search failed'));

      const url = new URL('http://localhost/api/content/search');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'test',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost/api/content/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
