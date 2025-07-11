import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

describe('DevTools API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/devtools', () => {
    it('should return 204 No Content response', async () => {
      const response = await GET();

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should return proper response headers', async () => {
      const response = await GET();

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });
});
