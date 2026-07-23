/**
 * Bookmark card HTML rendering utilities for MarkdownRenderer.
 *
 * Pure functions used during the markdown-to-HTML pipeline to:
 *   - escape untrusted strings for safe HTML injection
 *   - render a `<bookmark-card>` placeholder as a styled HTML card
 *   - fall back to a degraded card when the payload is invalid
 *   - strip stray <p>0</p> counters introduced by the markdown parser
 */

export interface BookmarkPayload {
	title?: string;
	description?: string;
	url: string;
	image?: string;
	linkText?: string;
}

export const escapeHtml = (value: string): string =>
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

export const renderBookmarkCardHtml = (payload: BookmarkPayload): string => {
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

export const _renderBookmarkFallback = (
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

export const transformBookmarkPlaceholders = (html: string): string =>
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

export const removeDanglingCounters = (html: string): string =>
	html.replace(/\n?\s*<p>0<\/p>\s*$/i, "");
