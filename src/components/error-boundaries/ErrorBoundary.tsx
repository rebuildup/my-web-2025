/**
 * Error Boundary Components
 * For handling errors in each major section
 */

"use client";

import React, { Component, ReactNode } from "react";
import {
  errorHandler,
  errorBoundaryUtils,
  recoveryOptions,
  type AppError,
} from "@/lib/utils/error-handling";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
  onError?: (error: AppError) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: Record<string, unknown>;
  appError?: AppError;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = errorBoundaryUtils.createErrorBoundaryState();
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = errorHandler.handleApiError(error);
    errorHandler.logError(appError);

    this.setState({
      errorInfo: errorInfo as Record<string, unknown>,
      appError,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(appError);
    }
  }

  handleRetry = () => {
    this.setState(errorBoundaryUtils.resetErrorBoundaryState());
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      const { appError } = this.state;
      const recoveryActions = appError
        ? recoveryOptions.getRecoveryActions(appError)
        : [];

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {appError
                  ? errorHandler.createUserFriendlyMessage(appError)
                  : "An unexpected error occurred in this section."}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>

              {recoveryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different sections
export const AboutErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    section="about"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            About Section Unavailable
          </h2>
          <p className="text-gray-600 mb-4">
            The about section is temporarily unavailable. Please try again
            later.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const PortfolioErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    section="portfolio"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Portfolio Unavailable</h2>
          <p className="text-gray-600 mb-4">
            The portfolio section is temporarily unavailable. Please try again
            later.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const WorkshopErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    section="workshop"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Workshop Unavailable</h2>
          <p className="text-gray-600 mb-4">
            The workshop section is temporarily unavailable. Please try again
            later.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const ToolsErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    section="tools"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tools Unavailable</h2>
          <p className="text-gray-600 mb-4">
            The tools section is temporarily unavailable. Please try again
            later.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

export const AdminErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => (
  <ErrorBoundary
    section="admin"
    fallback={
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Admin Panel Error</h2>
          <p className="text-gray-600 mb-4">
            The admin panel encountered an error. Please check the console for
            details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reload Admin Panel
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
