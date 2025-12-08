/**
 * Markdown Renderer Component for Detail Pages
 * Fetches and displays markdown files with embedded media resolution
 * Based on markdown-content-system design specifications
 */

"use client";

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
	embedValidator,
	MarkdownError,
	MarkdownErrorType,
	markdownErrorHandler,
} from "@/lib/markdown/client";
import { createContentParser } from "../../lib/markdown/content-parser";
import type { MediaData } from "../../types/content";
import { MarkdownErrorBoundary } from "../markdown/FallbackContent";
import { BookmarkCard } from "./BookmarkCard";

interface BookmarkPayload {
	title?: string;
	description?: string;
	url: string;
	image?: string;
	linkText?: string;
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
	const linkText = payload.linkText?.trim();
	const safeTitle = escapeHtml(title || "Bookmark");
	const safeDescription = description ? escapeHtml(description) : null;
	const safeLinkText = linkText ? escapeHtml(linkText) : null;
	const safeUrl = url ? escapeHtml(url) : "";
	const safeImage = image ? escapeHtml(image) : null;

	const thumbnailHtml = safeImage
		? `<div class="bookmark-card-thumbnail" style="max-width: 140px; max-height: 140px; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; border-radius: 0.375rem; overflow: hidden;"><img src="${safeImage}" alt="" loading="lazy" style="max-width: 140px; max-height: 140px; width: auto; height: auto; object-fit: contain; display: block; border-radius: 0.375rem;" /></div>`
		: "";

