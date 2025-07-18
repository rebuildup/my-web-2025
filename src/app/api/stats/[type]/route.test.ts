import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { getStats, getTopStats, trackStat } from '@/lib/stats';

// Mock stats functions
vi.mock('@/lib/stats', () => ({
  trackStat: vi.fn(),
  getStats: vi.fn(),
  getTopStats: vi.fn(),
}));

describe('Stats API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET', () => {
    it('should return statistics for a valid type', async () => {
      // Mock getStats to return test data
      (getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
        'item-1': 5,
        'item-2': 10,
      });

      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        'item-1': 5,
        'item-2': 10,
      });
      expect(getStats).toHaveBeenCalledWith('view');
    });

    it('should return statistics for a specific ID', async () => {
      // Mock getStats to return test data
      (getStats as ReturnType<typeof vi.fn>).mockResolvedValue({
        'item-1': 5,
      });

      const url = new URL('http://localhost/api/stats/view?id=item-1');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        'item-1': 5,
      });
      expect(getStats).toHaveBeenCalledWith('view', 'item-1');
    });

    it('should return top statistics', async () => {
      // Mock getTopStats to return test data
      (getTopStats as ReturnType<typeof vi.fn>).mockResolvedValue([
        ['item-2', 10],
        ['item-1', 5],
      ]);

      const url = new URL('http://localhost/api/stats/view?top=true&limit=2');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([
        ['item-2', 10],
        ['item-1', 5],
      ]);
      expect(getTopStats).toHaveBeenCalledWith('view', 2);
    });

    it('should validate content type', async () => {
      const url = new URL('http://localhost/api/stats/invalid');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid statistic type');
    });

    it('should handle errors', async () => {
      // Mock getStats to throw an error
      (getStats as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to load stats'));

      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle top stats errors', async () => {
      (getTopStats as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Failed to load top stats')
      );

      const url = new URL('http://localhost/api/stats/view?top=5');
      const request = new NextRequest(url);
      const response = await GET(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST', () => {
    it('should track a new statistic', async () => {
      // Mock trackStat to return count
      (trackStat as ReturnType<typeof vi.fn>).mockResolvedValue(6);

      const trackData = {
        id: 'new-item',
        count: 1,
      };

      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.count).toBe(6);
      expect(trackStat).toHaveBeenCalledWith('view', 'new-item');
    });

    it('should validate content type in POST', async () => {
      const url = new URL('http://localhost/api/stats/invalid');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test', count: 1 }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'invalid' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid statistic type');
    });

    it('should require an ID', async () => {
      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('ID is required');
    });

    it('should handle tracking errors', async () => {
      // Mock trackStat to throw an error
      (trackStat as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to track stat'));

      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'test', count: 1 }),
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const url = new URL('http://localhost/api/stats/view');
      const request = new NextRequest(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      const response = await POST(request, { params: Promise.resolve({ type: 'view' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});
