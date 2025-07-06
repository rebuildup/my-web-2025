import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';

// Mock file system operations
const mockWriteFileSync = vi.fn();
const mockReadFileSync = vi.fn();
const mockExistsSync = vi.fn();
const mockMkdirSync = vi.fn();

vi.mock('fs', () => ({
  writeFileSync: mockWriteFileSync,
  readFileSync: mockReadFileSync,
  existsSync: mockExistsSync,
  mkdirSync: mockMkdirSync,
}));

vi.mock('path', () => ({
  join: (...paths: string[]) => paths.join('/'),
}));

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock process.cwd()
  vi.spyOn(process, 'cwd').mockReturnValue('/test');
  
  // Mock console methods
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('/api/analytics/performance', () => {
  describe('POST', () => {
    it('should record a valid performance metric', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('[]');

      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
        url: '/test',
        userAgent: 'Test Agent',
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Performance metric recorded');
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const requestBody = {
        name: 'LCP',
        // Missing value, rating, timestamp
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Missing required fields');
    });

    it('should validate metric name', async () => {
      const requestBody = {
        name: 'INVALID_METRIC',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid metric name');
    });

    it('should validate rating', async () => {
      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'invalid-rating',
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid rating');
    });

    it('should create analytics directory if it does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      expect(mockMkdirSync).toHaveBeenCalledWith(
        '/test/public/data/analytics',
        { recursive: true }
      );
    });

    it('should handle file read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load performance data:',
        expect.any(Error)
      );
    });

    it('should limit stored metrics to 1000', async () => {
      const existingMetrics = Array(999).fill(null).map((_, i) => ({
        name: 'LCP',
        value: 2000 + i,
        rating: 'good',
        timestamp: Date.now() - i,
        url: '/',
        userAgent: 'Test',
      }));
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(existingMetrics));

      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      // Should write exactly 1000 metrics
      const savedData = JSON.parse(mockWriteFileSync.mock.calls[0][1]);
      expect(savedData).toHaveLength(1000);
    });

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
    });

    it('should use default values for optional fields', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('[]');

      const requestBody = {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
        // No url or userAgent
      };

      const request = new NextRequest('http://localhost/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      const savedData = JSON.parse(mockWriteFileSync.mock.calls[0][1]);
      expect(savedData[0].url).toBe('/');
      expect(savedData[0].userAgent).toBe('Unknown');
    });
  });

  describe('GET', () => {
    const mockMetrics = [
      {
        name: 'LCP',
        value: 2000,
        rating: 'good',
        timestamp: Date.now(),
        url: '/',
        userAgent: 'Test',
      },
      {
        name: 'FID',
        value: 50,
        rating: 'good',
        timestamp: Date.now() - 1000,
        url: '/about',
        userAgent: 'Test',
      },
      {
        name: 'CLS',
        value: 0.15,
        rating: 'needs-improvement',
        timestamp: Date.now() - 100000000, // Very old
        url: '/',
        userAgent: 'Test',
      },
    ];

    it('should return performance analytics summary', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockMetrics));

      const request = new NextRequest('http://localhost/api/analytics/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('metrics');
      expect(data.data).toHaveProperty('summary');
      expect(data.data.summary).toHaveProperty('totalSamples');
      expect(data.data.summary).toHaveProperty('avgLCP');
      expect(data.data.summary).toHaveProperty('score');
    });

    it('should filter metrics by date range', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockMetrics));

      const request = new NextRequest('http://localhost/api/analytics/performance?days=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metrics.length).toBeLessThan(mockMetrics.length);
    });

    it('should return CSV format when requested', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockMetrics.slice(0, 2))); // Only recent metrics

      const request = new NextRequest('http://localhost/api/analytics/performance?format=csv');
      const response = await GET(request);
      const csvData = await response.text();

      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('performance-30days.csv');
      expect(csvData).toContain('Timestamp,Name,Value,Rating,URL,UserAgent');
      expect(csvData).toContain('LCP');
      expect(csvData).toContain('FID');
    });

    it('should handle missing performance file', async () => {
      mockExistsSync.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/analytics/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.metrics).toHaveLength(0);
      expect(data.data.summary.score).toBe(100);
    });

    it('should calculate correct summary statistics', async () => {
      const testMetrics = [
        { name: 'LCP', value: 2000, rating: 'good', timestamp: Date.now(), url: '/', userAgent: 'Test' },
        { name: 'LCP', value: 3000, rating: 'needs-improvement', timestamp: Date.now(), url: '/', userAgent: 'Test' },
        { name: 'FID', value: 100, rating: 'good', timestamp: Date.now(), url: '/', userAgent: 'Test' },
      ];

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(testMetrics));

      const request = new NextRequest('http://localhost/api/analytics/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.summary.totalSamples).toBe(3);
      expect(data.data.summary.avgLCP).toBe(2500); // (2000 + 3000) / 2
      expect(data.data.summary.avgFID).toBe(100);
      expect(data.data.summary.goodSamples).toBe(2);
      expect(data.data.summary.score).toBe(67); // 2/3 * 100, rounded
    });

    it('should handle file read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const request = new NextRequest('http://localhost/api/analytics/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.metrics).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load performance data:',
        expect.any(Error)
      );
    });

    it('should handle internal server errors', async () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('Filesystem error');
      });

      const request = new NextRequest('http://localhost/api/analytics/performance');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(console.error).toHaveBeenCalledWith(
        'Performance analytics error:',
        expect.any(Error)
      );
    });
  });
});