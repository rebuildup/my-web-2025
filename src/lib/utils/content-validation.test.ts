import { describe, it, expect } from 'vitest';
import { validateContentItem } from './content-validation';
import { ContentItem } from '@/types/content';

describe('Content Validation', () => {
  describe('validateContentItem', () => {
    it('should validate a valid content item', () => {
      const validItem: ContentItem = {
        id: 'test-item-001',
        type: 'blog',
        title: 'Test Blog Post',
        description: 'This is a test blog post',
        category: 'test',
        tags: ['test', 'validation'],
        status: 'published',
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
        content: 'This is the content of the blog post',
      };

      const result = validateContentItem(validItem);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should validate a valid portfolio item with all optional fields', () => {
      const validItem: ContentItem = {
        id: 'portfolio-001',
        type: 'portfolio',
        title: 'Portfolio Project',
        description: 'A sample portfolio project',
        category: 'design',
        tags: ['design', 'ui', 'ux'],
        status: 'published',
        priority: 80,
        createdAt: '2024-01-01T12:00:00Z',
        updatedAt: '2024-01-02T12:00:00Z',
        publishedAt: '2024-01-03T12:00:00Z',
        thumbnail: '/images/portfolio-001-thumb.webp',
        images: ['/images/portfolio-001-1.webp', '/images/portfolio-001-2.webp'],
        videos: [
          {
            type: 'youtube',
            url: 'https://youtube.com/watch?v=example',
            title: 'Project Demo',
            thumbnail: '/images/portfolio-001-video-thumb.webp',
            duration: 120,
          },
        ],
        externalLinks: [
          {
            type: 'github',
            url: 'https://github.com/example/project',
            title: 'Source Code',
          },
          {
            type: 'demo',
            url: 'https://example.com/demo',
            title: 'Live Demo',
          },
        ],
        content: 'This is the portfolio project description',
        stats: {
          views: 1250,
          likes: 45,
        },
        seo: {
          title: 'Portfolio Project | samuido',
          description: 'A sample portfolio project showcasing design skills',
          keywords: ['portfolio', 'design', 'ui', 'ux'],
        },
      };

      const result = validateContentItem(validItem);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for missing required fields', () => {
      const invalidItem = {
        // Missing id, type, title, description, category, status, priority, createdAt
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('id');
      expect(result.errors).toHaveProperty('type');
      expect(result.errors).toHaveProperty('title');
      expect(result.errors).toHaveProperty('description');
      expect(result.errors).toHaveProperty('category');
      expect(result.errors).toHaveProperty('status');
      expect(result.errors).toHaveProperty('priority');
      expect(result.errors).toHaveProperty('createdAt');
    });

    it('should validate content type', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'invalid-type' as unknown as import('@/types/content').ContentType, // Invalid content type intentionally for test
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('type');
      expect(result.errors.type[0]).toContain('Invalid content type');
    });

    it('should validate status values', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'invalid-status' as unknown as import('@/types/content').ContentItem['status'], // Invalid status intentionally for test
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('status');
      expect(result.errors.status[0]).toContain('Invalid status');
    });

    it('should validate priority range', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 150, // Invalid priority (> 100)
        createdAt: '2024-01-01T12:00:00Z',
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('priority');
      expect(result.errors.priority[0]).toContain('between 0 and 100');
    });

    it('should validate date formats', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01', // Invalid ISO format (missing time)
        updatedAt: 'not-a-date', // Invalid date
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('createdAt');
      expect(result.errors).toHaveProperty('updatedAt');
    });

    it('should validate media embeds', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
        videos: [
          {
            type: 'youtube' as const,
            url: '',
            title: 'Invalid Video',
          },
        ],
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('videos[0]');
    });

    it('should validate external links', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
        externalLinks: [
          {
            type: 'github' as const,
            url: '', // 型エラー回避のため追加
            title: '', // 型エラー回避のため追加
          },
        ],
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('externalLinks[0]');
    });

    it('should validate download info', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'download' as import('@/types/content').ContentType,
        title: 'Test Download',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
        downloadInfo: {
          fileName: '', // 型エラー回避のため追加
          fileType: '', // 型エラー回避のため追加
          downloadCount: 0, // 型エラー回避のため追加
          fileSize: -10, // Invalid negative size
          price: -5, // Invalid negative price
        },
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('downloadInfo');
    });

    it('should validate SEO data', () => {
      const invalidItem = {
        id: 'test-001',
        type: 'blog' as import('@/types/content').ContentType,
        title: 'Test Item',
        description: 'Test description',
        category: 'test',
        tags: ['test'],
        status: 'published' as const,
        priority: 50,
        createdAt: '2024-01-01T12:00:00Z',
        seo: {
          title: 'SEO Title', // 型エラー回避のため追加
          description: 123 as unknown as string, // 故意に型エラーを出す場合はas any, そうでなければstringに修正
          keywords: ['test'],
          noindex: 'true' as unknown as boolean, // 故意に型エラーを出す場合はas any, そうでなければbooleanに修正
        },
      };

      const result = validateContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('seo');
    });
  });
});
