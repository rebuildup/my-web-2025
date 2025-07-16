/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn((...args: string[]) => args.join('/')),
  },
}));

// Mock error handling
vi.mock('@/lib/utils/error-handling', () => ({
  AppErrorHandler: {
    handleApiError: vi.fn((error: Error) => ({
      code: 'API_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
    })),
    logError: vi.fn(),
  },
}));

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

describe('Content API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.log = mockConsole.log;
  });

  it('should return content for valid type', async () => {
    const mockContent = [
      {
        id: 1,
        title: 'Test Portfolio',
        description: 'Test description',
        status: 'published',
        priority: 100,
        createdAt: '2023-01-01T00:00:00Z',
        publishedAt: '2023-01-01T00:00:00Z',
      },
    ];

    const fs = await import('fs/promises');
    vi.mocked(fs.default.readFile).mockResolvedValue(JSON.stringify(mockContent));

    const request = new NextRequest('http://localhost:3000/api/content/portfolio');
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockContent);
  });

  it('should return 400 for invalid type', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/invalid-type');
    const response = await GET(request, { params: Promise.resolve({ type: 'invalid-type' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid content type');
  });

  it('should handle file reading error', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.default.readFile).mockRejectedValue(new Error('File not found'));

    const request = new NextRequest('http://localhost:3000/api/content/portfolio');
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should handle JSON parsing error', async () => {
    const fs = await import('fs/promises');
    vi.mocked(fs.default.readFile).mockResolvedValue('invalid json');

    const request = new NextRequest('http://localhost:3000/api/content/portfolio');
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should handle query parameters', async () => {
    const mockContent = [
      {
        id: 1,
        title: 'Test Portfolio',
        description: 'Test description',
        status: 'published',
        category: 'web',
        priority: 100,
        createdAt: '2023-01-01T00:00:00Z',
        publishedAt: '2023-01-01T00:00:00Z',
      },
    ];

    const fs = await import('fs/promises');
    vi.mocked(fs.default.readFile).mockResolvedValue(JSON.stringify(mockContent));

    const request = new NextRequest(
      'http://localhost:3000/api/content/portfolio?category=web&limit=5&offset=0'
    );
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.pagination).toEqual({
      limit: 5,
      offset: 0,
      total: 1,
      hasMore: false,
    });
  });

  it('should validate limit parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/portfolio?limit=200');
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Limit must be between 1 and 100');
  });

  it('should validate offset parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/content/portfolio?offset=-1');
    const response = await GET(request, { params: Promise.resolve({ type: 'portfolio' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Offset must be non-negative');
  });

  it('should handle all valid content types', async () => {
    const validTypes = [
      'portfolio',
      'blog',
      'plugin',
      'tool',
      'profile',
      'page',
      'asset',
      'download',
    ];

    for (const type of validTypes) {
      const mockContent = [
        {
          id: 1,
          title: `Test ${type}`,
          status: 'published',
          createdAt: '2023-01-01T00:00:00Z',
        },
      ];

      const fs = await import('fs/promises');
      vi.mocked(fs.default.readFile).mockResolvedValue(JSON.stringify(mockContent));

      const request = new NextRequest(`http://localhost:3000/api/content/${type}`);
      const response = await GET(request, { params: Promise.resolve({ type }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    }
  });
});
