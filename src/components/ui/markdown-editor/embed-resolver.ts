import type { MediaData } from "./types";

/**
 * Resolve embed references in the markdown content to usable markdown/HTML.
 * Image/video/link embeds become proper markdown links or HTML embeds.
 */
export function resolveEmbedReferences(
	content: string,
	embedSupport: boolean,
	mediaData: MediaData | undefined,
): string {
	if (!embedSupport || !mediaData) return content;

	let resolvedContent = content;

	// Resolve image embeds
	resolvedContent = resolvedContent.replace(
		/!\[image:(\d+)(?:\s+"([^"]*)")?\]/g,
		(match, indexStr, altText) => {
			const index = parseInt(indexStr, 10);
			if (index < mediaData.images.length) {
				const imageUrl = mediaData.images[index];
				const alt = altText || `Image ${index}`;
				return `![${alt}](${imageUrl})`;
			}
			return `**[Invalid image reference: ${match}]**`;
		},
	);

	// Resolve video embeds
	resolvedContent = resolvedContent.replace(
		/!\[video:(\d+)(?:\s+"([^"]*)")?\]/g,
		(match, indexStr, title) => {
			const index = parseInt(indexStr, 10);
			if (index < mediaData.videos.length) {
				const video = mediaData.videos[index];
				const videoTitle = title || video.title || `Video ${index}`;

				// Create video embed based on type
				if (video.type === "youtube") {
					const videoId = video.url.match(
						/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
					)?.[1];
					if (videoId) {
						return `<div class="video-embed"><iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="${videoTitle}" frameborder="0" allowfullscreen></iframe></div>`;
					}
				}

				// Fallback to link
				return `[${videoTitle}](${video.url})`;
			}
			return `**[Invalid video reference: ${match}]**`;
		},
	);

	// Resolve link embeds
	resolvedContent = resolvedContent.replace(
		/\[link:(\d+)(?:\s+"([^"]*)")?\]/g,
		(match, indexStr, customText) => {
			const index = parseInt(indexStr, 10);
			if (index < mediaData.externalLinks.length) {
				const link = mediaData.externalLinks[index];
				const linkText = customText || link.title || `Link ${index}`;
				return `[${linkText}](${link.url})`;
			}
			return `**[Invalid link reference: ${match}]**`;
		},
	);

	return resolvedContent;
}
