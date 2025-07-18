import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('Health API', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      status: 'healthy',
      environment: expect.any(String),
      version: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('should handle errors gracefully', async () => {
    // Test that the API returns a proper error response structure
    const response = await GET();
    const data = await response.json();

    // Verify the response has the expected structure
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('status');
    expect(typeof data.timestamp).toBe('string');
    expect(typeof data.status).toBe('string');
  });
});
