/**
 * Markdown Renderer Component for Detail Pages
 * Fetches and displays markdown files with embedded media resolution
 * Based on markdown-content-system design specifications
 */

"use client";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import React, { useCallback, useEffect, useState } from "react";
import { createContentParser } from "../../lib/markdown/content-parser";
import type { MediaData } from "../../types/content";

// Component props interface
interface MarkdownRendererProps {
  filePath: string;
  mediaData: MediaData;
  className?: string;
  onError?: (error: Error) => void;
  fallbackContent?: string;
  enableSanitization?: boolean;
  customRenderer?: (content: string) => string;
}

// Component state interface
interface MarkdownRendererState {
  content: string;
  isLoading: boolean;
  error: Error | null;
  parsedContent: string;
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
  onError,
  fallbackContent = "Content not available",
  enableSanitization = true,
  customRenderer,
}) => {
  const [state, setState] = useState<MarkdownRendererState>({
    content: "",
    isLoading: true,
    error: null,
    parsedContent: "",
  });

  const [contentParser] = useState(() => createContentParser());

  // Fetch markdown file content
  const fetchMarkdownContent = useCallback(
    async (path: string): Promise<string> => {
      try {
        const response = await fetch(path);

        if (!response.ok) {
          if (response.status === 404) {
            throw new MarkdownFileError(
              `Markdown file not found: ${path}`,
              "FILE_NOT_FOUND",
              path,
            );
          }
          throw new MarkdownFileError(
            `Failed to fetch markdown file: ${response.statusText}`,
            "FETCH_ERROR",
            path,
          );
        }

        return await response.text();
      } catch (error) {
        if (error instanceof MarkdownFileError) {
          throw error;
        }
        throw new MarkdownFileError(
          `Network error while fetching markdown file: ${error instanceof Error ? error.message : "Unknown error"}`,
          "FETCH_ERROR",
          path,
        );
      }
    },
    [],
  );

  // Process markdown content with embed resolution
  const processMarkdownContent = useCallback(
    async (rawContent: string, media: MediaData): Promise<string> => {
      try {
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
        throw new MarkdownFileError(
          `Failed to process markdown content: ${error instanceof Error ? error.message : "Unknown error"}`,
          "PARSE_ERROR",
          filePath,
        );
      }
    },
    [contentParser, customRenderer, enableSanitization, filePath],
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

  // Render error state with fallback
  if (state.error) {
    return (
      <div className={`markdown-renderer-error ${className}`}>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Failed to load content
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{state.error.message}</p>
                {(state.error as MarkdownFileError).code ===
                  "FILE_NOT_FOUND" && (
                  <p className="mt-1 text-xs">
                    The markdown file may not exist or may have been moved.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fallback content */}
        {fallbackContent && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {fallbackContent}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render markdown content
  return (
    <div className={`markdown-renderer ${className}`}>
      <div
        className="markdown-content prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: state.parsedContent }}
      />
    </div>
  );
};

// Export additional utilities
export type { MarkdownRendererProps, MarkdownRendererState };

// Default export
export default MarkdownRenderer;
