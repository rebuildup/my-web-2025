/**
 * Fallback Content Display Component
 * Displays fallback content when markdown files are unavailable
 */

"use client";

import { MarkdownError, MarkdownErrorType } from "@/lib/markdown/client";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";
import React from "react";

export interface FallbackContentProps {
  error?: MarkdownError | Error | null;
  fallbackContent?: string;
  contentId?: string;
  onRetry?: () => void;
  className?: string;
  showRetryButton?: boolean;
  showErrorDetails?: boolean;
}

export const FallbackContent: React.FC<FallbackContentProps> = ({
  error,
  fallbackContent,
  contentId,
  onRetry,
  className = "",
  showRetryButton = true,
  showErrorDetails = false,
}) => {
  const isMarkdownError = error instanceof MarkdownError;
  const errorType = isMarkdownError ? error.type : null;

  // Determine the appropriate fallback display based on error type
  const getFallbackDisplay = () => {
    if (fallbackContent && fallbackContent.trim()) {
      return (
        <div className={`fallback-content ${className}`}>
          <div className="fallback-header">
            <FileText className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">
              Displaying cached content
            </span>
          </div>
          <div className="fallback-body mt-3">
            <div className="prose prose-sm max-w-none">
              {fallbackContent.split("\n").map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </div>
          {showRetryButton && onRetry && (
            <div className="fallback-actions mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try loading markdown
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`fallback-content-empty ${className}`}>
        <div className="fallback-header">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-600">
            Content temporarily unavailable
          </span>
        </div>
        <div className="fallback-body mt-3">
          <p className="text-sm text-gray-500">{getErrorMessage()}</p>
          {showErrorDetails && (
            <details className="mt-2">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                Technical details
              </summary>
              <pre className="mt-1 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-x-auto">
                {contentId && `Content ID: ${contentId}\n`}
                {error
                  ? `Error: ${error.message}`
                  : "No error information available."}
              </pre>
            </details>
          )}
        </div>
        {showRetryButton && onRetry && (
          <div className="fallback-actions mt-4">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}
      </div>
    );
  };

  const getErrorMessage = (): string => {
    if (!error) {
      return "Content could not be loaded at this time.";
    }

    if (isMarkdownError) {
      switch (errorType) {
        case MarkdownErrorType.FILE_NOT_FOUND:
          return "The content file could not be found.";
        case MarkdownErrorType.PERMISSION_DENIED:
          return "Unable to access the content file.";
        case MarkdownErrorType.INVALID_CONTENT:
          return "The content file appears to be corrupted.";
        case MarkdownErrorType.EMBED_ERROR:
          return "There are issues with embedded content.";
        default:
          return "An error occurred while loading the content.";
      }
    }

    return "An unexpected error occurred.";
  };

  return (
    <div className="markdown-fallback border border-gray-200 rounded-lg p-4 bg-gray-50">
      {getFallbackDisplay()}
    </div>
  );
};

/**
 * Inline Fallback Component
 * Smaller fallback for inline content areas
 */
export const InlineFallback: React.FC<{
  fallbackText?: string;
  onRetry?: () => void;
}> = ({ fallbackText, onRetry }) => {
  return (
    <span className="inline-fallback inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded text-sm">
      <AlertTriangle className="w-3 h-3" />
      {fallbackText || "Content unavailable"}
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 text-yellow-600 hover:text-yellow-800"
          title="Retry loading content"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

/**
 * Error Boundary for Markdown Content
 * Catches and displays errors in markdown rendering
 */
interface MarkdownErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class MarkdownErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallbackContent?: string;
    contentId?: string;
  }>,
  MarkdownErrorBoundaryState
> {
  constructor(
    props: React.PropsWithChildren<{
      fallbackContent?: string;
      contentId?: string;
    }>,
  ) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): MarkdownErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Markdown rendering error:", error, errorInfo);
    // Remove onError callback to avoid Server Component issues
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <FallbackContent
          error={this.state.error}
          fallbackContent={this.props.fallbackContent}
          contentId={this.props.contentId}
          onRetry={this.handleRetry}
          showErrorDetails={process.env.NODE_ENV === "development"}
        />
      );
    }

    return this.props.children;
  }
}

export default FallbackContent;
