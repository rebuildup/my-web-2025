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
import { ContentError, type AppError } from '@/types/content';

// Mock console methods
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
};

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe('Error Handling Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = mockConsole.error;
    console.log = mockConsole.log;

    // Mock window object
    Object.defineProperty(window, 'navigator', {
      value: { userAgent: 'test-agent' },
      writable: true,
    });

    Object.defineProperty(window, 'location', {
      value: { href: 'https://test.com/page' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(process, 'env', { value: { ...process.env, NODE_ENV: originalEnv } });
  });

  describe('AppErrorHandler', () => {
    describe('handleApiError', () => {
      it('should handle ContentError', () => {
        const contentError = new ContentError('Test error', 'TEST_CODE', { extra: 'data' });
        const result = AppErrorHandler.handleApiError(contentError);

        expect(result).toMatchObject({
          code: 'TEST_CODE',
          message: 'Test error',
          details: { extra: 'data' },
          timestamp: expect.any(String),
        });
      });

      it('should handle generic Error', () => {
        const error = new Error('Generic error');
        error.stack = 'Error stack trace';
        const result = AppErrorHandler.handleApiError(error);

        expect(result).toMatchObject({
          code: 'APPLICATION_ERROR',
          message: 'Generic error',
          details: 'Error stack trace',
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
    });

    describe('logError', () => {
      it('should log error with context', () => {
        const error: AppError = {
          code: 'TEST_ERROR',
          message: 'Test message',
          timestamp: '2023-01-01T00:00:00Z',
        };

        AppErrorHandler.logError(error, 'Test context');

        expect(mockConsole.error).toHaveBeenCalledWith(
          'Application Error:',
          expect.objectContaining({
            ...error,
            context: 'Test context',
            userAgent: 'test-agent',
            url: 'https://test.com/page',
          })
        );
      });

      it('should send to error service in production', () => {
        Object.defineProperty(process, 'env', {
          value: { ...process.env, NODE_ENV: 'production' },
        });
        const sendToErrorServiceSpy = vi.spyOn(
          AppErrorHandler as unknown as { sendToErrorService: () => void },
          'sendToErrorService'
        );

        const error: AppError = {
          code: 'TEST_ERROR',
          message: 'Test message',
          timestamp: '2023-01-01T00:00:00Z',
        };

        AppErrorHandler.logError(error);

        expect(sendToErrorServiceSpy).toHaveBeenCalled();
      });
    });

    describe('error creation methods', () => {
      it('should create network error', () => {
        const error = AppErrorHandler.createNetworkError(404, 'Custom message');

        expect(error).toBeInstanceOf(ContentError);
        expect(error.message).toBe('Custom message');
        expect(error.code).toBe('NETWORK_ERROR_404');
        expect(error.details).toEqual({ status: 404 });
      });

      it('should create network error with default message', () => {
        const error = AppErrorHandler.createNetworkError(500);

        expect(error.message).toBe('Internal server error - please try again later');
        expect(error.code).toBe('NETWORK_ERROR_500');
      });

      it('should create validation error', () => {
        const error = AppErrorHandler.createValidationError('email', 'Invalid format');

        expect(error.message).toBe('Validation failed for email: Invalid format');
        expect(error.code).toBe('VALIDATION_ERROR');
        expect(error.details).toEqual({ field: 'email', message: 'Invalid format' });
      });

      it('should create file error', () => {
        const error = AppErrorHandler.createFileError('upload', 'test.jpg');

        expect(error.message).toBe('File operation failed: upload for test.jpg');
        expect(error.code).toBe('FILE_ERROR');
        expect(error.details).toEqual({ operation: 'upload', filename: 'test.jpg' });
      });

      it('should create auth error', () => {
        const error = AppErrorHandler.createAuthError('Token expired');

        expect(error.message).toBe('Token expired');
        expect(error.code).toBe('AUTH_ERROR');
      });

      it('should create auth error with default message', () => {
        const error = AppErrorHandler.createAuthError();

        expect(error.message).toBe('Authentication failed');
        expect(error.code).toBe('AUTH_ERROR');
      });
    });
  });

  describe('ErrorBoundaryHelper', () => {
    it('should log component error', () => {
      const error = new Error('Component failed');
      const errorInfo = { componentStack: 'ComponentStack trace' };
      const logErrorSpy = vi.spyOn(AppErrorHandler, 'logError');

      ErrorBoundaryHelper.logComponentError(error, errorInfo, 'TestComponent');

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'COMPONENT_ERROR',
          message: 'Component failed',
          details: expect.objectContaining({
            componentStack: 'ComponentStack trace',
            componentName: 'TestComponent',
          }),
        }),
        'React Error Boundary'
      );
    });

    it('should get error fallback element', () => {
      const error = new Error('Test error');
      const fallback = ErrorBoundaryHelper.getErrorFallback(error, 'TestComponent');

      expect(fallback.type).toBe('div');
      expect((fallback.props as { className: string; children: React.ReactNode[] }).className).toBe(
        'error-boundary'
      );
      expect(
        (fallback.props as { className: string; children: React.ReactNode[] }).children
      ).toHaveLength(3);
    });
  });

  describe('withErrorHandling', () => {
    it('should return result on successful operation', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await withErrorHandling(operation, 'test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalled();
    });

    it('should handle error and return undefined', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const logErrorSpy = vi.spyOn(AppErrorHandler, 'logError');

      const result = await withErrorHandling(operation, 'test operation');

      expect(result).toBeUndefined();
      expect(logErrorSpy).toHaveBeenCalled();
    });

    it('should return fallback value on error', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Test error'));
      const result = await withErrorHandling(operation, 'test operation', 'fallback');

      expect(result).toBe('fallback');
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first try', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const result = await retryOperation(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValue('success');

      const result = await retryOperation(operation, 3, 10, false);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(retryOperation(operation, 2, 10, false)).rejects.toThrow('Always fails');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockResolvedValue('success');

      vi.useFakeTimers();
      const promise = retryOperation(operation, 2, 10, true);

      // Fast-forward through the backoff delay
      await vi.advanceTimersByTimeAsync(10);
      const result = await promise;

      expect(result).toBe('success');
      vi.useRealTimers();
    });
  });

  describe('FormErrorHandler', () => {
    describe('parseAPIErrors', () => {
      it('should parse array of error objects', () => {
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

      it('should parse object with field keys', () => {
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

      it('should handle general error message', () => {
        const response = {
          message: 'General error occurred',
        };

        const result = FormErrorHandler.parseAPIErrors(response);

        expect(result).toEqual({
          general: ['General error occurred'],
        });
      });
    });

    describe('utility methods', () => {
      const testErrors: FormErrorState = {
        email: ['Invalid email', 'Already exists'],
        password: ['Too short'],
      };

      it('should get first error', () => {
        expect(FormErrorHandler.getFirstError(testErrors, 'email')).toBe('Invalid email');
        expect(FormErrorHandler.getFirstError(testErrors, 'nonexistent')).toBeUndefined();
      });

      it('should check if has errors', () => {
        expect(FormErrorHandler.hasErrors(testErrors)).toBe(true);
        expect(FormErrorHandler.hasErrors({})).toBe(false);
      });

      it('should clear field error', () => {
        const result = FormErrorHandler.clearFieldError(testErrors, 'email');

        expect(result).toEqual({
          password: ['Too short'],
        });
        expect(testErrors).toEqual({
          // Original should be unchanged
          email: ['Invalid email', 'Already exists'],
          password: ['Too short'],
        });
      });

      it('should set field error', () => {
        const result = FormErrorHandler.setFieldError(testErrors, 'username', 'Required field');

        expect(result).toEqual({
          ...testErrors,
          username: ['Required field'],
        });
      });
    });
  });

  describe('setupGlobalErrorHandlers', () => {
    it('should set up global error listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      setupGlobalErrorHandlers();

      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });

    it('should handle global errors', () => {
      const logErrorSpy = vi.spyOn(AppErrorHandler, 'logError');
      setupGlobalErrorHandlers();

      const errorEvent = new ErrorEvent('error', {
        message: 'Global error',
        filename: 'test.js',
        lineno: 10,
        colno: 5,
        error: new Error('Test error'),
      });

      window.dispatchEvent(errorEvent);

      expect(logErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'GLOBAL_ERROR',
          message: 'Global error',
          details: expect.objectContaining({
            filename: 'test.js',
            lineno: 10,
            colno: 5,
          }),
        }),
        'Global Error Handler'
      );
    });
  });

  describe('handleFetchError', () => {
    it('should handle response with JSON error', async () => {
      const mockResponse = {
        status: 400,
        json: vi.fn().mockResolvedValue({ message: 'Bad request' }),
      } as unknown as Response;

      await expect(handleFetchError(mockResponse)).rejects.toThrow();
    });

    it('should handle response with invalid JSON', async () => {
      const mockResponse = {
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as unknown as Response;

      await expect(handleFetchError(mockResponse)).rejects.toThrow();
    });
  });

  describe('safeJSONParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJSONParse('{"test": "value"}', {});
      expect(result).toEqual({ test: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const logErrorSpy = vi.spyOn(AppErrorHandler, 'logError');
      const fallback = { default: true };
      const result = safeJSONParse('invalid json', fallback);

      expect(result).toBe(fallback);
      expect(logErrorSpy).toHaveBeenCalled();
    });
  });
});
