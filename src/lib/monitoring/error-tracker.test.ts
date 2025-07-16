import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { errorTracker, createErrorBoundary } from './error-tracker';
import React from 'react';

describe('ErrorTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    errorTracker.destroy();
    errorTracker.configure({
      enabled: true,
      apiEndpoint: undefined,
      ignoreErrors: [],
      beforeSend: event => event,
      onError: () => {},
      enableConsoleCapture: false,
    });
  });

  afterEach(() => {
    errorTracker.destroy();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should capture an error using captureException', () => {
    errorTracker.init();
    const error = new Error('Direct capture');
    errorTracker.captureException(error);
    const errors = errorTracker.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Direct capture');
  });

  it('should capture unhandled promise rejections', async () => {
    errorTracker.init();
    const reason = new Error('Promise rejected');
    const promise = Promise.reject(reason);
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise,
      reason,
    });

    window.dispatchEvent(rejectionEvent);
    await vi.runAllTimersAsync();

    const errors = errorTracker.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Promise rejected');

    // Prevent unhandled rejection error by catching it.
    promise.catch(() => {});
    await Promise.resolve(); // Flush microtask queue
  });

  it('should capture console.error calls when enabled', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    errorTracker.configure({ enableConsoleCapture: true });
    errorTracker.init();

    console.error('This is a console error');

    const errors = errorTracker.getErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('This is a console error');
    consoleSpy.mockRestore();
  });

  it('should not capture ignored errors', () => {
    errorTracker.configure({ ignoreErrors: [/ignore/] });
    errorTracker.init();

    const error = new Error('please ignore this');
    errorTracker.captureException(error);

    expect(errorTracker.getErrors()).toHaveLength(0);
  });
});

describe('createErrorBoundary', () => {
  const ThrowingComponent = () => {
    throw new Error('Test error');
  };
  const FallbackComponent = () => React.createElement('div', null, 'Fallback UI');
  const ErrorBoundary = createErrorBoundary(FallbackComponent);

  beforeEach(() => {
    // Silence React's error boundary console error
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as ReturnType<typeof vi.fn>).mockRestore();
  });

  it('should render children when there is no error', () => {
    render(React.createElement(ErrorBoundary, null, React.createElement('div', null, 'Child')));
    expect(screen.getByText('Child')).toBeInTheDocument();
    expect(screen.queryByText('Fallback UI')).not.toBeInTheDocument();
  });

  it('should render fallback UI on error', () => {
    render(React.createElement(ErrorBoundary, null, React.createElement(ThrowingComponent)));
    expect(screen.getByText('Fallback UI')).toBeInTheDocument();
  });
});
