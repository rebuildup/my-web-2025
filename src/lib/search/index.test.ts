import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchContent, buildSearchIndex, generateContentUrl } from './index';
import { SearchIndex, ContentItem } from '@/types/content';

// Mock fetch
global.fetch = vi.fn();

// Mock search index data
const mockSearchIndex: SearchIndex[] = [
  {
    id: 'portfolio-1',
    type: 'portfolio',
    title: 'React Portfolio Website',
    description: 'A React-based portfolio',
    content: 'This is a portfolio built with React',
    tags: ['react', 'typescript'],
    category: 'develop',
    searchableContent: 'React Portfolio Website A React-based portfolio This is a portfolio built with React react typescript develop',
  },
  {
    id: 'tool-1',
    type: 'tool',
    title: 'Color Palette Generator',
    description: 'Generate color palettes',
    content: 'A tool for generating color palettes',
    tags: ['design', 'colors'],
    category: 'design',
    searchableContent: 'Color Palette Generator Generate color palettes A tool for generating color palettes design colors design',
  },
  {
    id: 'blog-1',
    type: 'blog',
    title: 'Next.js Tutorial',
    description: 'Learn Next.js framework',
    content: 'Complete guide to Next.js',
    tags: ['nextjs', 'tutorial'],
    category: 'programming',
    searchableContent: 'Next.js Tutorial Learn Next.js framework Complete guide to Next.js nextjs tutorial programming',
  },
];

const mockContentData = [
  {
    id: 'portfolio-1',
    type: 'portfolio',
    title: 'React Portfolio Website',
    description: 'A React-based portfolio',
    category: 'develop',
    tags: ['react', 'typescript'],
    status: 'published',
    priority: 90,
    createdAt: '2024-12-01T10:00:00.000Z',
    content: 'This is a portfolio built with React',
  },
  {
    id: 'tool-1',
    type: 'tool',
    title: 'Color Palette Generator',
    description: 'Generate color palettes',
    category: 'design',
    tags: ['design', 'colors'],
    status: 'published',
    priority: 95,
    createdAt: '2024-12-01T08:00:00.000Z',
    content: 'A tool for generating color palettes',
  },
] as ContentItem[];

