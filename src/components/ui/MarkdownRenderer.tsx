/**
 * Markdown Renderer Component for Detail Pages
 * Fetches and displays markdown files with embedded media resolution
 * Based on markdown-content-system design specifications
 */

"use client";

import {
  embedValidator,
  MarkdownError,
  markdownErrorHandler,
  MarkdownErrorType,
} from "@/lib/markdown/client";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import React, { useCallback, useEffect, useState } from "react";
import { createContentParser } from "../../lib/markdown/content-parser";
import type { MediaData } from "../../types/content";
import { MarkdownErrorBoundary } from "../markdown/FallbackContent";

// Component props interface
interface MarkdownRendererProps {
  filePath: string;
  mediaData: MediaData;
  className?: string;
  fallbackContent?: string;
  enableSanitization?: boolean;
  customRenderer?: (content: string) => string;
  enableValidation?: boolean;
  enableIntegrityCheck?: boolean;
  showRetryButton?: boolean;
  contentId?: string;
  onError?: (error: MarkdownFileError) => void;
  showEmptyState?: boolean;
}

// Component state interface
interface MarkdownRendererState {
  content: string;
  isLoading: boolean;
  error: MarkdownError | Error | null;
  parsedContent: string;
  validationResult?: {
    isValid: boolean;
    errors: Array<{ message: string; line: number; column: number }>;
    warnings?: string[];
  };
  integrityCheck?: {
    isValid: boolean;
    checksum: string;
  };
}

// Error types for better error handling
export class MarkdownFileError extends Error {
  constructor(
    message: string,
    public readonly code: "FILE_NOT_FOUND" | "FETCH_ERROR" | "PARSE_ERROR",
    public readonly filePath: string,
  ) {
    super(message);
    this.name = "MarkdownFileError";
  }
}

// Configure marked options for security and performance
const configureMarked = () => {
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
};

