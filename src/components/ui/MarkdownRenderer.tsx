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
import FallbackContent, {
  MarkdownErrorBoundary,
} from "../markdown/FallbackContent";

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

  // Custom renderer for better styling
  const renderer = new marked.Renderer();

  // Custom image renderer to add responsive classes
  renderer.image = ({
    href,
    title,
    text,
  }: {
    href: string;
    title?: string | null;
    text: string;
  }) => {
    const titleAttr = title ? ` title="${title}"` : "";
    return `<img src="${href}" alt="${text}"${titleAttr} class="markdown-image max-w-full h-auto rounded-lg shadow-sm" loading="lazy" />`;
  };

  // Custom link renderer for external links
  renderer.link = ({
    href,
    title,
    tokens,
  }: {
    href: string;
    title?: string | null;
    tokens: Array<{ raw: string }>;
  }) => {
    const text = tokens.map((token) => token.raw).join("");
    const titleAttr = title ? ` title="${title}"` : "";
    const isExternal = href.startsWith("http") || href.startsWith("//");
    const externalAttrs = isExternal
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    return `<a href="${href}"${titleAttr}${externalAttrs} class="markdown-link text-blue-600 hover:text-blue-800 underline">${text}</a>`;
  };

  // Custom code block renderer
  renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
    const language = lang || "text";
    return `<pre class="markdown-code-block bg-gray-100 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto"><code class="language-${language}">${text}</code></pre>`;
  };

  // Custom blockquote renderer
  renderer.blockquote = (quote) => {
    return `<blockquote class="markdown-blockquote border-l-4 border-blue-500 pl-4 italic text-gray-700 dark:text-gray-300">${quote}</blockquote>`;
  };

  marked.use({ renderer });
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
        const response = await fetch(path);

        if (!response.ok) {
          if (response.status === 404) {
            throw new MarkdownError(
              MarkdownErrorType.FILE_NOT_FOUND,
              `Markdown file not found: ${path}`,
              { filePath: path, status: response.status },
              "Check if the file path is correct and the file exists",
            );
          }
          throw new MarkdownError(
            MarkdownErrorType.PERMISSION_DENIED,
            `Failed to fetch markdown file: ${response.statusText}`,
            { filePath: path, status: response.status },
            "Check file permissions and server configuration",
          );
        }

        const content = await response.text();

        // Note: File integrity check is not available in client components
        // This feature requires server-side processing
        if (enableIntegrityCheck) {
          console.warn(
            "File integrity check is not available in client components",
          );
        }

        return content;
      } catch (error) {
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
      const rawContent = await fetchMarkdownContent(filePath);
      const processedContent = await processMarkdownContent(
        rawContent,
        mediaData,
      );

      setState({
        content: rawContent,
        isLoading: false,
        error: null,
        parsedContent: processedContent,
      });
    } catch (error) {
      const markdownError =
        error instanceof MarkdownFileError
          ? error
          : new MarkdownFileError(
              `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
              "PARSE_ERROR",
              filePath,
            );

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: markdownError,
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
    loadContent();
  }, [loadContent]);

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

  // Render error state with enhanced fallback
  if (state.error) {
    return (
      <div className={`markdown-renderer-error ${className}`}>
        <FallbackContent
          error={state.error}
          fallbackContent={fallbackContent}
          contentId={contentId}
          onRetry={showRetryButton ? loadContent : undefined}
          showRetryButton={showRetryButton}
          showErrorDetails={process.env.NODE_ENV === "development"}
        />

        {/* Show validation errors if available */}
        {state.validationResult && !state.validationResult.isValid && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Content Validation Issues:
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {state.validationResult.errors.map((error, index) => (
                <li key={index}>
                  Line {error.line}, Column {error.column}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Show integrity check results if available */}
        {state.integrityCheck && !state.integrityCheck.isValid && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-2">
              File Integrity Warning:
            </h4>
            <p className="text-sm text-orange-700">
              The file may have been modified or corrupted. Checksum:{" "}
              {state.integrityCheck.checksum}
            </p>
          </div>
        )}
      </div>
    );
  }

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

        <div
          className="markdown-content prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: state.parsedContent }}
        />
      </div>
    </MarkdownErrorBoundary>
  );
};

// Export additional utilities
export { MarkdownError, MarkdownErrorType } from "../../lib/markdown/client";
export type { MarkdownRendererProps, MarkdownRendererState };

// Default export
export default MarkdownRenderer;
