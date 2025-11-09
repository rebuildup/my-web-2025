/**
 * Markdown Renderer Component for Detail Pages
 * Fetches and displays markdown files with embedded media resolution
 * Based on markdown-content-system design specifications
 */

"use client";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
	embedValidator,
	MarkdownError,
	MarkdownErrorType,
	markdownErrorHandler,
} from "@/lib/markdown/client";
import { createContentParser } from "../../lib/markdown/content-parser";
import type { MediaData } from "../../types/content";
import { MarkdownErrorBoundary } from "../markdown/FallbackContent";

interface BookmarkPayload {
	title?: string;
	description?: string;
	url: string;
	image?: string;
}

const escapeHtml = (value: string): string =>
	value.replace(/[&<>"']/g, (char) => {
		const map: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};
		return map[char] ?? char;
	});

const renderBookmarkCardHtml = (payload: BookmarkPayload): string => {
	const url = (payload.url || "").trim();
	const title = (payload.title || url).trim();
	const description = payload.description?.trim();
	const image = payload.image?.trim();
	const safeTitle = escapeHtml(title || "Bookmark");
	const safeDescription = description ? escapeHtml(description) : null;
	let domain = "";
	try {
		if (url) {
			const parsed = new URL(url);
			domain = parsed.hostname;
		}
	} catch {
		domain = url;
	}
	const safeDomain = domain ? escapeHtml(domain) : null;
	const safeUrl = url ? escapeHtml(url) : "";
	const safeImage = image ? escapeHtml(image) : null;

	const linkSection = url
		? `<a href="${safeUrl}" class="bookmark-card-link" target="_blank" rel="noreferrer">
			<div class="bookmark-card-layout">
				${safeImage ? `<div class="bookmark-card-thumbnail"><img src="${safeImage}" alt="" loading="lazy" /></div>` : ""}
				<div class="bookmark-card-text">
					<div class="bookmark-card-title">${safeTitle || "Bookmark"}</div>
					${safeDescription ? `<p class="bookmark-card-description">${safeDescription}</p>` : ""}
				</div>
				<div class="bookmark-card-meta">
					${safeDomain ? `<span class="bookmark-card-domain">${safeDomain}</span>` : ""}
					<span class="bookmark-card-arrow">→</span>
				</div>
			</div>
		</a>`
		: `<div class="bookmark-card-layout">
			${safeImage ? `<div class="bookmark-card-thumbnail"><img src="${safeImage}" alt="" loading="lazy" /></div>` : ""}
			<div class="bookmark-card-text">
				<div class="bookmark-card-title">${safeTitle}</div>
				${safeDescription ? `<p class="bookmark-card-description">${safeDescription}</p>` : ""}
			</div>
			<div class="bookmark-card-meta">
				${safeDomain ? `<span class="bookmark-card-domain">${safeDomain}</span>` : ""}
				<span class="bookmark-card-arrow">→</span>
			</div>
		</div>`;

	return `<div class="markdown-bookmark-card${url ? "" : " bookmark-card--invalid"}">
		${linkSection}
	</div>`;
};

const _renderBookmarkFallback = (
	payload?: Partial<BookmarkPayload>,
): string => {
	const safeMessage = escapeHtml(
		payload?.title || payload?.url || "リンク情報を取得できませんでした",
	);
	const safeDescription = payload?.description
		? escapeHtml(payload.description)
		: null;
	return `<div class="markdown-bookmark-card bookmark-card--invalid">
		<div class="bookmark-card-layout">
			<div class="bookmark-card-text">
				<div class="bookmark-card-title">${safeMessage}</div>
				${safeDescription ? `<p class="bookmark-card-description">${safeDescription}</p>` : ""}
			</div>
			<div class="bookmark-card-meta">
				<span class="bookmark-card-arrow">→</span>
			</div>
		</div>
	</div>`;
};

const transformBookmarkPlaceholders = (html: string): string =>
	html
		.replace(
			/<p>\s*(<bookmark-card\b[^>]*><\/bookmark-card>)\s*<\/p>/gi,
			(_match, inner) => inner,
		)
		.replace(
			/<bookmark-card\s+data-json="([^"]*)"><\/bookmark-card>/gi,
			(match, encoded) => {
				try {
					const data = JSON.parse(
						decodeURIComponent(encoded),
					) as BookmarkPayload;
					if (!data) {
						return "";
					}

					const trimmedTitle = data.title?.trim();
					const trimmedDescription = data.description?.trim();
					const trimmedUrl = data.url?.trim();
					const trimmedImage = (data as any).image?.trim();

					if (!trimmedTitle && !trimmedDescription && !trimmedUrl) {
						return "";
					}

					return renderBookmarkCardHtml({
						title: trimmedTitle,
						description: trimmedDescription,
						url: trimmedUrl ?? "",
						image: trimmedImage,
					});
				} catch (error) {
					console.warn("Failed to transform bookmark placeholder", error);
					return "";
				}
			},
		);

