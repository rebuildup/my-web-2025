import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecaptchaService } from './recaptcha-service';

// Mock fetch
global.fetch = vi.fn();

describe('RecaptchaService', () => {
  let recaptchaService: RecaptchaService;
  const mockSecretKey = 'test-secret-key';

  beforeEach(() => {
    vi.resetAllMocks();
    recaptchaService = new RecaptchaService(mockSecretKey);

    // Default mock implementation for fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, score: 0.9 }),
    });
  });

  describe('verifyToken', () => {
    it('should verify a token successfully', async () => {
      const result = await recaptchaService.verifyToken('valid-token');

      expect(result.success).toBe(true);
      expect(result.score).toBe(0.9);

      // Check that fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('valid-token'),
        })
      );
    });

    it('should include remote IP if provided', async () => {
      await recaptchaService.verifyToken('valid-token', '192.168.1.1');

      // Check that fetch was called with correct parameters
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        expect.objectContaining({
          body: expect.stringContaining('remoteip=192.168.1.1'),
        })
      );
    });

    it('should handle verification failure', async () => {
      // Mock fetch to return failure
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: false,
            'error-codes': ['invalid-input-response'],
          }),
      });

      const result = await recaptchaService.verifyToken('invalid-token');

      expect(result.success).toBe(false);
      expect(result.errorCodes).toContain('invalid-input-response');
    });

    it('should handle API errors', async () => {
      // Mock fetch to throw an error
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const result = await recaptchaService.verifyToken('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle non-OK responses', async () => {
      // Mock fetch to return non-OK response
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await recaptchaService.verifyToken('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should skip verification in development mode if configured', async () => {
      // Mock environment variables
      const originalEnv = process.env.SKIP_RECAPTCHA_IN_DEV;
      process.env.SKIP_RECAPTCHA_IN_DEV = 'true';

      // Create service with development mode
      const devService = new RecaptchaService(mockSecretKey, true);
      const result = await devService.verifyToken('any-token');

      expect(result.success).toBe(true);
      expect(result.score).toBe(1.0);
      expect(global.fetch).not.toHaveBeenCalled();

      // Restore environment
      process.env.SKIP_RECAPTCHA_IN_DEV = originalEnv;
    });
  });

  describe('verifyTokenWithScore', () => {
    it('should pass verification with score above threshold', async () => {
      // Mock fetch to return high score
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, score: 0.9 }),
      });

      const result = await recaptchaService.verifyTokenWithScore('valid-token', 0.5);

      expect(result.success).toBe(true);
      expect(result.score).toBe(0.9);
    });

    it('should fail verification with score below threshold', async () => {
      // Mock fetch to return low score
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, score: 0.3 }),
      });

      const result = await recaptchaService.verifyTokenWithScore('valid-token', 0.5);

      expect(result.success).toBe(false);
      expect(result.score).toBe(0.3);
      expect(result.error).toContain('below threshold');
    });

    it('should use default threshold of 0.5 if not specified', async () => {
      // Mock fetch to return score just below default threshold
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, score: 0.49 }),
      });

      const result = await recaptchaService.verifyTokenWithScore('valid-token');

      expect(result.success).toBe(false);
      expect(result.error).toContain('below threshold (0.5)');
    });
  });
});
