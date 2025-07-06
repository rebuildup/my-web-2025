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

describe('/api/analytics/accessibility', () => {
  describe('POST', () => {
    it('should record a valid accessibility report', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('[]');

      const requestBody = {
        violations: [
          {
            id: 'missing-alt-text',
            impact: 'serious',
            description: 'Image missing alternative text',
            helpUrl: 'https://example.com/help',
            tags: ['wcag2a'],
          },
        ],
        passes: 10,
        incomplete: 0,
        score: 85,
        timestamp: Date.now(),
        url: '/test',
        userAgent: 'Test Agent',
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
      expect(data.message).toBe('Accessibility report recorded');
      expect(mockWriteFileSync).toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const requestBody = {
        // Missing violations, score, timestamp
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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

    it('should validate score range', async () => {
      const requestBody = {
        violations: [],
        score: 150, // Invalid score
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
      expect(data.error).toBe('Score must be between 0 and 100');
    });

    it('should validate violation structure', async () => {
      const requestBody = {
        violations: [
          {
            id: 'test',
            // Missing impact and description
          },
        ],
        score: 85,
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
      expect(data.error).toBe('Invalid violation structure');
    });

    it('should validate violation impact', async () => {
      const requestBody = {
        violations: [
          {
            id: 'test',
            impact: 'invalid-impact',
            description: 'Test description',
          },
        ],
        score: 85,
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
      expect(data.error).toBe('Invalid violation impact');
    });

    it('should create analytics directory if it does not exist', async () => {
      mockExistsSync.mockReturnValue(false);

      const requestBody = {
        violations: [],
        score: 100,
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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

    it('should limit stored reports to 500', async () => {
      const existingReports = Array(499).fill(null).map((_, i) => ({
        violations: [],
        passes: 10,
        incomplete: 0,
        score: 90,
        timestamp: Date.now() - i,
        url: '/',
        userAgent: 'Test',
      }));
      
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(existingReports));

      const requestBody = {
        violations: [],
        score: 100,
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      // Should write exactly 500 reports
      const savedData = JSON.parse(mockWriteFileSync.mock.calls[0][1]);
      expect(savedData).toHaveLength(500);
    });

    it('should use default values for optional fields', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('[]');

      const requestBody = {
        violations: [],
        score: 100,
        timestamp: Date.now(),
        // No url, userAgent, passes, incomplete
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
      expect(savedData[0].passes).toBe(0);
      expect(savedData[0].incomplete).toBe(0);
    });

    it('should handle file system errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const requestBody = {
        violations: [],
        score: 100,
        timestamp: Date.now(),
      };

      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
        'Failed to load accessibility data:',
        expect.any(Error)
      );
    });

    it('should handle JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost/api/analytics/accessibility', {
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
  });

  describe('GET', () => {
    const mockReports = [
      {
        violations: [
          {
            id: 'missing-alt-text',
            impact: 'serious',
            description: 'Image missing alternative text',
            helpUrl: 'https://example.com/help',
            tags: ['wcag2a'],
          },
        ],
        passes: 10,
        incomplete: 0,
        score: 85,
        timestamp: Date.now(),
        url: '/',
        userAgent: 'Test Agent',
      },
      {
        violations: [
          {
            id: 'missing-form-label',
            impact: 'critical',
            description: 'Form element missing label',
            helpUrl: 'https://example.com/help',
            tags: ['wcag2a'],
          },
          {
            id: 'missing-alt-text',
            impact: 'serious',
            description: 'Image missing alternative text',
            helpUrl: 'https://example.com/help',
            tags: ['wcag2a'],
          },
        ],
        passes: 5,
        incomplete: 1,
        score: 60,
        timestamp: Date.now() - 1000,
        url: '/about',
        userAgent: 'Test Agent',
      },
      {
        violations: [],
        passes: 20,
        incomplete: 0,
        score: 100,
        timestamp: Date.now() - 100000000, // Very old
        url: '/',
        userAgent: 'Test Agent',
      },
    ];

    it('should return accessibility analytics summary', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockReports));

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('reports');
      expect(data.data).toHaveProperty('summary');
      expect(data.data.summary).toHaveProperty('totalReports');
      expect(data.data.summary).toHaveProperty('avgScore');
      expect(data.data.summary).toHaveProperty('totalViolations');
      expect(data.data.summary).toHaveProperty('mostCommonViolations');
      expect(data.data.summary).toHaveProperty('scoreDistribution');
    });

    it('should filter reports by date range', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockReports));

      const request = new NextRequest('http://localhost/api/analytics/accessibility?days=1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.reports.length).toBeLessThan(mockReports.length);
    });

    it('should filter reports by URL', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockReports));

      const request = new NextRequest('http://localhost/api/analytics/accessibility?url=/about');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.reports).toHaveLength(1);
      expect(data.data.reports[0].url).toBe('/about');
    });

    it('should return CSV format when requested', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(mockReports.slice(0, 2))); // Only recent reports

      const request = new NextRequest('http://localhost/api/analytics/accessibility?format=csv');
      const response = await GET(request);
      const csvData = await response.text();

      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('accessibility-30days.csv');
      expect(csvData).toContain('Timestamp,URL,Score,Violations,Critical,Serious,Moderate,Minor,UserAgent');
      expect(csvData).toContain('85');
      expect(csvData).toContain('60');
    });

    it('should calculate correct summary statistics', async () => {
      const testReports = [
        {
          violations: [
            { id: 'test1', impact: 'critical', description: 'Test', helpUrl: '', tags: [] },
            { id: 'test2', impact: 'serious', description: 'Test', helpUrl: '', tags: [] },
          ],
          passes: 10,
          incomplete: 0,
          score: 50, // Fair
          timestamp: Date.now(),
          url: '/',
          userAgent: 'Test',
        },
        {
          violations: [
            { id: 'test1', impact: 'critical', description: 'Test', helpUrl: '', tags: [] },
          ],
          passes: 15,
          incomplete: 0,
          score: 80, // Good
          timestamp: Date.now(),
          url: '/',
          userAgent: 'Test',
        },
        {
          violations: [],
          passes: 20,
          incomplete: 0,
          score: 95, // Excellent
          timestamp: Date.now(),
          url: '/',
          userAgent: 'Test',
        },
      ];

      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(JSON.stringify(testReports));

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data.summary.totalReports).toBe(3);
      expect(data.data.summary.avgScore).toBe(75); // (50 + 80 + 95) / 3
      expect(data.data.summary.totalViolations).toBe(3);
      expect(data.data.summary.criticalViolations).toBe(2);
      expect(data.data.summary.seriousViolations).toBe(1);
      expect(data.data.summary.mostCommonViolations[0]).toEqual({
        id: 'test1',
        count: 2,
        impact: 'critical',
      });
      expect(data.data.summary.scoreDistribution.excellent).toBe(1);
      expect(data.data.summary.scoreDistribution.good).toBe(1);
      expect(data.data.summary.scoreDistribution.fair).toBe(1);
      expect(data.data.summary.scoreDistribution.poor).toBe(0);
    });

    it('should handle missing accessibility file', async () => {
      mockExistsSync.mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.reports).toHaveLength(0);
      expect(data.data.summary.avgScore).toBe(100);
    });

    it('should handle empty reports array', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('[]');

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary.totalReports).toBe(0);
      expect(data.data.summary.avgScore).toBe(100);
      expect(data.data.summary.mostCommonViolations).toHaveLength(0);
    });

    it('should handle file read errors gracefully', async () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockImplementation(() => {
        throw new Error('File read error');
      });

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.reports).toHaveLength(0);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to load accessibility data:',
        expect.any(Error)
      );
    });

    it('should handle internal server errors', async () => {
      mockExistsSync.mockImplementation(() => {
        throw new Error('Filesystem error');
      });

      const request = new NextRequest('http://localhost/api/analytics/accessibility');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Internal server error');
      expect(console.error).toHaveBeenCalledWith(
        'Accessibility analytics error:',
        expect.any(Error)
      );
    });
  });
});