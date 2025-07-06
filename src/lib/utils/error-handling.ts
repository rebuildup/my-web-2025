// Error handling utilities
import { AppError, ContentError } from '@/types/content';

export class AppErrorHandler {
  static handleApiError(error: unknown): AppError {
    if (error instanceof ContentError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      };
    }

    if (error instanceof Error) {
      return {
        code: 'APPLICATION_ERROR',
        message: error.message,
        details: error.stack,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      details: String(error),
      timestamp: new Date().toISOString(),
    };
  }

  static logError(error: AppError, context?: string): void {
    const logMessage = {
      ...error,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    };

    console.error('Application Error:', logMessage);

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      // Example: Send to Sentry, LogRocket, etc.
      this.sendToErrorService(logMessage);
    }
  }

  private static sendToErrorService(error: AppError): void {
    // Placeholder for error service integration
    // Example: Sentry.captureException(error);
    console.log('Would send to error service:', error);
  }

  static createNetworkError(status: number, message?: string): ContentError {
    const errorMessage = message || this.getNetworkErrorMessage(status);
    return new ContentError(errorMessage, `NETWORK_ERROR_${status}`, { status });
  }

  static createValidationError(field: string, message: string): ContentError {
    return new ContentError(`Validation failed for ${field}: ${message}`, 'VALIDATION_ERROR', {
      field,
      message,
    });
  }

  static createFileError(operation: string, filename?: string): ContentError {
    return new ContentError(
      `File operation failed: ${operation}${filename ? ` for ${filename}` : ''}`,
      'FILE_ERROR',
      { operation, filename }
    );
  }

  static createAuthError(message: string = 'Authentication failed'): ContentError {
    return new ContentError(message, 'AUTH_ERROR');
  }

  private static getNetworkErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad request - please check your input';
      case 401:
        return 'Unauthorized - please log in';
      case 403:
        return 'Forbidden - you do not have permission';
      case 404:
        return 'Not found - the requested resource could not be found';
      case 429:
        return 'Too many requests - please try again later';
      case 500:
        return 'Internal server error - please try again later';
      case 502:
        return 'Bad gateway - server is temporarily unavailable';
      case 503:
        return 'Service unavailable - please try again later';
      case 504:
        return 'Gateway timeout - request took too long';
      default:
        return `Network error (${status}) - please try again`;
    }
  }
}

// React error boundary helper
export class ErrorBoundaryHelper {
  static logComponentError(
    error: Error,
    errorInfo: { componentStack: string },
    componentName?: string
  ): void {
    const appError: AppError = {
      code: 'COMPONENT_ERROR',
      message: error.message,
      details: {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        componentName,
      },
      timestamp: new Date().toISOString(),
    };

    AppErrorHandler.logError(appError, 'React Error Boundary');
  }

  static getErrorFallback(error: Error, componentName?: string): React.ReactElement {
    return {
      type: 'div',
      props: {
        className: 'error-boundary',
        children: [
          {
            type: 'h2',
            props: {
              children: 'Something went wrong',
              className: 'error-title',
            },
          },
          {
            type: 'p',
            props: {
              children: componentName
                ? `Error in ${componentName} component`
                : 'An error occurred while rendering this component',
              className: 'error-message',
            },
          },
          {
            type: 'button',
            props: {
              onClick: () => window.location.reload(),
              children: 'Reload Page',
              className: 'error-reload-button',
            },
          },
        ],
      },
    } as React.ReactElement;
  }
}

// Async operation error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string,
  fallbackValue?: T
): Promise<T | undefined> => {
  try {
    return await operation();
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, context);

    if (fallbackValue !== undefined) {
      return fallbackValue;
    }

    return undefined;
  }
};

// Retry mechanism
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: boolean = true
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Form error handling
export interface FormErrorState {
  [field: string]: string[];
}

export class FormErrorHandler {
  static parseAPIErrors(response: Record<string, unknown>): FormErrorState {
    const errors: FormErrorState = {};

    if (response.errors) {
      if (Array.isArray(response.errors)) {
        // Handle array of error objects
        response.errors.forEach((error: { field: string; message: string }) => {
          if (error.field && error.message) {
            if (!errors[error.field]) {
              errors[error.field] = [];
            }
            errors[error.field].push(error.message);
          }
        });
      } else if (typeof response.errors === 'object') {
        // Handle object with field keys
        Object.entries(response.errors).forEach(([field, messages]) => {
          errors[field] = Array.isArray(messages) ? messages : [messages as string];
        });
      }
    } else if (typeof response.message === 'string') {
      // Handle general error message
      errors.general = [response.message];
    }

    return errors;
  }

  static getFirstError(errors: FormErrorState, field: string): string | undefined {
    return errors[field]?.[0];
  }

  static hasErrors(errors: FormErrorState): boolean {
    return Object.keys(errors).length > 0;
  }

  static clearFieldError(errors: FormErrorState, field: string): FormErrorState {
    const newErrors = { ...errors };
    delete newErrors[field];
    return newErrors;
  }

  static setFieldError(errors: FormErrorState, field: string, message: string): FormErrorState {
    return {
      ...errors,
      [field]: [message],
    };
  }
}

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandlers = (): void => {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', event => {
    const appError: AppError = {
      code: 'GLOBAL_ERROR',
      message: event.message,
      details: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      },
      timestamp: new Date().toISOString(),
    };

    AppErrorHandler.logError(appError, 'Global Error Handler');
  });

  window.addEventListener('unhandledrejection', event => {
    const appError: AppError = {
      code: 'UNHANDLED_PROMISE_REJECTION',
      message: String(event.reason),
      details: {
        reason: event.reason,
        stack: event.reason?.stack,
      },
      timestamp: new Date().toISOString(),
    };

    AppErrorHandler.logError(appError, 'Unhandled Promise Rejection');
  });
};

// HTTP client error handling
export const handleFetchError = async (response: Response): Promise<never> => {
  let errorData: { message?: string; error?: string };

  try {
    errorData = await response.json();
  } catch {
    errorData = { message: 'Failed to parse error response' };
  }

  throw AppErrorHandler.createNetworkError(response.status, errorData.message || errorData.error);
};

// Safe JSON parsing
export const safeJSONParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    AppErrorHandler.logError(AppErrorHandler.handleApiError(error), 'JSON Parse Error');
    return fallback;
  }
};
