import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createErrorHandler,
  logError,
  validateEmail,
  validateUrl,
  validateRequired,
  formatError,
  createRetryWrapper,
  validateForm,
  ErrorBoundary,
  type ValidationRule,
  type ErrorHandlerOptions,
  type RetryOptions
} from './error-handling';

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn()
};

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    global.console = { ...console, ...mockConsole };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user123@test-domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test.domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateEmail('a@b.co')).toBe(true);
      expect(validateEmail('test@domain')).toBe(false);
      expect(validateEmail('test..test@domain.com')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should validate correct URLs', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://test.org')).toBe(true);
      expect(validateUrl('https://subdomain.example.com/path?query=1')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
      expect(validateUrl('javascript:alert(1)')).toBe(false);
      expect(validateUrl('')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(validateUrl('https://localhost:3000')).toBe(true);
      expect(validateUrl('http://192.168.1.1')).toBe(true);
      expect(validateUrl('https://')).toBe(false);
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('test')).toBe(true);
      expect(validateRequired('0')).toBe(true);
      expect(validateRequired(0)).toBe(true);
      expect(validateRequired(false)).toBe(true);
    });

    it('should reject empty values', () => {
      expect(validateRequired('')).toBe(false);
      expect(validateRequired('   ')).toBe(false);
      expect(validateRequired(null)).toBe(false);
      expect(validateRequired(undefined)).toBe(false);
    });

    it('should handle arrays and objects', () => {
      expect(validateRequired([])).toBe(false);
      expect(validateRequired(['item'])).toBe(true);
      expect(validateRequired({})).toBe(false);
      expect(validateRequired({ key: 'value' })).toBe(true);
    });
  });

  describe('formatError', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');
      const formatted = formatError(error);
      
      expect(formatted).toMatchObject({
        message: 'Test error',
        name: 'Error',
        stack: expect.any(String)
      });
    });

    it('should format string errors', () => {
      const formatted = formatError('String error');
      
      expect(formatted).toMatchObject({
        message: 'String error',
        name: 'UnknownError',
        stack: null
      });
    });

    it('should format object errors', () => {
      const errorObj = { message: 'Custom error', code: 500 };
      const formatted = formatError(errorObj);
      
      expect(formatted).toMatchObject({
        message: 'Custom error',
        name: 'UnknownError',
        code: 500,
        stack: null
      });
    });

    it('should handle null and undefined', () => {
      expect(formatError(null)).toMatchObject({
        message: 'Unknown error occurred',
        name: 'UnknownError',
        stack: null
      });
      
      expect(formatError(undefined)).toMatchObject({
        message: 'Unknown error occurred',
        name: 'UnknownError',
        stack: null
      });
    });
  });

  describe('logError', () => {
    it('should log errors with context', () => {
      const error = new Error('Test error');
      const context = { userId: '123', action: 'save' };
      
      logError(error, context);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error',
          context
        })
      );
    });

    it('should log errors without context', () => {
      const error = new Error('Test error');
      
      logError(error);
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Error occurred:',
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });
  });

  describe('createErrorHandler', () => {
    it('should create error handler with default options', () => {
      const handler = createErrorHandler();
      
      expect(typeof handler).toBe('function');
    });

    it('should handle errors with custom onError callback', () => {
      const onError = vi.fn();
      const handler = createErrorHandler({ onError });
      const error = new Error('Test error');
      
      handler(error);
      
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });

    it('should handle errors with custom context', () => {
      const onError = vi.fn();
      const handler = createErrorHandler({ onError, context: { module: 'test' } });
      const error = new Error('Test error');
      
      handler(error);
      
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error',
          context: { module: 'test' }
        })
      );
    });

    it('should log to console when enabled', () => {
      const handler = createErrorHandler({ logToConsole: true });
      const error = new Error('Test error');
      
      handler(error);
      
      expect(mockConsole.error).toHaveBeenCalled();
    });
  });

  describe('createRetryWrapper', () => {
    it('should execute function successfully on first try', async () => {
      const successFn = vi.fn().mockResolvedValue('success');
      const retryWrapper = createRetryWrapper({ maxRetries: 3, delay: 10 });
      
      const result = await retryWrapper(successFn);
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let callCount = 0;
      const flakeyFn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve('success');
      });
      
      const retryWrapper = createRetryWrapper({ maxRetries: 3, delay: 10 });
      
      const result = await retryWrapper(flakeyFn);
      
      expect(result).toBe('success');
      expect(flakeyFn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries exceeded', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      const retryWrapper = createRetryWrapper({ maxRetries: 2, delay: 10 });
      
      await expect(retryWrapper(failingFn)).rejects.toThrow('Persistent failure');
      expect(failingFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect backoff multiplier', async () => {
      const failingFn = vi.fn().mockRejectedValue(new Error('Failure'));
      const retryWrapper = createRetryWrapper({ 
        maxRetries: 2, 
        delay: 10, 
        backoffMultiplier: 2 
      });
      
      const startTime = Date.now();
      
      try {
        await retryWrapper(failingFn);
      } catch (error) {
        // Expected to fail
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should wait 10ms + 20ms (with backoff) = at least 30ms
      expect(duration).toBeGreaterThanOrEqual(25);
      expect(failingFn).toHaveBeenCalledTimes(3);
    });
  });

  describe('validateForm', () => {
    const validationRules: ValidationRule[] = [
      {
        field: 'email',
        validator: validateEmail,
        message: 'Invalid email address'
      },
      {
        field: 'name',
        validator: validateRequired,
        message: 'Name is required'
      },
      {
        field: 'website',
        validator: validateUrl,
        message: 'Invalid website URL'
      }
    ];

    it('should validate form with valid data', () => {
      const formData = {
        email: 'test@example.com',
        name: 'John Doe',
        website: 'https://example.com'
      };
      
      const result = validateForm(formData, validationRules);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should return errors for invalid data', () => {
      const formData = {
        email: 'invalid-email',
        name: '',
        website: 'not-a-url'
      };
      
      const result = validateForm(formData, validationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        email: 'Invalid email address',
        name: 'Name is required',
        website: 'Invalid website URL'
      });
    });

    it('should handle partial validation', () => {
      const formData = {
        email: 'test@example.com',
        name: '',
        website: 'https://example.com'
      };
      
      const result = validateForm(formData, validationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual({
        name: 'Name is required'
      });
    });

    it('should handle missing fields', () => {
      const formData = {
        email: 'test@example.com'
        // name and website missing
      };
      
      const result = validateForm(formData, validationRules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toMatchObject({
        name: 'Name is required',
        website: 'Invalid website URL'
      });
    });
  });

  describe('ErrorBoundary', () => {
    it('should create error boundary component', () => {
      expect(typeof ErrorBoundary).toBe('function');
    });

    it('should be a valid React component', () => {
      const instance = new ErrorBoundary({});
      expect(instance).toBeDefined();
      expect(typeof instance.componentDidCatch).toBe('function');
      expect(typeof instance.render).toBe('function');
    });
  });
});