	const linkSection = url
		? `<a href="${safeUrl}" class="bookmark-card-link" target="_blank" rel="noreferrer">
			<div class="bookmark-card-layout">
				${thumbnailHtml}
				<div class="bookmark-card-content">
					<div class="bookmark-card-title">${safeTitle || "Bookmark"}</div>
					${safeDescription ? `<div class="bookmark-card-description">${safeDescription}</div>` : ""}
					${safeLinkText ? `<div class="bookmark-card-link-text">${safeLinkText}</div>` : ""}
				</div>
			</div>
		</a>`
		: `<div class="bookmark-card-layout">
			${thumbnailHtml}
			<div class="bookmark-card-content">
				<div class="bookmark-card-title">${safeTitle}</div>
				${safeDescription ? `<div class="bookmark-card-description">${safeDescription}</div>` : ""}
				${safeLinkText ? `<div class="bookmark-card-link-text">${safeLinkText}</div>` : ""}
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
						linkText: (data as any).linkText?.trim(),
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
				let normalizedPath: string;
				if (path.startsWith("/")) {
					normalizedPath = path;
				} else {
					normalizedPath = `/${path}`;
				}

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
						const fileNotFoundError = new MarkdownError(
							MarkdownErrorType.FILE_NOT_FOUND,
							`Markdown file not found: ${normalizedPath}`,
							{ filePath: normalizedPath, status: response.status },
							"Check if the file path is correct and the file exists",
						);
						return Promise.reject(fileNotFoundError);
					}
					console.error(
						`[MarkdownRenderer] Fetch failed: ${response.status} ${response.statusText}`,
					);
					const fetchError = new MarkdownError(
						MarkdownErrorType.PERMISSION_DENIED,
						`Failed to fetch markdown file: ${response.statusText}`,
						{ filePath: normalizedPath, status: response.status },
						"Check file permissions and server configuration",
					);
					return Promise.reject(fetchError);
				}

				const content = await response.text();

				console.log(`[MarkdownRenderer] Content length: ${content.length}`);
				console.log(
					`[MarkdownRenderer] Content preview: ${content.substring(0, 100)}...`,
				);

				// Check if content is empty or just whitespace
				if (!content) {
					console.info(`Markdown file is empty: ${normalizedPath}`);
					return ""; // Return empty string for empty files
				}
				if (content.trim().length === 0) {
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
					return Promise.reject(error);
				}
				const handledError = markdownErrorHandler.handleFileError(error, path);
				return Promise.reject(handledError);
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
					if (validationResult.warnings) {
						if (validationResult.warnings.length > 0) {
							console.warn(
								"Markdown validation warnings:",
								validationResult.warnings,
							);
						}
					}

					// Return error if validation fails
					if (!validationResult.isValid) {
						if (validationResult.errors.length > 0) {
							const firstError = validationResult.errors[0];
							const validationError = new MarkdownError(
								MarkdownErrorType.EMBED_ERROR,
								`Embed validation failed: ${firstError.message}`,
								{
									validationErrors: validationResult.errors,
									line: firstError.line,
									column: firstError.column,
								},
								firstError.suggestion,
							);
							return Promise.reject(validationError);
						}
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
				let htmlContent: string;
				if (customRenderer) {
					htmlContent = customRenderer(contentWithResolvedEmbeds);
				} else {
					htmlContent = await marked.parse(contentWithResolvedEmbeds);
				}

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
					return Promise.reject(error);
				}
				let errorMessage = "Unknown error";
				if (error instanceof Error) {
					errorMessage = error.message;
				}
				const processError = new MarkdownError(
					MarkdownErrorType.INVALID_CONTENT,
					`Failed to process markdown content: ${errorMessage}`,
					{ filePath, originalError: error },
					"Check the markdown syntax and embedded content references",
				);
				return Promise.reject(processError);
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
				const noContentError = new MarkdownFileError(
					"No markdown content available",
					"FILE_NOT_FOUND",
					"",
				);
				return Promise.reject(noContentError);
			}

			// Handle empty content gracefully
			if (!rawContent) {
				console.log(`[MarkdownRenderer] Content is empty, setting empty state`);
				setState({
					content: "",
					isLoading: false,
					error: null,
					parsedContent: "", // Empty parsed content for empty files
				});
				return;
			}
			if (rawContent.trim().length === 0) {
				console.log(`[MarkdownRenderer] Content is empty, setting empty state`);
				setState({
					content: "",
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

	const containerRef = useRef<HTMLDivElement>(null);

	// Initialize Twitter embeds after rendering
	useEffect(() => {
		if (!containerRef.current || !state.parsedContent) return;

		// Check if there are any Twitter embeds
		const hasTwitterEmbeds = containerRef.current.querySelector(
			"blockquote.twitter-tweet",
		);
		if (!hasTwitterEmbeds) return;

		// Load Twitter widgets if available
		const loadTwitterWidgets = () => {
			if (typeof window !== "undefined" && (window as any).twttr) {
				const twttr = (window as any).twttr;
				if (twttr.ready) {
					twttr.ready(() => {
						if (twttr.widgets && twttr.widgets.load && containerRef.current) {
							twttr.widgets.load(containerRef.current);
						}
					});
				} else if (
					twttr.widgets &&
					twttr.widgets.load &&
					containerRef.current
				) {
					twttr.widgets.load(containerRef.current);
				}
			}
		};

		// Wait for Twitter script to load
		const checkTwitter = setInterval(() => {
			if (typeof window !== "undefined" && (window as any).twttr) {
				clearInterval(checkTwitter);
				loadTwitterWidgets();
			}
		}, 100);

		// Cleanup interval after 10 seconds
		const timeout = setTimeout(() => {
			clearInterval(checkTwitter);
		}, 10000);

		return () => {
			clearInterval(checkTwitter);
			clearTimeout(timeout);
		};
	}, [state.parsedContent]);

	// Replace bookmark cards with React components after rendering
	useEffect(() => {
		if (!containerRef.current || !state.parsedContent) return;

		// Use requestAnimationFrame to ensure DOM is ready
		const frameId = requestAnimationFrame(() => {
			if (!containerRef.current) return;

			const bookmarkCards = Array.from(
				containerRef.current.querySelectorAll(".markdown-bookmark-card"),
			);

			bookmarkCards.forEach((card) => {
				// Check if already properly rendered (has proper structure)
				const hasProperStructure =
					card.querySelector(".bookmark-card-link") ||
					card.querySelector(".bookmark-card-layout");

				// If already properly rendered and marked, skip
				if (
					hasProperStructure &&
					card.getAttribute("data-react-rendered") === "true"
				) {
					return;
				}

				// If marked but not properly rendered, remove the mark to retry
				if (
					card.getAttribute("data-react-rendered") === "true" &&
					!hasProperStructure
				) {
					card.removeAttribute("data-react-rendered");
				}

				// Mark as processed immediately to prevent duplicate processing
				card.setAttribute("data-react-rendered", "true");

				// Try to find link element
				const link = card.querySelector(".bookmark-card-link");
				let url = link?.getAttribute("href") || "";

				// If no link element, try to extract URL from data attributes or text content
				if (!url) {
					// Check if there's a data-json attribute with URL
					const dataJson = card.getAttribute("data-json");
					if (dataJson) {
						let parsedData: { url?: string } | null = null;
						try {
							parsedData = JSON.parse(decodeURIComponent(dataJson));
						} catch {
							// Ignore parse errors
						}
						if (parsedData) {
							const parsedUrl = parsedData.url;
							url = parsedUrl || "";
						}
					}
				}

				// Extract existing data
				const titleEl = card.querySelector(".bookmark-card-title");
				const descriptionEl = card.querySelector(".bookmark-card-description");
				const imageEl = card.querySelector(".bookmark-card-thumbnail img");
				const linkTextEl = card.querySelector(".bookmark-card-link-text");

				let title = titleEl?.textContent?.trim();
				let description = descriptionEl?.textContent?.trim();
				const image = imageEl?.getAttribute("src") || undefined;
				let linkText = linkTextEl?.textContent?.trim();

				// If no structured data found, try to extract from text content
				if (!title && !description) {
					// Get all text nodes, excluding nested elements
					const textContent = Array.from(card.childNodes)
						.filter((node) => node.nodeType === Node.TEXT_NODE)
						.map((node) => node.textContent?.trim())
						.filter((text) => text && text.length > 0)
						.join(" ")
						.trim();

					if (textContent) {
						// Try to parse the text content
						// Split by common separators (|, -, etc.)
						const parts = textContent
							.split(/[|・\-]/)
							.map((p) => p.trim())
							.filter((p) => p);
						if (parts.length > 0) {
							title = parts[0];
							if (parts.length > 1) {
								description = parts.slice(1).join(" ").trim();
							}
						} else {
							// Use the whole text as title if no structure found
							title = textContent;
						}
					}

					// Also check if there's text directly in the link element
					if (!title && link) {
						const linkText = link.textContent?.trim();
						if (linkText && linkText !== url) {
							const parts = linkText
								.split(/[|・\-]/)
								.map((p) => p.trim())
								.filter((p) => p);
							if (parts.length > 0) {
								title = parts[0];
								if (parts.length > 1) {
									description = parts.slice(1).join(" ").trim();
								}
							}
						}
					}
				}

				// Skip if no URL and no meaningful content
				if (!url && !title && !description) {
					return;
				}

				// Create a container for React component
				const reactContainer = document.createElement("div");
				reactContainer.className = card.className;
				// Preserve any other attributes except data-react-rendered
				Array.from(card.attributes).forEach((attr) => {
					if (attr.name !== "class" && attr.name !== "data-react-rendered") {
						reactContainer.setAttribute(attr.name, attr.value);
					}
				});

				// Replace the card with the new container
				if (card.parentNode) {
					card.parentNode.replaceChild(reactContainer, card);
				}

				// Render React component
				const root = createRoot(reactContainer);
				root.render(
					<BookmarkCard
						url={url || "#"}
						title={title}
						description={description}
						image={image}
						linkText={linkText}
					/>,
				);
			});
		});

		return () => cancelAnimationFrame(frameId);
	}, [state.parsedContent]);

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
			ref={containerRef}
			className={`markdown-renderer ${className}`}
			dangerouslySetInnerHTML={{ __html: state.parsedContent }}
		/>
	);
};

export default MarkdownRenderer;