describe('Search Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateContentUrl', () => {
    it('should generate correct URLs for different content types', () => {
      expect(generateContentUrl({ id: 'test', type: 'portfolio' } as SearchIndex)).toBe('/portfolio/detail/test');
      expect(generateContentUrl({ id: 'test', type: 'tool' } as SearchIndex)).toBe('/tools/test');
      expect(generateContentUrl({ id: 'test', type: 'blog' } as SearchIndex)).toBe('/workshop/blog/test');
      expect(generateContentUrl({ id: 'test', type: 'plugin' } as SearchIndex)).toBe('/workshop/plugins/test');
      expect(generateContentUrl({ id: 'test', type: 'profile' } as SearchIndex)).toBe('/about/profile/test');
      expect(generateContentUrl({ id: 'test', type: 'page' } as SearchIndex)).toBe('/test');
    });

    it('should handle unknown content types', () => {
      expect(generateContentUrl({ id: 'test', type: 'unknown' as any } as SearchIndex)).toBe('/unknown/test');
    });
  });

  describe('buildSearchIndex', () => {
    it('should build search index from content data', async () => {
      const mockFetch = vi.mocked(fetch);
      
      // Mock successful response for portfolio content
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContentData.filter(item => item.type === 'portfolio')),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockContentData.filter(item => item.type === 'tool')),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
        } as Response);

      const searchIndex = await buildSearchIndex();

      expect(searchIndex).toHaveLength(2);
      expect(searchIndex[0].id).toBe('portfolio-1');
      expect(searchIndex[0].searchableContent).toContain('react');
      expect(searchIndex[1].id).toBe('tool-1');
      expect(searchIndex[1].searchableContent).toContain('color');
    });

    it('should handle fetch errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const searchIndex = await buildSearchIndex();
      expect(searchIndex).toEqual([]);
    });

    it('should filter out non-published content', async () => {
      const mockFetch = vi.mocked(fetch);
      const contentWithDraft = [
        ...mockContentData,
        {
          id: 'draft-1',
          type: 'blog',
          title: 'Draft Article',
          description: 'Draft content',
          category: 'test',
          tags: [],
          status: 'draft',
          priority: 50,
          createdAt: '2024-12-01T10:00:00.000Z',
        } as ContentItem,
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(contentWithDraft),
      } as Response);

      const searchIndex = await buildSearchIndex();
      
      // Should not include draft content
      expect(searchIndex.find(item => item.id === 'draft-1')).toBeUndefined();
    });
  });

  describe('searchContent', () => {
    beforeEach(() => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ index: mockSearchIndex }),
      } as Response);
    });

    it('should return empty array for empty query', async () => {
      const results = await searchContent('');
      expect(results).toEqual([]);
    });

    it('should return empty array for whitespace-only query', async () => {
      const results = await searchContent('   ');
      expect(results).toEqual([]);
    });

    it('should search and return relevant results', async () => {
      const results = await searchContent('React');
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('portfolio-1');
      expect(results[0].title).toBe('React Portfolio Website');
      expect(results[0].url).toBe('/portfolio/detail/portfolio-1');
    });

    it('should filter by content type', async () => {
      const results = await searchContent('generator', { type: 'tool' });
      
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('tool');
      expect(results[0].title).toBe('Color Palette Generator');
    });

    it('should filter by category', async () => {
      const results = await searchContent('palette', { category: 'design' });
      
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('design');
    });

    it('should respect limit parameter', async () => {
      const results = await searchContent('a', { limit: 1 });
      
      expect(results.length).toBeLessThanOrEqual(1);
    });

    it('should handle search with no matches', async () => {
      const results = await searchContent('nonexistent');
      
      expect(results).toEqual([]);
    });

    it('should handle custom threshold', async () => {
      const results = await searchContent('React', { threshold: 0.1 });
      
      expect(results).toHaveLength(1);
      expect(results[0].score).toBeLessThan(0.1);
    });

    it('should include content in search when specified', async () => {
      const results = await searchContent('built', { includeContent: true });
      
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('portfolio-1');
    });

    it('should handle search index loading failure', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const results = await searchContent('test');
      expect(results).toEqual([]);
    });

    it('should handle JSON parsing error', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      const results = await searchContent('test');
      expect(results).toEqual([]);
    });

    it('should handle empty search index', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ index: [] }),
      } as Response);

      const results = await searchContent('test');
      expect(results).toEqual([]);
    });

    it('should handle network error gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock console.error to avoid noise in test output
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const results = await searchContent('test');
      expect(results).toEqual([]);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed search index data', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ malformed: 'data' }),
      } as Response);

      const results = await searchContent('test');
      expect(results).toEqual([]);
    });

    it('should handle search index with missing fields', async () => {
      const mockFetch = vi.mocked(fetch);
      const incompleteIndex = [
        {
          id: 'incomplete',
          // missing required fields
        },
      ];
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ index: incompleteIndex }),
      } as Response);

      const results = await searchContent('test');
      expect(results).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should handle large search queries efficiently', async () => {
      const largeQuery = 'a'.repeat(1000);
      
      const startTime = Date.now();
      const results = await searchContent(largeQuery);
      const endTime = Date.now();
      
      // Should complete in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle large search index efficiently', async () => {
      const mockFetch = vi.mocked(fetch);
      const largeIndex = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        type: 'portfolio' as const,
        title: `Item ${i}`,
        description: `Description for item ${i}`,
        content: `Content for item ${i}`,
        tags: [`tag${i}`],
        category: 'test',
        searchableContent: `Item ${i} Description for item ${i} Content for item ${i} tag${i} test`,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ index: largeIndex }),
      } as Response);

      const startTime = Date.now();
      const results = await searchContent('Item');
      const endTime = Date.now();
      
      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(2000);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10); // Default limit
    });
  });
});