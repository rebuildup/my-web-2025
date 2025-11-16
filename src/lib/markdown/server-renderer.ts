/**
 * Server-side Markdown Renderer
 * Renders markdown content on the server side using ContentParser and marked
 */

import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import type { MediaData } from "@/types/content";
import { createContentParser } from "./content-parser";

// Configure marked options
marked.setOptions({
	breaks: true,
	gfm: true,
});

// Transform bookmark placeholders to HTML
const transformBookmarkPlaceholders = (html: string): string => {
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

	const renderBookmarkCardHtml = (payload: {
		title?: string;
		description?: string;
		url: string;
		image?: string;
		linkText?: string;
	}): string => {
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

	return html
		.replace(
			/<p>\s*(<bookmark-card\b[^>]*><\/bookmark-card>)\s*<\/p>/gi,
			(_match, inner) => inner,
		)
		.replace(
			/<bookmark-card\s+data-json="([^"]*)"><\/bookmark-card>/gi,
			(match, encoded) => {
				try {
					const data = JSON.parse(decodeURIComponent(encoded)) as {
						title?: string;
						description?: string;
						url: string;
						image?: string;
						linkText?: string;
					};
					if (!data) {
						return "";
					}

					const trimmedTitle = data.title?.trim();
					const trimmedDescription = data.description?.trim();
					const trimmedUrl = data.url?.trim();
					const trimmedImage = data.image?.trim();

					if (!trimmedTitle && !trimmedDescription && !trimmedUrl) {
						return "";
					}

					return renderBookmarkCardHtml({
						title: trimmedTitle,
						description: trimmedDescription,
						url: trimmedUrl ?? "",
						image: trimmedImage,
						linkText: data.linkText?.trim(),
					});
				} catch (error) {
					console.warn("Failed to transform bookmark placeholder", error);
					return "";
				}
			},
		);
};

const removeDanglingCounters = (html: string): string =>
	html.replace(/\n?\s*<p>0<\/p>\s*$/i, "");

/**
 * Render markdown content on the server side
 */
export async function renderMarkdownServer(
	content: string,
	mediaData: MediaData,
	options?: {
		enableSanitization?: boolean;
	},
): Promise<string> {
	if (!content || content.trim().length === 0) {
		return "";
	}

	const contentParser = createContentParser();

	// Resolve embed references
	const contentWithResolvedEmbeds = await contentParser.parseMarkdown(
		content,
		mediaData,
	);

	// Parse markdown to HTML
	let htmlContent = await marked.parse(contentWithResolvedEmbeds);

	// Transform bookmark placeholders
	htmlContent = transformBookmarkPlaceholders(htmlContent);
	htmlContent = removeDanglingCounters(htmlContent);

	// Sanitize HTML if enabled
	if (options?.enableSanitization !== false) {
		htmlContent = DOMPurify.sanitize(htmlContent, {
			ALLOWED_TAGS: [
				"p",
				"br",
				"strong",
				"em",
				"u",
				"s",
				"h1",
				"h2",
				"h3",
				"h4",
				"h5",
				"h6",
				"ul",
				"ol",
				"li",
				"blockquote",
				"code",
				"pre",
				"a",
				"img",
				"table",
				"thead",
				"tbody",
				"tr",
				"th",
				"td",
				"hr",
				"div",
				"span",
			],
			ALLOWED_ATTR: [
				"href",
				"src",
				"alt",
				"title",
				"class",
				"id",
				"target",
				"rel",
				"loading",
			],
		});
	}

	return htmlContent;
}
