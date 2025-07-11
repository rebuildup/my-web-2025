import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock environment variables
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'development',
  },
}));

describe('DevTools API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/devtools', () => {
    it('should return development environment info', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        environment: 'development',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      });
    });

    it('should return proper response headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools');
      const response = await GET(request);

      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate');
    });

    it('should include timestamp in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools');
      const response = await GET(request);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(typeof data.timestamp).toBe('string');
      expect(new Date(data.timestamp)).toBeInstanceOf(Date);
    });

    it('should include uptime in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools');
      const response = await GET(request);
      const data = await response.json();

      expect(data.uptime).toBeDefined();
      expect(typeof data.uptime).toBe('number');
      expect(data.uptime).toBeGreaterThan(0);
    });

    it('should handle different request URLs', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?test=1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'User-Agent': 'Test Agent',
          Accept: 'application/json',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?debug=true&verbose=1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with different HTTP methods', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        method: 'GET',
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with custom headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'X-Custom-Header': 'test-value',
          Authorization: 'Bearer test-token',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with empty headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {},
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with null headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: null as any,
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with undefined headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: undefined as any,
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with malformed URL', async () => {
      const request = new NextRequest('invalid-url');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with special characters in URL', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?param=test%20value&special=!@#$%^&*()'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with very long URL', async () => {
      const longParam = 'a'.repeat(1000);
      const request = new NextRequest(`http://localhost:3000/api/devtools?param=${longParam}`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with multiple query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?param1=value1&param2=value2&param3=value3'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with empty query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?param=');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with duplicate query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?param=value1&param=value2'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with numeric query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?number=123&float=3.14');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with boolean query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?bool1=true&bool2=false');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with array-like query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?array[]=value1&array[]=value2'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with object-like query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools?obj[key]=value');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with encoded query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?encoded=%20%21%22%23%24%25%26%27%28%29'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with unicode query parameters', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/devtools?unicode=こんにちは&emoji=🎉'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with very large query parameters', async () => {
      const largeParam = 'x'.repeat(10000);
      const request = new NextRequest(`http://localhost:3000/api/devtools?large=${largeParam}`);
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with special HTTP methods in headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'X-HTTP-Method-Override': 'POST',
          'X-Forwarded-Method': 'PUT',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with authentication headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          'X-API-Key': 'test-api-key',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with content-type headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/xml',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with user-agent headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with referer headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          Referer: 'http://localhost:3000/admin',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with cookie headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          Cookie: 'session=abc123; theme=dark; lang=en',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with x-forwarded headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'X-Forwarded-For': '192.168.1.1',
          'X-Forwarded-Proto': 'https',
          'X-Forwarded-Host': 'example.com',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with custom x-headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'X-Custom-Header-1': 'value1',
          'X-Custom-Header-2': 'value2',
          'X-Custom-Header-3': 'value3',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with empty string headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Empty-Header': '',
          'Another-Empty': '',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with whitespace-only headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Whitespace-Header': '   ',
          'Tab-Header': '\t',
          'Newline-Header': '\n',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with very long header values', async () => {
      const longValue = 'x'.repeat(1000);
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Long-Header': longValue,
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with special characters in headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Special-Header': '!@#$%^&*()_+-=[]{}|;:,.<>?',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });

    it('should handle request with unicode characters in headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/devtools', {
        headers: {
          'Unicode-Header': 'こんにちは世界🎉',
        },
      });
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.environment).toBe('development');
    });
  });
});
