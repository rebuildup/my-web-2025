import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from './route';
import { getContentByType } from '@/lib/utils/content-loader';
import { validateContentItem } from '@/lib/utils/content-validation';
import { updateSearchIndex } from '@/lib/search/search-index-builder';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/lib/utils/content-loader', () => ({
  getContentByType: vi.fn(),
}));

vi.mock('@/lib/utils/content-validation', () => ({
  validateContentItem: vi.fn(),
}));

vi.mock('@/lib/search/search-index-builder', () => ({
  updateSearchIndex: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('path', () => ({
  join: (...args: string[]) => args.join('/'),
}));

describe('Content API', () => {
  const mockContentItems = [
    {
      id: 'blog-1',
      type: 'blog',
      title: 'Test Blog Post',
      description: 'Test description',
      category: 'test',
      tags: ['test'],
      status: 'published',
      priority: 50,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'blog-2',
      type: 'blog',
      title: 'Draft Blog Post',
      description: 'Draft description',
      category: 'test',
      tags: ['test'],
      status: 'draft',
      priority: 40,
      createdAt: '2024-01-02T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock environment
    vi.stubEnv('NODE_ENV', 'development');

    // Default mock implementations
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockContentItems);
    (validateContentItem as ReturnType<typeof vi.fn>).mockReturnValue({
      isValid: true,
      errors: {},
    });
    (updateSearchIndex as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (fs.readFile as ReturnType<typeof vi.fn>).mockResolvedValue(JSON.stringify(mockContentItems));
    (fs.writeFile as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('GET', () => {
    it('should return content items', async () => {
      const request = new NextRequest('http://localhost/api/content/blog');
      const response = await GET(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockContentItems);
      expect(getContentByType).toHaveBeenCalledWith('blog', expect.any(Object));
    });

    it('should validate content type', async () => {
      const request = new NextRequest('http://localhost/api/content/invalid');
      const response = await GET(request, { params: Promise.resolve({ type: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid content type');
    });

    it('should handle query parameters', async () => {
      const request = new NextRequest(
        'http://localhost/api/content/blog?category=test&limit=5&offset=10&status=draft'
      );
      await GET(request, { params: Promise.resolve({ type: 'blog' }) });

      expect(getContentByType).toHaveBeenCalledWith('blog', {
        category: 'test',
        limit: 5,
        offset: 10,
        status: 'draft',
      });
    });

    it('should validate limit parameter', async () => {
      const request = new NextRequest('http://localhost/api/content/blog?limit=200');
      const response = await GET(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Limit must be between');
    });

    it('should validate offset parameter', async () => {
      const request = new NextRequest('http://localhost/api/content/blog?offset=-5');
      const response = await GET(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Offset must be non-negative');
    });

    it('should handle errors', async () => {
      (getContentByType as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to load content')
      );

      const request = new NextRequest('http://localhost/api/content/blog');
      const response = await GET(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should create a new content item', async () => {
      const newItem = {
        title: 'New Blog Post',
        description: 'New description',
        category: 'test',
        tags: ['test'],
      };

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('New Blog Post');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(updateSearchIndex).toHaveBeenCalledWith('blog');
    });

    it('should validate content before creation', async () => {
      (validateContentItem as ReturnType<typeof vi.fn>).mockReturnValue({
        isValid: false,
        errors: { title: ['Title is required'] },
      });

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Content validation failed');
      expect(data.validationErrors).toBeDefined();
    });

    it('should check for duplicate IDs', async () => {
      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'blog-1',
          title: 'Duplicate',
          description: 'Test',
          category: 'test',
        }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toContain('already exists');
    });

    it('should restrict content creation to development environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', description: 'Test', category: 'test' }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('development mode');
    });
  });

  describe('PUT', () => {
    it('should update an existing content item', async () => {
      const updatedItem = {
        id: 'blog-1',
        title: 'Updated Blog Post',
        description: 'Updated description',
      };

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });

      const response = await PUT(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Blog Post');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(updateSearchIndex).toHaveBeenCalledWith('blog');
    });

    it('should require an ID for updates', async () => {
      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No ID' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ID is required');
    });

    it('should validate the item does exist', async () => {
      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'non-existent', title: 'Not Found' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should validate content before update', async () => {
      (validateContentItem as ReturnType<typeof vi.fn>).mockReturnValue({
        isValid: false,
        errors: { title: ['Title is required'] },
      });

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'blog-1', title: '' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Content validation failed');
    });

    it('should restrict content updates to development environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest('http://localhost/api/content/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'blog-1', title: 'Updated' }),
      });

      const response = await PUT(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('development mode');
    });
  });

  describe('DELETE', () => {
    it('should delete an existing content item', async () => {
      const request = new NextRequest('http://localhost/api/content/blog?id=blog-1');
      const response = await DELETE(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('blog-1');
      expect(fs.writeFile).toHaveBeenCalled();
      expect(updateSearchIndex).toHaveBeenCalledWith('blog');
    });

    it('should require an ID for deletion', async () => {
      const request = new NextRequest('http://localhost/api/content/blog');
      const response = await DELETE(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ID is required');
    });

    it('should validate the item exists', async () => {
      const request = new NextRequest('http://localhost/api/content/blog?id=non-existent');
      const response = await DELETE(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should restrict content deletion to development environment', async () => {
      vi.stubEnv('NODE_ENV', 'production');

      const request = new NextRequest('http://localhost/api/content/blog?id=blog-1');
      const response = await DELETE(request, { params: Promise.resolve({ type: 'blog' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('development mode');
    });
  });
});
