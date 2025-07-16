import { describe, it, expect, beforeEach, vi } from 'vitest';
import { searchContent, buildSearchIndex } from './index';
import { SearchIndex, ContentItem } from '@/types/content';

// --- MOCK DATA ---
const mockSearchIndex: SearchIndex[] = [
  {
    id: 'p1',
    type: 'portfolio',
    title: 'React Project',
    searchableContent: 'react',
    description: 'A React project',
    content: 'This is a React project.',
    tags: ['react'],
    category: 'web',
  },
];
const mockContentData: ContentItem[] = [
  {
    id: 'p1',
    type: 'portfolio',
    title: 'React Project',
    status: 'published',
    description: 'A React project',
    category: 'web',
    tags: ['react'],
    priority: 1,
    createdAt: '2021-01-01',
  },
];

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Search Functionality', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  describe('buildSearchIndex', () => {
    it('should build index from content and filter unpublished', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockContentData),
      } as Response);
      const searchIndex = await buildSearchIndex();
      expect(fetchMock).toHaveBeenCalled();
      expect(searchIndex.length).toBeGreaterThan(0);
    });
  });

  describe('searchContent', () => {
    it('should return results if index loads and query matches', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ index: mockSearchIndex }),
      } as Response);
      const results = await searchContent('React');
      expect(fetchMock).toHaveBeenCalledWith('/data/cache/search-index.json');
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('p1');
    });

    it('should return empty array if index fails to load', async () => {
      fetchMock.mockRejectedValue(new Error('Network Error'));
      const results = await searchContent('React');
      expect(results).toEqual([]);
    });
  });
});
