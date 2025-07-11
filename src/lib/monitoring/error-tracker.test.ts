import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { errorTracker, createErrorBoundary } from './error-tracker';
import React from 'react';

global.fetch = vi.fn();

describe('ErrorTracker', () => {
  let tracker: typeof errorTracker;

  beforeEach(() => {
    vi.clearAllMocks();
    tracker = errorTracker;
    tracker.clearErrors();
    tracker.clearBreadcrumbs();
  });

  afterEach(() => {
    vi.clearAllMocks();
    tracker.clearErrors();
    tracker.clearBreadcrumbs();
  });

  it('should add a breadcrumb', () => {
    tracker.addBreadcrumb('navigation', 'User navigated', { url: '/test' });
    const breadcrumbs = tracker.getBreadcrumbs();
    expect(breadcrumbs.length).toBeGreaterThan(0);
    expect(breadcrumbs[0].type).toBe('navigation');
  });

  it('should capture an error', () => {
    tracker.captureError({
      type: 'javascript',
      severity: 'high',
      message: 'Test error',
      context: { page: '/test' },
    });
    const errors = tracker.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toBe('Test error');
  });

  it('should capture a message', () => {
    tracker.captureMessage('Test message', 'low', { page: '/test' });
    const errors = tracker.getErrors();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].type).toBe('user');
    expect(errors[0].message).toBe('Test message');
  });

  it('should respect ignoreErrors config', () => {
    tracker['config'].ignoreErrors = ['Ignore this error'];
    tracker.captureError({
      type: 'javascript',
      severity: 'high',
      message: 'Ignore this error',
      context: { page: '/test' },
    });
    const errors = tracker.getErrors();
    expect(errors.length).toBe(0);
  });

  it('should use beforeSend hook', () => {
    tracker['config'].beforeSend = vi.fn(event => {
      event.message = 'Modified message';
      return event;
    });
    tracker.captureError({
      type: 'javascript',
      severity: 'high',
      message: 'Original message',
      context: { page: '/test' },
    });
    const errors = tracker.getErrors();
    expect(errors[0].message).toBe('Modified message');
  });

  it('should call onError hook', () => {
    const onError = vi.fn();
    tracker['config'].onError = onError;
    tracker.captureError({
      type: 'javascript',
      severity: 'high',
      message: 'Test error',
      context: { page: '/test' },
    });
    expect(onError).toHaveBeenCalled();
  });

  it('should send error to API if apiEndpoint is set', async () => {
    tracker['config'].apiEndpoint = 'https://api.example.com/errors';
    tracker.captureError({
      type: 'javascript',
      severity: 'high',
      message: 'API error',
      context: { page: '/test' },
    });
    expect(global.fetch).toHaveBeenCalled();
  });
});

describe('createErrorBoundary', () => {
  it('should create error boundary component', () => {
    const Dummy = () => React.createElement('div', null, 'dummy');
    const ErrorBoundary = createErrorBoundary(Dummy);
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe('function');
  });
});