const removeDanglingCounters = (html: string): string =>
	html.replace(/\n?\s*<p>0<\/p>\s*$/i, "");

// Component props interface
interface MarkdownRendererProps {
	filePath?: string;
	content?: string;
	mediaData: MediaData;
	className?: string;
	fallbackContent?: string;
	enableSanitization?: boolean;
	customRenderer?: (content: string) => string;
	enableValidation?: boolean;
	enableIntegrityCheck?: boolean;
	showRetryButton?: boolean;
	contentId?: string;
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
	content,
	mediaData,
	className = "",
	fallbackContent = "Content not available",
	enableSanitization = true,
	customRenderer,
	enableValidation = true,
	enableIntegrityCheck = false,
	showRetryButton = true,
	contentId,
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
				console.log(`[MarkdownRenderer] Media data:`, media);
				console.log(
					`[MarkdownRenderer] Raw content preview:`,
					rawContent.substring(0, 200),
				);

				const contentWithResolvedEmbeds = await contentParser.parseMarkdown(
					rawContent,
					media,
				);

				console.log(
					`[MarkdownRenderer] Content after embed resolution:`,
					contentWithResolvedEmbeds.substring(0, 200),
				);

				// Then, parse markdown to HTML
				let htmlContent = customRenderer
					? customRenderer(contentWithResolvedEmbeds)
					: await marked.parse(contentWithResolvedEmbeds);

				htmlContent = transformBookmarkPlaceholders(htmlContent);
				htmlContent = removeDanglingCounters(htmlContent);

				// Sanitize HTML if enabled
				if (enableSanitization) {
					const resetTargetHook = (node: Element) => {
						if (node.tagName === "A") {
							node.removeAttribute("target");
							node.removeAttribute("rel");
						}
					};
					DOMPurify.addHook("afterSanitizeAttributes", resetTargetHook);
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
							"width",
							"height",
							"frameborder",
							"allow",
							"allowfullscreen", // For iframes
							"loading", // For lazy loading
						],
						ALLOWED_URI_REGEXP:
							/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
					});
					DOMPurify.removeHook("afterSanitizeAttributes", resetTargetHook);
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

		if (!filePath && typeof content !== "string") {
			const error = new MarkdownFileError(
				"No content source provided",
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

			console.warn("Failed to load markdown content:", error);
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			let rawContent: string;
			if (typeof content === "string") {
				rawContent = content;
				console.log("[MarkdownRenderer] Using provided markdown content");
			} else if (filePath) {
				console.log(
					`[MarkdownRenderer] Starting to fetch content for: ${filePath}`,
				);
				rawContent = await fetchMarkdownContent(filePath);
			} else {
				throw new MarkdownFileError(
					"No markdown content available",
					"FILE_NOT_FOUND",
					"",
				);
			}

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
						? new MarkdownFileError(
								error.message,
								"PARSE_ERROR",
								filePath || "",
							)
						: new MarkdownFileError(
								`Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
								"PARSE_ERROR",
								filePath || "",
							);

			setState((prev) => ({
				...prev,
				isLoading: false,
				error: markdownError,
				parsedContent: "",
				content: "",
			}));

			console.warn("Failed to load markdown content:", markdownError);
		}
	}, [
		filePath,
		content,
		mediaData,
		fetchMarkdownContent,
		processMarkdownContent,
	]);

	useEffect(() => {
		loadContent();
	}, [loadContent]);

	if (state.isLoading && showEmptyState) {
		return (
			<div className="markdown-renderer-loading">
				<p>Loading markdown content...</p>
			</div>
		);
	}

	if (state.error) {
		return (
			<MarkdownErrorBoundary contentId={contentId}>
				<div className="markdown-renderer-error">
					<p>Error loading markdown content: {state.error.message}</p>
					{showRetryButton && (
						<button
							type="button"
							onClick={loadContent}
							className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Retry
						</button>
					)}
				</div>
			</MarkdownErrorBoundary>
		);
	}

	if (!state.parsedContent && showEmptyState) {
		return (
			<div className="markdown-renderer-empty">
				<p>{fallbackContent}</p>
			</div>
		);
	}

	return (
		<div
			className={`markdown-renderer ${className}`}
			dangerouslySetInnerHTML={{ __html: state.parsedContent }}
		/>
	);
};

export default MarkdownRenderer;