// Initialize marked configuration
configureMarked();

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  filePath,
  mediaData,
  className = "",
  fallbackContent = "Content not available",
  enableSanitization = true,
  customRenderer,
  enableValidation = true,
  enableIntegrityCheck = false,
  showRetryButton = true,
  contentId,
  onError,
  showEmptyState = true,
}) => {
  const [state, setState] = useState<MarkdownRendererState>({
    content: "",
    isLoading: true,
    error: null,
    parsedContent: "",
    validationResult: undefined,
    integrityCheck: undefined,
  });

  const [contentParser] = useState(() => createContentParser());

  // Fetch markdown file content with enhanced error handling
  const fetchMarkdownContent = useCallback(
    async (path: string): Promise<string> => {
      try {
        // Ensure the path starts with / for absolute paths
        const normalizedPath = path.startsWith("/") ? path : `/${path}`;

        console.log(
          `[MarkdownRenderer] Fetching markdown file: ${normalizedPath}`,
        );

        const response = await fetch(normalizedPath, {
          cache: "no-store", // Disable caching for development
        });

        console.log(
          `[MarkdownRenderer] Response status: ${response.status}, ok: ${response.ok}`,
        );

        if (!response.ok) {
          if (response.status === 404) {
            console.error(
              `[MarkdownRenderer] File not found: ${normalizedPath}`,
            );
            throw new MarkdownError(
              MarkdownErrorType.FILE_NOT_FOUND,
              `Markdown file not found: ${normalizedPath}`,
              { filePath: normalizedPath, status: response.status },
              "Check if the file path is correct and the file exists",
            );
          }
          console.error(
            `[MarkdownRenderer] Fetch failed: ${response.status} ${response.statusText}`,
          );
          throw new MarkdownError(
            MarkdownErrorType.PERMISSION_DENIED,
            `Failed to fetch markdown file: ${response.statusText}`,
            { filePath: normalizedPath, status: response.status },
            "Check file permissions and server configuration",
          );
        }

        const content = await response.text();

        console.log(`[MarkdownRenderer] Content length: ${content.length}`);
        console.log(
          `[MarkdownRenderer] Content preview: ${content.substring(0, 100)}...`,
        );

        // Check if content is empty or just whitespace
        if (!content || content.trim().length === 0) {
          console.info(`Markdown file is empty: ${normalizedPath}`);
          return ""; // Return empty string for empty files
        }

        // Note: File integrity check is not available in client components
        // This feature requires server-side processing
        if (enableIntegrityCheck) {
          console.warn(
            "File integrity check is not available in client components",
          );
        }

        return content;
      } catch (error) {
        console.error(`[MarkdownRenderer] Error fetching ${path}:`, error);
        if (error instanceof MarkdownError) {
          throw error;
        }
        throw markdownErrorHandler.handleFileError(error, path);
      }
    },
    [enableIntegrityCheck],
  );

  // Process markdown content with embed resolution and validation
  const processMarkdownContent = useCallback(
    async (rawContent: string, media: MediaData): Promise<string> => {
      try {
        // Validate embed references if enabled
        if (enableValidation) {
          const validationResult = embedValidator.validateEmbeds(
            rawContent,
            media,
          );
          setState((prev) => ({
            ...prev,
            validationResult: {
              isValid: validationResult.isValid,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
            },
          }));

          // Log validation warnings
          if (
            validationResult.warnings &&
            validationResult.warnings.length > 0
          ) {
            console.warn(
              "Markdown validation warnings:",
              validationResult.warnings,
            );
          }

          // Throw error if validation fails
          if (!validationResult.isValid && validationResult.errors.length > 0) {
            const firstError = validationResult.errors[0];
            throw new MarkdownError(
              MarkdownErrorType.EMBED_ERROR,
              `Embed validation failed: ${firstError.message}`,
              {
                validationErrors: validationResult.errors,
                line: firstError.line,
                column: firstError.column,
              },
              firstError.suggestion,
            );
          }
        }

        // First, resolve embed references
        const contentWithResolvedEmbeds = await contentParser.parseMarkdown(
          rawContent,
          media,
        );

        // Then, parse markdown to HTML
        let htmlContent = customRenderer
          ? customRenderer(contentWithResolvedEmbeds)
          : await marked.parse(contentWithResolvedEmbeds);

        // Sanitize HTML if enabled
        if (enableSanitization) {
          htmlContent = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: [
              "h1",
              "h2",
              "h3",
              "h4",
              "h5",
              "h6",
              "p",
              "br",
              "strong",
              "em",
              "u",
              "s",
              "del",
              "ins",
              "ul",
              "ol",
              "li",
              "blockquote",
              "pre",
              "code",
              "a",
              "img",
              "table",
              "thead",
              "tbody",
              "tr",
              "th",
              "td",
              "div",
              "span",
              "iframe", // Allow iframes for video embeds
            ],
            ALLOWED_ATTR: [
              "href",
              "title",
              "alt",
              "src",
              "class",
              "id",
              "target",
              "rel",
              "width",
              "height",
              "frameborder",
              "allow",
              "allowfullscreen", // For iframes
              "loading", // For lazy loading
            ],
            ALLOWED_URI_REGEXP:
              /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
          });
        }

        return htmlContent;
      } catch (error) {
        if (error instanceof MarkdownError) {
          throw error;
        }
        throw new MarkdownError(
          MarkdownErrorType.INVALID_CONTENT,
          `Failed to process markdown content: ${error instanceof Error ? error.message : "Unknown error"}`,
          { filePath, originalError: error },
          "Check the markdown syntax and embedded content references",
        );
      }
    },
    [
      contentParser,
      customRenderer,
      enableSanitization,
      enableValidation,
      filePath,
    ],
  );

  // Load and process markdown content
  const loadContent = useCallback(async () => {
    console.log(
      `[MarkdownRenderer] loadContent called with filePath: ${filePath}`,
    );

    if (!filePath) {
      const error = new MarkdownFileError(
        "No file path provided",
        "FILE_NOT_FOUND",
        "",
      );
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
        parsedContent: "",
        content: "",
      }));

      // Call error callback if provided
      if (onError) {
        onError(error);
      }
      console.warn("Failed to load markdown content:", error);
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log(
        `[MarkdownRenderer] Starting to fetch content for: ${filePath}`,
      );
      const rawContent = await fetchMarkdownContent(filePath);

      // Handle empty content gracefully
      if (!rawContent || rawContent.trim().length === 0) {
        console.log(`[MarkdownRenderer] Content is empty, setting empty state`);
        setState({
          content: rawContent || "",
          isLoading: false,
          error: null,
          parsedContent: "", // Empty parsed content for empty files
        });
        return;
      }

      console.log(`[MarkdownRenderer] Processing markdown content...`);
      const processedContent = await processMarkdownContent(
        rawContent,
        mediaData,
      );

      console.log(
        `[MarkdownRenderer] Content processed successfully, setting state`,
      );
      console.log(
        `[MarkdownRenderer] Processed content preview: ${processedContent.substring(0, 200)}...`,
      );
      setState({
        content: rawContent,
        isLoading: false,
        error: null,
        parsedContent: processedContent,
      });
    } catch (error) {
      console.error(`[MarkdownRenderer] Error in loadContent:`, error);
      const markdownError =
        error instanceof MarkdownFileError
          ? error
          : error instanceof MarkdownError
            ? new MarkdownFileError(error.message, "PARSE_ERROR", filePath)
            : new MarkdownFileError(
                `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
                "PARSE_ERROR",
                filePath,
              );

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: markdownError,
        parsedContent: "",
        content: "",
      }));

      // Call error callback if provided
      if (onError) {
        onError(markdownError);
      }
      console.warn("Failed to load markdown content:", markdownError);
    }
  }, [
    filePath,
    mediaData,
    fetchMarkdownContent,
    processMarkdownContent,
    onError,
  ]);

  // Load content when filePath or mediaData changes
  useEffect(() => {
    // Ensure we always attempt to load content, even if there are issues
    loadContent().catch((error) => {
      console.warn(
        "[MarkdownRenderer] Failed to load content in useEffect:",
        error,
      );
      // Set a fallback state to ensure the component still renders
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof MarkdownFileError
            ? error
            : new MarkdownFileError(
                "Failed to load content",
                "FETCH_ERROR",
                filePath,
              ),
        parsedContent: "",
        content: "",
      }));
    });
  }, [loadContent, filePath]);

  // Render loading state
  if (state.isLoading) {
    return (
      <div className={`markdown-renderer-loading ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Loading content...
          </span>
        </div>
      </div>
    );
  }

  // Render error state with enhanced fallback - always show content, never block the page
  if (state.error) {
    console.warn(
      "[MarkdownRenderer] Rendering error state with fallback content",
    );

    return (
      <div className={`markdown-renderer-error ${className}`}>
        {/* Always show fallback content instead of blocking the page */}
        <div className="markdown-fallback-content">
          <div className="markdown-empty-state text-foreground/60 text-sm noto-sans-jp-light py-4">
            {fallbackContent || "コンテンツが利用できません。"}
          </div>

          {/* Show error details only in development */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <summary className="text-sm font-medium text-red-800 cursor-pointer">
                開発者向け: エラー詳細
              </summary>
              <div className="mt-2 text-xs text-red-700">
                <p>
                  <strong>エラー:</strong> {state.error.message}
                </p>
                <p>
                  <strong>ファイルパス:</strong> {filePath}
                </p>
                {state.error instanceof MarkdownFileError && (
                  <p>
                    <strong>エラーコード:</strong> {state.error.code}
                  </p>
                )}
              </div>
            </details>
          )}

          {/* Show retry button if enabled */}
          {showRetryButton && (
            <button
              onClick={loadContent}
              className="mt-3 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              再読み込み
            </button>
          )}
        </div>

        {/* Show validation errors if available (development only) */}
        {process.env.NODE_ENV === "development" &&
          state.validationResult &&
          !state.validationResult.isValid && (
            <details className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
                コンテンツ検証の問題
              </summary>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                {state.validationResult.errors.map((error, index) => (
                  <li key={index}>
                    行 {error.line}, 列 {error.column}: {error.message}
                  </li>
                ))}
              </ul>
            </details>
          )}

        {/* Show integrity check results if available (development only) */}
        {process.env.NODE_ENV === "development" &&
          state.integrityCheck &&
          !state.integrityCheck.isValid && (
            <details className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <summary className="text-sm font-medium text-orange-800 cursor-pointer">
                ファイル整合性の警告
              </summary>
              <p className="mt-2 text-sm text-orange-700">
                ファイルが変更または破損している可能性があります。チェックサム:{" "}
                {state.integrityCheck.checksum}
              </p>
            </details>
          )}
      </div>
    );
  }

  // Check if content is empty
  const isEmpty =
    !state.parsedContent || state.parsedContent.trim().length === 0;

  // Render markdown content with error boundary
  return (
    <MarkdownErrorBoundary
      fallbackContent={fallbackContent}
      contentId={contentId}
    >
      <div className={`markdown-renderer ${className}`}>
        {/* Show validation warnings if any */}
        {state.validationResult?.warnings &&
          state.validationResult.warnings.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Content Warnings:
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                {state.validationResult.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

        {/* Render content or empty state */}
        {isEmpty ? (
          showEmptyState ? (
            <div className="markdown-empty-state text-foreground/60 text-sm italic noto-sans-jp-light py-8">
              {fallbackContent || "No detailed content available."}
            </div>
          ) : null
        ) : (
          <div
            className="markdown-content-detail max-w-none prose prose-lg dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: state.parsedContent }}
          />
        )}
      </div>
    </MarkdownErrorBoundary>
  );
};

// Export additional utilities
export { MarkdownError, MarkdownErrorType } from "../../lib/markdown/client";
export type { MarkdownRendererProps, MarkdownRendererState };

// Default export
export default MarkdownRenderer;
