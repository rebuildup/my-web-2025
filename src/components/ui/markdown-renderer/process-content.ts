/**
 * Markdown content processor used by MarkdownRenderer.
 *
 * Pipeline:
 *   1. Validate embed references against the media registry
 *   2. Resolve embed placeholders into the content stream
 *   3. Parse markdown into HTML via marked (or a custom renderer)
 *   4. Transform `<bookmark-card>` placeholders into styled HTML
 *   5. Strip dangling counter paragraphs
 *   6. Sanitize the resulting HTML with DOMPurify
 */

import { marked } from "marked";
import {
	embedValidator,
	MarkdownError,
	MarkdownErrorType,
} from "@/lib/markdown/client";
import { createContentParser } from "../../../lib/markdown/content-parser";
import type { MediaData } from "../../../types/content";
import {
	removeDanglingCounters,
	transformBookmarkPlaceholders,
} from "./bookmark-html";

export interface ProcessContentOptions {
	contentParser: ReturnType<typeof createContentParser>;
	customRenderer?: (content: string) => string;
	enableSanitization: boolean;
	enableValidation: boolean;
	filePath?: string;
}

export interface ProcessContentResult {
	html: string;
	validation?: {
		isValid: boolean;
		errors: Array<{ message: string; line: number; column: number }>;
		warnings?: string[];
	};
}

export const processMarkdownContent = async (
	rawContent: string,
	media: MediaData,
	options: ProcessContentOptions,
): Promise<ProcessContentResult> => {
	try {
		let validation: ProcessContentResult["validation"];

		// Validate embed references if enabled
		if (options.enableValidation) {
			const validationResult = embedValidator.validateEmbeds(rawContent, media);
			validation = {
				isValid: validationResult.isValid,
				errors: validationResult.errors,
				warnings: validationResult.warnings,
			};

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

		const contentWithResolvedEmbeds = await options.contentParser.parseMarkdown(
			rawContent,
			media,
		);

		console.log(
			`[MarkdownRenderer] Content after embed resolution:`,
			contentWithResolvedEmbeds.substring(0, 200),
		);

		// Then, parse markdown to HTML
		let htmlContent: string;
		if (options.customRenderer) {
			htmlContent = options.customRenderer(contentWithResolvedEmbeds);
		} else {
			htmlContent = await marked.parse(contentWithResolvedEmbeds);
		}

		htmlContent = transformBookmarkPlaceholders(htmlContent);
		htmlContent = removeDanglingCounters(htmlContent);

		// Sanitize HTML if enabled
		if (options.enableSanitization) {
			const { default: DOMPurify } = await import("dompurify");
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

		return { html: htmlContent, validation };
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
			{ filePath: options.filePath, originalError: error },
			"Check the markdown syntax and embedded content references",
		);
		return Promise.reject(processError);
	}
};
