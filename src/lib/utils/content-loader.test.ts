import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getContentByType, clearContentCache, getContentCacheStats } from './content-loader';
import { ContentItem } from '@/types/content';
import fs from 'fs/promises';
import path from 'path';

// Mock fs.readFile
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock console.warn and console.error to avoid cluttering test output
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Content Loader', () => {
  const mockPortfolioItems: ContentItem[] = [
    {
      id: 'portfolio-1',
      type: 'portfolio',
      title: 'Portfolio Item 1',
      description: 'Description 1',
      category: 'design',
      tags: ['design', 'ui'],
      status: 'published',
      priority: 90,
      createdAt: '2024-01-01T12:00:00Z',
      publishedAt: '2024-01-02T12:00:00Z',
    },
    {
      id: 'portfolio-2',
      type: 'portfolio',
      title: 'Portfolio Item 2',
      description: 'Description 2',
      category: 'video',
      tags: ['video', 'animation'],
      status: 'published',
      priority: 80,
      createdAt: '2024-01-03T12:00:00Z',
      publishedAt: '2024-01-04T12:00:00Z',
    },
    {
      id: 'portfolio-3',
      type: 'portfolio',
      title: 'Portfolio Item 3',
      description: 'Description 3',
      category: 'develop',
      tags: ['code', 'react'],
      status: 'draft',
      priority: 70,
      createdAt: '2024-01-05T12:00:00Z',
    },
  ];

  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    // Clear cache
    clearContentCache();
    // Mock fs.readFile to return mock data
    (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify(mockPortfolioItems));
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should load content items by type', async () => {
    const items = await getContentByType('portfolio');

    // Should only return published items by default
    expect(items).toHaveLength(2);
    expect(items[0].id).toBe('portfolio-1');
    expect(items[1].id).toBe('portfolio-2');

    // Should call fs.readFile with correct path
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('public', 'data', 'content', 'portfolio.json')),
      'utf-8'
    );
  });

  it('should filter items by category', async () => {
    const items = await getContentByType('portfolio', { category: 'design' });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('portfolio-1');
    expect(items[0].category).toBe('design');
  });

  it('should filter items by status', async () => {
    const items = await getContentByType('portfolio', { status: 'draft' });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('portfolio-3');
    expect(items[0].status).toBe('draft');
  });

  it('should filter items by tags', async () => {
    const items = await getContentByType('portfolio', { tags: ['code'] });

    expect(items).toHaveLength(0); // No published items with 'code' tag

    const allItems = await getContentByType('portfolio', { tags: ['code'], status: 'all' });
    expect(allItems).toHaveLength(1);
    expect(allItems[0].id).toBe('portfolio-3');
  });

  it('should sort items by specified field', async () => {
    const itemsByPriority = await getContentByType('portfolio', { sortBy: 'priority' });
    expect(itemsByPriority[0].id).toBe('portfolio-1'); // Highest priority

    const itemsByCreatedAt = await getContentByType('portfolio', { sortBy: 'createdAt' });
    expect(itemsByCreatedAt[0].id).toBe('portfolio-2'); // Most recent created date

    const itemsByTitle = await getContentByType('portfolio', { sortBy: 'title', sortOrder: 'asc' });
    expect(itemsByTitle[0].id).toBe('portfolio-1'); // Alphabetical order
  });

  it('should apply pagination', async () => {
    const items = await getContentByType('portfolio', { limit: 1, offset: 1, status: 'all' });

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('portfolio-2');
  });

  it('should use cache for subsequent requests', async () => {
    // First request should read from file
    await getContentByType('portfolio');
    expect(fs.readFile).toHaveBeenCalledTimes(1);

    // Second request with same parameters should use cache
    await getContentByType('portfolio');
    expect(fs.readFile).toHaveBeenCalledTimes(1);

    // Request with different parameters should read from file again
    await getContentByType('portfolio', { category: 'video' });
    expect(fs.readFile).toHaveBeenCalledTimes(2);
  });

  it('should clear cache correctly', async () => {
    // Populate cache
    await getContentByType('portfolio');
    await getContentByType('blog');

    // Check cache stats
    let stats = getContentCacheStats();
    expect(stats.keys.length).toBeGreaterThan(0);

    // Clear specific type cache
    clearContentCache('portfolio');
    stats = getContentCacheStats();
    expect(stats.keys.filter(k => k.startsWith('portfolio:'))).toHaveLength(0);
    expect(stats.keys.filter(k => k.startsWith('blog:'))).toHaveLength(1);

    // Clear all cache
    clearContentCache();
    stats = getContentCacheStats();
    expect(stats.keys).toHaveLength(0);
  });

  it('should handle file read errors', async () => {
    (fs.readFile as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('File not found'));

    const items = await getContentByType('portfolio');

    expect(items).toHaveLength(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle invalid content items', async () => {
    const invalidItems = [
      {
        id: 'valid-item',
        type: 'portfolio',
        title: 'Valid',
        description: 'Valid',
        category: 'test',
        tags: [],
        status: 'published',
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
      },
      { id: 'invalid-item' }, // Missing required fields
    ];

    (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify(invalidItems));

    const items = await getContentByType('portfolio');

    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('valid-item');
    expect(console.warn).toHaveBeenCalled();
  });
});
