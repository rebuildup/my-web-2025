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
import { MarkdownRendererErrorClass } from "./markdown-renderer/error";
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
	customRenderer?: (content: string) => string;
	contentId?: string;
	behavior?: MarkdownRendererBehavior;
}

export interface MarkdownRendererBehavior {
	enableSanitization?: boolean;
	enableValidation?: boolean;
	enableIntegrityCheck?: boolean;
	showRetryButton?: boolean;
	showEmptyState?: boolean;
}

const DEFAULT_BEHAVIOR: Required<MarkdownRendererBehavior> = {
	enableSanitization: true,
	enableValidation: true,
	enableIntegrityCheck: false,
	showRetryButton: true,
	showEmptyState: true,
};

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

const configureMarked = () => {
	marked.setOptions({
		breaks: true,
		gfm: true,
	});
};

configureMarked();

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
	filePath,
	content,
	mediaData,
	className = "",
	fallbackContent = "Content not available",
	customRenderer,
	contentId,
	behavior,
}) => {
	const resolvedBehavior = { ...DEFAULT_BEHAVIOR, ...(behavior ?? {}) };
	const {
		enableSanitization,
		enableValidation,
		enableIntegrityCheck,
		showRetryButton,
		showEmptyState,
	} = resolvedBehavior;

	const [state, setState] = useState<MarkdownRendererState>({
		content: "",
		isLoading: true,
		error: null,
		parsedContent: "",
		validationResult: undefined,
		integrityCheck: undefined,
	});

	const [contentParser] = useState(() => createContentParser());

	const loadContent = useCallback(async () => {
		if (!filePath && typeof content !== "string") {
			const error = new MarkdownRendererErrorClass(
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
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			let rawContent: string;
			if (typeof content === "string") {
				rawContent = content;
			} else if (filePath) {
				rawContent = await fetchMarkdownContent(filePath, enableIntegrityCheck);
			} else {
				const noContentError = new MarkdownRendererErrorClass(
					"No markdown content available",
					"FILE_NOT_FOUND",
					"",
				);
				return Promise.reject(noContentError);
			}

			if (!rawContent || rawContent.trim().length === 0) {
				setState({
					content: "",
					isLoading: false,
					error: null,
					parsedContent: "",
				});
				return;
			}

			const processed = await processMarkdownContent(rawContent, mediaData, {
				contentParser,
				customRenderer,
				enableSanitization,
				enableValidation,
				filePath,
			});

			setState({
				content: rawContent,
				isLoading: false,
				error: null,
				parsedContent: processed.html,
				validationResult: processed.validation,
			});
		} catch (error) {
			const markdownError =
				error instanceof MarkdownRendererErrorClass
					? error
					: error instanceof MarkdownError
						? new MarkdownRendererErrorClass(
								error.message,
								"PARSE_ERROR",
								filePath || "",
							)
						: new MarkdownRendererErrorClass(
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
