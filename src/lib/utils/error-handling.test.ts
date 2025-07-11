import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppErrorHandler,
  ErrorBoundaryHelper,
  withErrorHandling,
  retryOperation,
  FormErrorHandler,
  setupGlobalErrorHandlers,
  handleFetchError,
  safeJSONParse,
  type FormErrorState,
} from './error-handling';

describe('Error Handling Utilities', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('AppErrorHandler', () => {
    it('should handle ContentError correctly', () => {
      const contentError = new (class extends Error {
        code = 'TEST_CODE';
        details = { extra: 'data' };
        constructor(message: string) {
          super(message);
          this.name = 'ContentError';
        }
      })('Test error');

      const result = AppErrorHandler.handleApiError(contentError);

      expect(result).toMatchObject({
        code: 'APPLICATION_ERROR',
        message: 'Test error',
        details: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should handle generic Error', () => {
      const error = new Error('Generic error');
      const result = AppErrorHandler.handleApiError(error);

      expect(result).toMatchObject({
        code: 'APPLICATION_ERROR',
        message: 'Generic error',
        details: expect.any(String),
        timestamp: expect.any(String),
      });
    });

    it('should handle unknown error types', () => {
      const result = AppErrorHandler.handleApiError('string error');

      expect(result).toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        details: 'string error',
        timestamp: expect.any(String),
      });
    });

    it('should log errors', () => {
      const error = {
        code: 'TEST_ERROR',
        message: 'Test message',
        timestamp: '2023-01-01T00:00:00Z',
      };

      AppErrorHandler.logError(error, 'Test context');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          ...error,
          context: 'Test context',
        })
      );
    });

    it('should create network errors', () => {
      const error = AppErrorHandler.createNetworkError(404, 'Custom message');

      expect(error.message).toBe('Custom message');
      expect(error.code).toBe('NETWORK_ERROR_404');
    });

    it('should create validation errors', () => {
      const error = AppErrorHandler.createValidationError('email', 'Invalid format');

      expect(error.message).toBe('Validation failed for email: Invalid format');
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('ErrorBoundaryHelper', () => {
    it('should log component errors', () => {
      const error = new Error('Component failed');
      const errorInfo = { componentStack: 'Component stack trace' };
      const logErrorSpy = vi.spyOn(AppErrorHandler, 'logError');

      ErrorBoundaryHelper.logComponentError(error, errorInfo, 'TestComponent');

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMPONENT_ERROR',
          message: 'Component failed',
        }),
        'React Error Boundary'
      );

      logErrorSpy.mockRestore();
    });

    it('should get error fallback element', () => {
      const error = new Error('Test error');
      const fallback = ErrorBoundaryHelper.getErrorFallback(error, 'TestComponent');

      expect(fallback.type).toBe('div');
      expect((fallback.props as { className: string }).className).toBe('error-boundary');
    });
  });

  describe('withErrorHandling', () => {
    it('should handle successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withErrorHandling(operation, 'test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle failed operations', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      const result = await withErrorHandling(operation, 'test operation', 'default');

      expect(result).toBe('default');
    });

    it('should return undefined when no fallback provided', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      const result = await withErrorHandling(operation, 'test operation');

      expect(result).toBeUndefined();
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after maximum retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryOperation(operation, 2, 10)).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('FormErrorHandler', () => {
    it('should parse API errors from array format', () => {
      const response = {
        errors: [
          { field: 'email', message: 'Invalid email' },
          { field: 'password', message: 'Too short' },
          { field: 'email', message: 'Already exists' },
        ],
      };

      const result = FormErrorHandler.parseAPIErrors(response);

      expect(result).toEqual({
        email: ['Invalid email', 'Already exists'],
        password: ['Too short'],
      });
    });

    it('should parse API errors from object format', () => {
      const response = {
        errors: {
          email: ['Invalid email', 'Already exists'],
          password: 'Too short',
        },
      };

      const result = FormErrorHandler.parseAPIErrors(response);

      expect(result).toEqual({
        email: ['Invalid email', 'Already exists'],
        password: ['Too short'],
      });
    });

    it('should get first error for field', () => {
      const errors: FormErrorState = {
        email: ['Invalid email', 'Already exists'],
        password: ['Too short'],
      };

      expect(FormErrorHandler.getFirstError(errors, 'email')).toBe('Invalid email');
      expect(FormErrorHandler.getFirstError(errors, 'nonexistent')).toBeUndefined();
    });

    it('should check if has errors', () => {
      const errors: FormErrorState = {
        email: ['Invalid email'],
      };

      expect(FormErrorHandler.hasErrors(errors)).toBe(true);
      expect(FormErrorHandler.hasErrors({})).toBe(false);
    });

    it('should clear field error', () => {
      const errors: FormErrorState = {
        email: ['Invalid email'],
        password: ['Too short'],
      };

      const result = FormErrorHandler.clearFieldError(errors, 'email');

      expect(result).toEqual({
        password: ['Too short'],
      });
    });

    it('should set field error', () => {
      const errors: FormErrorState = {
        password: ['Too short'],
      };

      const result = FormErrorHandler.setFieldError(errors, 'email', 'Required field');

      expect(result).toEqual({
        password: ['Too short'],
        email: ['Required field'],
      });
    });
  });

  describe('handleFetchError', () => {
    it('should handle 404 error', async () => {
      const response = {
        status: 404,
        statusText: 'Not Found',
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Resource not found' }),
      } as unknown as Response;

      await expect(handleFetchError(response)).rejects.toThrow();
    });

    it('should handle 500 error', async () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Server error' }),
      } as unknown as Response;

      await expect(handleFetchError(response)).rejects.toThrow();
    });

    it('should handle response without JSON', async () => {
      const response = {
        status: 400,
        statusText: 'Bad Request',
        ok: false,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response;

      await expect(handleFetchError(response)).rejects.toThrow();
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"name": "test"}', {});
      expect(result).toEqual({ name: 'test' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJSONParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });

    it('should return fallback for empty string', () => {
      const fallback = { default: true };
      const result = safeJSONParse('', fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('setupGlobalErrorHandlers', () => {
    it('should setup global error handlers', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      setupGlobalErrorHandlers();

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });
  });
});
