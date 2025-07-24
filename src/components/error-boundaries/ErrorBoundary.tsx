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
        <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center p-ratio-lg">
          <div className="max-w-md w-full text-center">
            <div className="mb-ratio-lg">
              <div className="w-16 h-16 mx-auto mb-ratio-base border-2 border-primary flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
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
              <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
                エラーが発生しました
              </h2>
              <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-lg">
                {appError
                  ? errorHandler.createUserFriendlyMessage(appError)
                  : "このセクションで予期しないエラーが発生しました。"}
              </p>
            </div>

            <div className="space-y-ratio-sm">
              <button
                onClick={this.handleRetry}
                className="w-full px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
              >
                再試行
              </button>

              {recoveryActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full px-ratio-sm py-ratio-xs border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors noto-sans-jp-regular text-ratio-base"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-ratio-lg text-left">
                <summary className="cursor-pointer text-ratio-sm opacity-60 hover:opacity-80 noto-sans-jp-light">
                  エラー詳細 (開発環境)
                </summary>
                <pre className="mt-ratio-sm p-ratio-sm bg-base border border-foreground text-ratio-xs overflow-auto noto-sans-jp-light">
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
      <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
            Aboutセクションが利用できません
          </h2>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-base">
            Aboutセクションは一時的に利用できません。後でもう一度お試しください。
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
          >
            ホームに戻る
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
      <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
            Portfolioが利用できません
          </h2>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-base">
            Portfolioセクションは一時的に利用できません。後でもう一度お試しください。
          </p>
          <div className="space-y-ratio-sm">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
            >
              再読み込み
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="block w-full px-ratio-sm py-ratio-xs border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors noto-sans-jp-regular text-ratio-base"
            >
              ホームに戻る
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
      <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
            Workshopが利用できません
          </h2>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-base">
            Workshopセクションは一時的に利用できません。後でもう一度お試しください。
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
          >
            ホームに戻る
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
      <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
            Toolsが利用できません
          </h2>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-base">
            Toolsセクションは一時的に利用できません。後でもう一度お試しください。
          </p>
          <div className="space-y-ratio-sm">
            <button
              onClick={() => window.location.reload()}
              className="block w-full px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
            >
              再読み込み
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="block w-full px-ratio-sm py-ratio-xs border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors noto-sans-jp-regular text-ratio-base"
            >
              ホームに戻る
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
      <div className="min-h-[400px] bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h2 className="zen-kaku-gothic-new text-ratio-lg text-foreground mb-ratio-sm">
            管理パネルエラー
          </h2>
          <p className="noto-sans-jp-light text-ratio-base opacity-80 mb-ratio-base">
            管理パネルでエラーが発生しました。詳細はコンソールを確認してください。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-ratio-sm py-ratio-xs bg-primary text-background hover:bg-foreground transition-colors noto-sans-jp-regular text-ratio-base"
          >
            管理パネルを再読み込み
          </button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);
