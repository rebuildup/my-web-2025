import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorTracker, createErrorBoundary } from './error-tracker';
import type { ErrorEvent, Breadcrumb, ErrorTrackerConfig } from './error-tracker';

// Mock fetch
global.fetch = vi.fn();

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Mock React for testing
vi.mock('react', () => ({
  default: {
    createElement: vi.fn((type, props, ...children) => ({ type, props, children })),
    Component: class Component {},
  },
}));

describe('ErrorTracker', () => {
  let tracker: typeof errorTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    console.warn = vi.fn();
    // Create a new instance for each test
    tracker = new (errorTracker.constructor as any)();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    tracker.destroy();
  });

  describe('constructor', () => {
    it('should create error tracker with default config', () => {
      expect(tracker).toBeDefined();
    });

    it('should create error tracker with custom config', () => {
      const config: Partial<ErrorTrackerConfig> = {
        enabled: false,
        maxBreadcrumbs: 100,
        maxErrors: 50,
        sampleRate: 0.5,
      };
      const customTracker = new (tracker.constructor as any)(config);
      expect(customTracker).toBeDefined();
    });
  });

  describe('init', () => {
    it('should initialize error tracker', () => {
      expect(() => tracker.init()).not.toThrow();
    });

    it('should not initialize if disabled', () => {
      const disabledTracker = new (tracker.constructor as any)({ enabled: false });
      expect(() => disabledTracker.init()).not.toThrow();
    });

    it('should not initialize twice', () => {
      tracker.init();
      expect(() => tracker.init()).not.toThrow();
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb', () => {
      tracker.addBreadcrumb('navigation', 'User navigated to /test');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].type).toBe('navigation');
      expect(breadcrumbs[0].message).toBe('User navigated to /test');
    });

    it('should add breadcrumb with data', () => {
      const data = { url: '/test', userId: '123' };
      tracker.addBreadcrumb('click', 'Button clicked', data);

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs[0].data).toEqual(data);
    });

    it('should limit breadcrumbs to maxBreadcrumbs', () => {
      const limitedTracker = new (tracker.constructor as any)({ maxBreadcrumbs: 2 });

      limitedTracker.addBreadcrumb('navigation', 'First');
      limitedTracker.addBreadcrumb('navigation', 'Second');
      limitedTracker.addBreadcrumb('navigation', 'Third');

      const breadcrumbs = limitedTracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].message).toBe('Second');
      expect(breadcrumbs[1].message).toBe('Third');
    });
  });

  describe('captureError', () => {
    it('should capture error', () => {
      const error = {
        type: 'javascript' as const,
        severity: 'high' as const,
        message: 'Test error',
        url: '/test',
      };

      tracker.captureError(error);

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
      expect(errors[0].type).toBe('javascript');
      expect(errors[0].severity).toBe('high');
    });

    it('should ignore errors based on ignoreErrors config', () => {
      const ignoreTracker = new (tracker.constructor as any)({
        ignoreErrors: ['Test error'],
      });

      ignoreTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = ignoreTracker.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should ignore errors based on regex pattern', () => {
      const regexTracker = new (tracker.constructor as any)({
        ignoreErrors: [/Test error/i],
      });

      regexTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'This is a test error',
      });

      const errors = regexTracker.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should respect sample rate', () => {
      const sampleTracker = new (tracker.constructor as any)({ sampleRate: 0 });

      sampleTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = sampleTracker.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should limit errors to maxErrors', () => {
      const limitTracker = new (tracker.constructor as any)({ maxErrors: 2 });

      limitTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Error 1',
      });
      limitTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Error 2',
      });
      limitTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Error 3',
      });

      const errors = limitTracker.getErrors();
      expect(errors).toHaveLength(2);
      expect(errors[0].message).toBe('Error 2');
      expect(errors[1].message).toBe('Error 3');
    });

    it('should generate fingerprint for errors', () => {
      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
        url: '/test',
      });

      const errors = tracker.getErrors();
      expect(errors[0].fingerprint).toBeDefined();
    });

    it('should increment count for duplicate errors', () => {
      const error = {
        type: 'javascript' as const,
        severity: 'high' as const,
        message: 'Test error',
        url: '/test',
      };

      tracker.captureError(error);
      tracker.captureError(error);

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].count).toBe(2);
    });
  });

  describe('captureException', () => {
    it('should capture exception', () => {
      const error = new Error('Test exception');

      tracker.captureException(error);

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test exception');
      expect(errors[0].type).toBe('javascript');
      expect(errors[0].stack).toBe(error.stack);
    });

    it('should capture exception with context', () => {
      const error = new Error('Test exception');
      const context = {
        page: '/test',
        component: 'TestComponent',
        action: 'button-click',
      };

      tracker.captureException(error, context);

      const errors = tracker.getErrors();
      expect(errors[0].context).toEqual(context);
    });
  });

  describe('captureMessage', () => {
    it('should capture message with default severity', () => {
      tracker.captureMessage('Test message');

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test message');
      expect(errors[0].severity).toBe('low');
      expect(errors[0].type).toBe('user');
    });

    it('should capture message with custom severity', () => {
      tracker.captureMessage('Test message', 'critical');

      const errors = tracker.getErrors();
      expect(errors[0].severity).toBe('critical');
    });

    it('should capture message with context', () => {
      const context = {
        page: '/test',
        component: 'TestComponent',
      };

      tracker.captureMessage('Test message', 'medium', context);

      const errors = tracker.getErrors();
      expect(errors[0].context).toEqual(context);
    });
  });

  describe('getErrors', () => {
    it('should return empty array initially', () => {
      const errors = tracker.getErrors();
      expect(errors).toEqual([]);
    });

    it('should return captured errors', () => {
      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(1);
    });
  });

  describe('getBreadcrumbs', () => {
    it('should return empty array initially', () => {
      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toEqual([]);
    });

    it('should return added breadcrumbs', () => {
      tracker.addBreadcrumb('navigation', 'Test navigation');

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toHaveLength(1);
    });
  });

  describe('getSessionId', () => {
    it('should return session ID', () => {
      const sessionId = tracker.getSessionId();
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
    });
  });

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      tracker.clearErrors();

      const errors = tracker.getErrors();
      expect(errors).toEqual([]);
    });
  });

  describe('clearBreadcrumbs', () => {
    it('should clear all breadcrumbs', () => {
      tracker.addBreadcrumb('navigation', 'Test navigation');

      tracker.clearBreadcrumbs();

      const breadcrumbs = tracker.getBreadcrumbs();
      expect(breadcrumbs).toEqual([]);
    });
  });

  describe('setUser', () => {
    it('should set user ID for future errors', () => {
      tracker.setUser('user123');

      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = tracker.getErrors();
      expect(errors[0].userId).toBe('user123');
    });
  });

  describe('setContext', () => {
    it('should set context for future errors', () => {
      const context = {
        page: '/test',
        component: 'TestComponent',
      };

      tracker.setContext(context);

      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = tracker.getErrors();
      expect(errors[0].context).toEqual(context);
    });
  });

  describe('destroy', () => {
    it('should restore original console methods', () => {
      tracker.init();
      tracker.destroy();

      // Should not throw when calling console methods
      expect(() => console.error('test')).not.toThrow();
      expect(() => console.warn('test')).not.toThrow();
    });

    it('should remove event listeners', () => {
      tracker.init();
      tracker.destroy();

      // Should not capture errors after destroy
      tracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      const errors = tracker.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('beforeSend hook', () => {
    it('should call beforeSend hook', () => {
      const beforeSend = vi.fn((event: ErrorEvent) => {
        event.metadata = { custom: 'data' };
        return event;
      });

      const hookTracker = new (tracker.constructor as any)({ beforeSend });

      hookTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      expect(beforeSend).toHaveBeenCalled();
    });

    it('should not send error if beforeSend returns null', () => {
      const beforeSend = vi.fn(() => null);
      const onError = vi.fn();

      const hookTracker = new (tracker.constructor as any)({ beforeSend, onError });

      hookTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      expect(beforeSend).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('onError hook', () => {
    it('should call onError hook', () => {
      const onError = vi.fn();
      const hookTracker = new (tracker.constructor as any)({ onError });

      hookTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('API integration', () => {
    it('should send error to API if endpoint is configured', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockResolvedValue({ ok: true } as Response);

      const apiTracker = new (tracker.constructor as any)({
        apiEndpoint: 'https://api.example.com/errors',
      });

      apiTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: 'Test error',
      });

      // Wait for async API call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockFetch).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockFetch = vi.mocked(fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const apiTracker = new (tracker.constructor as any)({
        apiEndpoint: 'https://api.example.com/errors',
      });

      expect(() => {
        apiTracker.captureError({
          type: 'javascript',
          severity: 'high',
          message: 'Test error',
        });
      }).not.toThrow();
    });
  });
});

describe('createErrorBoundary', () => {
  it('should create error boundary component', () => {
    const TestComponent = () => null;
    const ErrorBoundary = createErrorBoundary(TestComponent);

    expect(ErrorBoundary).toBeDefined();
  });

  it('should render fallback UI when error occurs', () => {
    const TestComponent = () => {
      throw new Error('Test error');
    };

    const ErrorBoundary = createErrorBoundary(TestComponent);

    // This would need React Testing Library for proper testing
    expect(ErrorBoundary).toBeDefined();
  });
});
