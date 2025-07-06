import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

describe('Stats API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = mockConsole.error;
    console.warn = mockConsole.warn;
    console.log = mockConsole.log;
  });

  describe('GET - Get Stats', () => {
    it('should return stats for valid type', async () => {
      const mockStats = {
        'test-item': 100,
        'another-item': 50,
      };

      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost:3000/api/stats/view');
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(data.total).toBe(150);
      expect(data.itemCount).toBe(2);
    });

    it('should return item stats when id parameter is provided', async () => {
      const mockStats = {
        'test-item': 50,
        'other-item': 25,
      };

      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost:3000/api/stats/view?id=test-item');
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBe(50);
      expect(data.id).toBe('test-item');
      expect(data.type).toBe('view');
    });

    it('should return all stats when no parameters are provided', async () => {
      const mockStats = {
        item1: 100,
        item2: 90,
      };

      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockStats));

      const request = new NextRequest('http://localhost:3000/api/stats/view');
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockStats);
      expect(data.total).toBe(190);
      expect(data.itemCount).toBe(2);
    });

    it('should return 400 for invalid stats type', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/invalid');
      const response = await GET(request, { params: Promise.resolve({ type: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid stat type');
    });

    it('should handle stats error gracefully', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File read failed'));

      const request = new NextRequest('http://localhost:3000/api/stats/view');
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({});
      expect(data.total).toBe(0);
      expect(data.itemCount).toBe(0);
    });
  });

  describe('POST - Update Stats', () => {
    it('should update stats for valid request', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ 'test-item': 5 }));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-item',
        }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('test-item');
      expect(data.data.count).toBe(6);
      expect(data.data.type).toBe('view');
    });

    it('should handle new item creation', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'new-item',
        }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('new-item');
      expect(data.data.count).toBe(1);
    });

    it('should handle missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('ID is required and must be a non-empty string');
    });

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to update statistics');
    });

    it('should return 400 for invalid stats type', async () => {
      const request = new NextRequest('http://localhost:3000/api/stats/invalid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test' }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid stat type');
    });

    it('should handle update error gracefully', async () => {
      const fs = await import('fs/promises');
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File read failed'));

      const request = new NextRequest('http://localhost:3000/api/stats/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test-item' }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to update statistics');
    });
  });
});
