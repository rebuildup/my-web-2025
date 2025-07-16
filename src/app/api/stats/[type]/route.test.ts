/** @vitest-environment node */
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

// Mock path module - Note: path uses default export
vi.mock('path', () => ({
  default: {
    join: vi.fn(),
    dirname: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/utils/error-handling', () => ({
  AppErrorHandler: {
    handleApiError: vi.fn(),
    logError: vi.fn(),
  },
}));

// Mock process.cwd
vi.stubGlobal('process', {
  cwd: vi.fn(() => '/test'),
  env: { NODE_ENV: 'test' },
});

describe('Stats API Route', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup mocks
    const fs = await import('fs/promises');
    const path = await import('path');
    const { AppErrorHandler } = await import('@/lib/utils/error-handling');

    (path.default.join as Mock).mockImplementation((...args: string[]) => args.join('/'));
    (path.default.dirname as Mock).mockImplementation((p: string) =>
      p.split('/').slice(0, -1).join('/')
    );
    (fs.default.mkdir as Mock).mockResolvedValue(undefined);
    (fs.default.writeFile as Mock).mockResolvedValue(undefined);
    (fs.default.readFile as Mock).mockResolvedValue('{}');
    (AppErrorHandler.handleApiError as Mock).mockReturnValue({
      code: 'TEST_ERROR',
      message: 'Test error',
      timestamp: new Date().toISOString(),
    });
    (AppErrorHandler.logError as Mock).mockReturnValue(undefined);
  });

  describe('GET - Get Stats', () => {
    it('should return stats for valid type', async () => {
      const mockStats = { item1: 10, item2: 20 };
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view');
      const params = Promise.resolve({ type: 'view' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });

    it('should return item stats when id parameter is provided', async () => {
      const mockStats = { item1: 50, item2: 30 };
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view?id=item1');
      const params = Promise.resolve({ type: 'view' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBe(50);
    });

    it('should return all stats when no parameters are provided', async () => {
      const mockStats = { item1: 25, item2: 35 };
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view');
      const params = Promise.resolve({ type: 'view' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
    });

    it('should return zero for non-existent item', async () => {
      const mockStats = { item1: 10 };
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view?id=nonexistent');
      const params = Promise.resolve({ type: 'view' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBe(0);
    });

    it('should handle stats error gracefully', async () => {
      // Mock file read failure - should return empty stats
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockRejectedValue(new Error('File not found'));

      const request = new NextRequest('http://localhost/api/stats/view');
      const params = Promise.resolve({ type: 'view' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({});
    });

    it('should return error for invalid stat type', async () => {
      const request = new NextRequest('http://localhost/api/stats/invalid');
      const params = Promise.resolve({ type: 'invalid' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid stat type');
    });
  });

  describe('POST - Update Stats', () => {
    it('should update stats for valid request', async () => {
      const mockStats = { 'test-item': 5 };
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view', {
        method: 'POST',
        body: JSON.stringify({ id: 'test-item' }),
      });
      const params = Promise.resolve({ type: 'view' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('test-item');
      expect(data.data.count).toBe(6);
    });

    it('should handle new item creation', async () => {
      const mockStats = {};
      const fs = await import('fs/promises');
      (fs.default.readFile as Mock).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost/api/stats/view', {
        method: 'POST',
        body: JSON.stringify({ id: 'new-item' }),
      });
      const params = Promise.resolve({ type: 'view' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('new-item');
      expect(data.data.count).toBe(1);
    });

    it('should return error for missing id', async () => {
      const request = new NextRequest('http://localhost/api/stats/view', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const params = Promise.resolve({ type: 'view' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ID is required');
    });

    it('should return error for empty id', async () => {
      const request = new NextRequest('http://localhost/api/stats/view', {
        method: 'POST',
        body: JSON.stringify({ id: '' }),
      });
      const params = Promise.resolve({ type: 'view' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ID is required');
    });

    it('should return error for invalid stat type', async () => {
      const request = new NextRequest('http://localhost/api/stats/invalid', {
        method: 'POST',
        body: JSON.stringify({ id: 'test' }),
      });
      const params = Promise.resolve({ type: 'invalid' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid stat type');
    });

    it('should handle file system errors', async () => {
      const fs = await import('fs/promises');
      const { AppErrorHandler } = await import('@/lib/utils/error-handling');

      (fs.default.readFile as Mock).mockRejectedValue(new Error('File system error'));
      (fs.default.writeFile as Mock).mockRejectedValue(new Error('Write failed'));
      (AppErrorHandler.handleApiError as Mock).mockReturnValue({
        code: 'FILE_ERROR',
        message: 'File system error',
        timestamp: new Date().toISOString(),
      });

      const request = new NextRequest('http://localhost/api/stats/view', {
        method: 'POST',
        body: JSON.stringify({ id: 'test' }),
      });
      const params = Promise.resolve({ type: 'view' });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to update statistics');
    });
  });
});
