export interface ErrorEvent {
  id: string;
  timestamp: number;
  type: 'javascript' | 'network' | 'performance' | 'user' | 'api' | 'console';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
  context?: {
    page: string;
    component?: string;
    action?: string;
    props?: Record<string, any>;
  };
  breadcrumbs?: Breadcrumb[];
  fingerprint?: string;
  count?: number;
}

export interface Breadcrumb {
  timestamp: number;
  type: 'navigation' | 'click' | 'api' | 'console' | 'error';
  message: string;
  data?: Record<string, any>;
}

export interface ErrorTrackerConfig {
  enabled: boolean;
  apiEndpoint?: string;
  maxBreadcrumbs: number;
  maxErrors: number;
  sampleRate: number;
  enableConsoleCapture: boolean;
  enableNetworkCapture: boolean;
  enablePerformanceCapture: boolean;
  ignoreErrors: (string | RegExp)[];
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null;
  onError?: (event: ErrorEvent) => void;
}

class ErrorTracker {
  private config: ErrorTrackerConfig;
  private breadcrumbs: Breadcrumb[] = [];
  private errors: ErrorEvent[] = [];
  private sessionId: string;
  private originalConsoleError: (...args: any[]) => void;
  private originalConsoleWarn: (...args: any[]) => void;
  private isInitialized = false;

