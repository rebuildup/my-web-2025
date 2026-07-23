/**
 * Markdown Renderer Component for Detail Pages
 * Fetches and displays markdown files with embedded media resolution
 * Based on markdown-content-system design specifications
 */

"use client";

import { marked } from "marked";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownError } from "@/lib/markdown/client";
import { createContentParser } from "../../lib/markdown/content-parser";
import type { MediaData } from "../../types/content";
import { MarkdownErrorBoundary } from "../markdown/FallbackContent";
import { fetchMarkdownContent } from "./markdown-renderer/fetch-content";
import { processMarkdownContent } from "./markdown-renderer/process-content";
import { useBookmarkCardReplacer } from "./markdown-renderer/use-bookmark-replacer";
import { useTwitterEmbeds } from "./markdown-renderer/use-twitter-embeds";

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

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
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
				rawContent = await fetchMarkdownContent(filePath, enableIntegrityCheck);
			} else {
				const noContentError = new MarkdownFileError(
					"No markdown content available",
					"FILE_NOT_FOUND",
					"",
				);
				return Promise.reject(noContentError);
			}

			// Handle empty content gracefully
			if (!rawContent || rawContent.trim().length === 0) {
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
			const processed = await processMarkdownContent(rawContent, mediaData, {
				contentParser,
				customRenderer,
				enableSanitization,
				enableValidation,
				filePath,
			});

			console.log(
				`[MarkdownRenderer] Content processed successfully, setting state`,
			);
			console.log(
				`[MarkdownRenderer] Processed content preview: ${processed.html.substring(0, 200)}...`,
			);
			setState({
				content: rawContent,
				isLoading: false,
				error: null,
				parsedContent: processed.html,
				validationResult: processed.validation,
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
		contentParser,
		customRenderer,
		enableSanitization,
		enableValidation,
		enableIntegrityCheck,
	]);

	useEffect(() => {
		loadContent();
	}, [loadContent]);

	const containerRef = useRef<HTMLDivElement>(null);

	// Wire up post-render enhancements: Twitter widgets and bookmark card hydration
	useTwitterEmbeds(containerRef, state.parsedContent);
	useBookmarkCardReplacer(containerRef, state.parsedContent);

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
							className="mt-2 px-4 py-2"
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
