import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { search } from './search-engine';
import { loadSearchIndex } from './search-index-builder';
import { SearchIndex } from '@/types/content';

// Mock loadSearchIndex
vi.mock('./search-index-builder', () => ({
  loadSearchIndex: vi.fn(),
}));

describe('Search Engine', () => {
  const mockSearchIndex: SearchIndex[] = [
    {
      id: 'portfolio-1',
      type: 'portfolio',
      title: 'Web Design Project',
      description: 'A responsive web design project for a client',
      content: 'This project involved creating a responsive website with modern design principles.',
      tags: ['design', 'web', 'responsive'],
      category: 'design',
      searchableContent: 'web design project responsive website modern design principles',
    },
    {
      id: 'blog-1',
      type: 'blog',
      title: 'Introduction to React Hooks',
      description: 'Learn how to use React Hooks in your projects',
      content:
        'React Hooks are a new addition in React 16.8 that let you use state and other React features without writing a class.',
      tags: ['react', 'javascript', 'hooks'],
      category: 'development',
      searchableContent: 'react hooks javascript state class functional components',
    },
    {
      id: 'tool-1',
      type: 'tool',
      title: 'Color Palette Generator',
      description: 'Generate harmonious color palettes for your projects',
      content:
        'This tool helps you create beautiful color schemes based on color theory principles.',
      tags: ['color', 'design', 'tool'],
      category: 'tools',
      searchableContent: 'color palette generator harmonious schemes design tool',
    },
  ];

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    // Mock loadSearchIndex to return mock data
    (loadSearchIndex as ReturnType<typeof vi.fn>).mockResolvedValue(mockSearchIndex);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return all items when query is empty', async () => {
    const results = await search({ query: '' });

    expect(results.results).toHaveLength(3);
    expect(results.total).toBe(3);
    expect(results.hasMore).toBe(false);
  });

  it('should filter by content type', async () => {
    const results = await search({
      query: '',
      contentTypes: ['blog'],
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('blog-1');
  });

  it('should filter by category', async () => {
    const results = await search({
      query: '',
      categories: ['design'],
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('portfolio-1');
  });

  it('should filter by tags', async () => {
    const results = await search({
      query: '',
      tags: ['react'],
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('blog-1');
  });

  it('should find exact matches in title', async () => {
    const results = await search({ query: 'color palette' });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('tool-1');
    expect(results.results[0].score).toBeGreaterThan(0.8); // High score for title match
  });

  it('should find partial matches', async () => {
    const results = await search({ query: 'react' });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('blog-1');
  });

  it('should generate highlights for matches', async () => {
    const results = await search({
      query: 'responsive design',
      highlightMatches: true,
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].highlights).toBeDefined();
    expect(results.results[0].highlights.length).toBeGreaterThan(0);
    expect(results.results[0].highlights[0]).toContain('responsive');
  });

  it('should apply pagination', async () => {
    const results = await search({
      query: '',
      limit: 1,
      offset: 1,
    });

    expect(results.results).toHaveLength(1);
    expect(results.total).toBe(3);
    expect(results.hasMore).toBe(true);
  });

  it('should handle fuzzy matching', async () => {
    const results = await search({
      query: 'responsiv', // Misspelled
      fuzzy: true,
    });

    expect(results.results).toHaveLength(1);
    expect(results.results[0].id).toBe('portfolio-1');
  });

  it('should disable fuzzy matching when specified', async () => {
    const results = await search({
      query: 'responsiv', // Misspelled
      fuzzy: false,
    });

    expect(results.results).toHaveLength(0);
  });

  it('should suggest queries when no results found', async () => {
    // Mock no results for this query
    (loadSearchIndex as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        id: 'blog-1',
        type: 'blog',
        title: 'JavaScript Performance',
        description: 'Tips for optimizing JavaScript',
        content: 'Learn how to make your JavaScript code faster and more efficient.',
        tags: ['javascript', 'performance', 'optimization'],
        category: 'development',
        searchableContent: 'javascript performance optimization speed efficiency',
      },
    ]);

    const results = await search({ query: 'typescript react' });

    expect(results.results).toHaveLength(0);
    expect(results.suggestedQueries).toBeDefined();
    expect(results.suggestedQueries!.length).toBeGreaterThan(0);
  });

  it('should handle errors gracefully', async () => {
    // Mock loadSearchIndex to throw an error
    (loadSearchIndex as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Failed to load index')
    );

    await expect(search({ query: 'test' })).rejects.toThrow();
  });
});