  constructor(config: Partial<ErrorTrackerConfig> = {}) {
    this.config = {
      enabled: true,
      maxBreadcrumbs: 50,
      maxErrors: 100,
      sampleRate: 1.0,
      enableConsoleCapture: true,
      enableNetworkCapture: true,
      enablePerformanceCapture: true,
      ignoreErrors: [
        /Script error/i,
        /Non-Error promise rejection captured/i,
        /ResizeObserver loop limit exceeded/i,
        /cancelled/i
      ],
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.originalConsoleError = console.error.bind(console);
    this.originalConsoleWarn = console.warn.bind(console);
  }

  public init(): void {
    if (!this.config.enabled || this.isInitialized) return;

    this.setupGlobalErrorHandlers();
    if (this.config.enableConsoleCapture) this.setupConsoleCapture();
    if (this.config.enableNetworkCapture) this.setupNetworkCapture();
    if (this.config.enablePerformanceCapture) this.setupPerformanceCapture();

    this.isInitialized = true;
    this.addBreadcrumb('system', 'Error tracker initialized');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateFingerprint(error: Partial<ErrorEvent>): string {
    const key = `${error.type}_${error.message}_${error.url || 'unknown'}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substr(0, 16);
  }

  private shouldIgnoreError(message: string): boolean {
    return this.config.ignoreErrors.some(pattern => {
      if (typeof pattern === 'string') {
        return message.includes(pattern);
      }
      return pattern.test(message);
    });
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        severity: 'high',
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        context: {
          page: window.location.pathname,
          line: event.lineno,
          column: event.colno
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'javascript',
        severity: 'high',
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        context: {
          page: window.location.pathname,
          reason: event.reason
        }
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const element = event.target as HTMLElement;
        this.captureError({
          type: 'network',
          severity: 'medium',
          message: `Failed to load resource: ${element.tagName}`,
          url: (element as any).src || (element as any).href,
          context: {
            page: window.location.pathname,
            element: element.tagName,
            src: (element as any).src || (element as any).href
          }
        });
      }
    }, true);
  }

  private setupConsoleCapture(): void {
    // Capture console errors
    console.error = (...args: any[]) => {
      this.originalConsoleError(...args);
      this.captureError({
        type: 'console',
        severity: 'medium',
        message: args.map(arg => String(arg)).join(' '),
        context: {
          page: window.location.pathname,
          args: args
        }
      });
    };

    // Capture console warnings
    console.warn = (...args: any[]) => {
      this.originalConsoleWarn(...args);
      this.addBreadcrumb('console', args.map(arg => String(arg)).join(' '), { level: 'warning' });
    };
  }

  private setupNetworkCapture(): void {
    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource.url;
      const method = config?.method || 'GET';

      try {
        const startTime = performance.now();
        const response = await originalFetch(...args);
        const endTime = performance.now();

        this.addBreadcrumb('api', `${method} ${url}`, {
          status: response.status,
          duration: Math.round(endTime - startTime)
        });

        if (!response.ok) {
          this.captureError({
            type: 'api',
            severity: response.status >= 500 ? 'high' : 'medium',
            message: `API request failed: ${method} ${url}`,
            context: {
              page: window.location.pathname,
              method,
              url,
              status: response.status,
              statusText: response.statusText
            }
          });
        }

        return response;
      } catch (error) {
        this.captureError({
          type: 'network',
          severity: 'high',
          message: `Network request failed: ${method} ${url}`,
          stack: error instanceof Error ? error.stack : undefined,
          context: {
            page: window.location.pathname,
            method,
            url,
            error: error instanceof Error ? error.message : String(error)
          }
        });
        throw error;
      }
    };

    // Intercept XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      (this as any).__method = method;
      (this as any).__url = url;
      (this as any).__startTime = performance.now();
      return originalXHROpen.call(this, method, url, ...args);
    };

    XMLHttpRequest.prototype.send = function(...args: any[]) {
      this.addEventListener('loadend', () => {
        const method = (this as any).__method;
        const url = (this as any).__url;
        const duration = performance.now() - (this as any).__startTime;

        if (this.status >= 400) {
          errorTracker.captureError({
            type: 'api',
            severity: this.status >= 500 ? 'high' : 'medium',
            message: `XHR request failed: ${method} ${url}`,
            context: {
              page: window.location.pathname,
              method,
              url,
              status: this.status,
              statusText: this.statusText,
              duration: Math.round(duration)
            }
          });
        } else {
          errorTracker.addBreadcrumb('api', `${method} ${url}`, {
            status: this.status,
            duration: Math.round(duration)
          });
        }
      });

      return originalXHRSend.call(this, ...args);
    };
  }

  private setupPerformanceCapture(): void {
    // Monitor performance metrics
    if ('PerformanceObserver' in window) {
      // Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const metric = entry as any;
          
          if (metric.name === 'LCP' && metric.value > 2500) {
            this.captureError({
              type: 'performance',
              severity: 'medium',
              message: `Poor LCP: ${Math.round(metric.value)}ms`,
              context: {
                page: window.location.pathname,
                metric: 'LCP',
                value: metric.value,
                threshold: 2500
              }
            });
          }
          
          if (metric.name === 'FID' && metric.value > 100) {
            this.captureError({
              type: 'performance',
              severity: 'medium',
              message: `Poor FID: ${Math.round(metric.value)}ms`,
              context: {
                page: window.location.pathname,
                metric: 'FID',
                value: metric.value,
                threshold: 100
              }
            });
          }
          
          if (metric.name === 'CLS' && metric.value > 0.1) {
            this.captureError({
              type: 'performance',
              severity: 'medium',
              message: `Poor CLS: ${metric.value.toFixed(3)}`,
              context: {
                page: window.location.pathname,
                metric: 'CLS',
                value: metric.value,
                threshold: 0.1
              }
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Browser may not support all entry types
      }
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.addBreadcrumb('performance', `Long task detected: ${Math.round(entry.duration)}ms`, {
            duration: entry.duration,
            startTime: entry.startTime
          });

          if (entry.duration > 100) {
            this.captureError({
              type: 'performance',
              severity: 'low',
              message: `Long task detected: ${Math.round(entry.duration)}ms`,
              context: {
                page: window.location.pathname,
                duration: entry.duration,
                startTime: entry.startTime
              }
            });
          }
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Browser may not support longtask
      }
    }
  }

  public addBreadcrumb(type: Breadcrumb['type'], message: string, data?: Record<string, any>): void {
    if (!this.config.enabled) return;

    const breadcrumb: Breadcrumb = {
      timestamp: Date.now(),
      type,
      message,
      data
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.config.maxBreadcrumbs);
    }
  }

  public captureError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'sessionId' | 'breadcrumbs' | 'fingerprint'>): void {
    if (!this.config.enabled || !this.shouldSample()) return;

    if (this.shouldIgnoreError(error.message)) return;

    const errorEvent: ErrorEvent = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      breadcrumbs: [...this.breadcrumbs],
      fingerprint: this.generateFingerprint(error),
      ...error
    };

    // Check for duplicate errors
    const existingError = this.errors.find(e => e.fingerprint === errorEvent.fingerprint);
    if (existingError) {
      existingError.count = (existingError.count || 1) + 1;
      existingError.timestamp = errorEvent.timestamp;
      return;
    }

    errorEvent.count = 1;

    // Process error through beforeSend hook
    const processedError = this.config.beforeSend ? this.config.beforeSend(errorEvent) : errorEvent;
    if (!processedError) return;

    this.errors.push(processedError);

    // Keep only the most recent errors
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors);
    }

    // Call error callback
    if (this.config.onError) {
      this.config.onError(processedError);
    }

    // Send to API if configured
    if (this.config.apiEndpoint) {
      this.sendToAPI(processedError);
    }

    // Add breadcrumb for this error
    this.addBreadcrumb('error', `${error.type}: ${error.message}`, {
      severity: error.severity,
      fingerprint: errorEvent.fingerprint
    });
  }

  private async sendToAPI(error: ErrorEvent): Promise<void> {
    if (!this.config.apiEndpoint) return;

    try {
      await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error)
      });
    } catch (e) {
      // Silently fail to avoid infinite loops
      console.warn('Failed to send error to API:', e);
    }
  }

  public captureException(error: Error, context?: ErrorEvent['context']): void {
    this.captureError({
      type: 'javascript',
      severity: 'high',
      message: error.message,
      stack: error.stack,
      context: {
        page: window.location.pathname,
        ...context
      }
    });
  }

  public captureMessage(message: string, severity: ErrorEvent['severity'] = 'low', context?: ErrorEvent['context']): void {
    this.captureError({
      type: 'user',
      severity,
      message,
      context: {
        page: window.location.pathname,
        ...context
      }
    });
  }

  public getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  public getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  public getSessionId(): string {
    return this.sessionId;
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  public setUser(userId: string): void {
    this.addBreadcrumb('system', `User set: ${userId}`);
  }

  public setContext(context: Record<string, any>): void {
    this.addBreadcrumb('system', 'Context updated', context);
  }

  public destroy(): void {
    if (!this.isInitialized) return;

    // Restore original console methods
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;

    this.clearErrors();
    this.clearBreadcrumbs();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const errorTracker = new ErrorTracker();

// React error boundary helper
export function createErrorBoundary(Component: React.ComponentType<any>) {
  return class extends React.Component<any, { hasError: boolean }> {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorTracker.captureError({
        type: 'javascript',
        severity: 'high',
        message: error.message,
        stack: error.stack,
        context: {
          page: window.location.pathname,
          component: Component.name,
          errorInfo: errorInfo.componentStack
        }
      });
    }

    render() {
      if (this.state.hasError) {
        return React.createElement('div', {
          className: 'error-boundary',
          children: 'Something went wrong. Please refresh the page.'
        });
      }

      return React.createElement(Component, this.props);
    }
  };
}

// Performance monitoring utilities
export const performance = {
  mark: (name: string) => {
    if ('performance' in window && 'mark' in window.performance) {
      window.performance.mark(name);
    }
  },

  measure: (name: string, startMark: string, endMark?: string) => {
    if ('performance' in window && 'measure' in window.performance) {
      try {
        window.performance.measure(name, startMark, endMark);
        const entries = window.performance.getEntriesByName(name);
        const entry = entries[entries.length - 1];
        
        if (entry && entry.duration > 1000) {
          errorTracker.captureError({
            type: 'performance',
            severity: 'medium',
            message: `Slow operation: ${name} took ${Math.round(entry.duration)}ms`,
            context: {
              page: window.location.pathname,
              operation: name,
              duration: entry.duration
            }
          });
        }
      } catch (e) {
        // Ignore measurement errors
      }
    }
  },

  measureFunction: <T extends (...args: any[]) => any>(fn: T, name?: string): T => {
    return ((...args: any[]) => {
      const functionName = name || fn.name || 'anonymous';
      const markStart = `${functionName}-start`;
      const markEnd = `${functionName}-end`;
      
      performance.mark(markStart);
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.finally(() => {
            performance.mark(markEnd);
            performance.measure(functionName, markStart, markEnd);
          });
        } else {
          performance.mark(markEnd);
          performance.measure(functionName, markStart, markEnd);
          return result;
        }
      } catch (error) {
        performance.mark(markEnd);
        performance.measure(functionName, markStart, markEnd);
        throw error;
      }
    }) as T;
  }
};