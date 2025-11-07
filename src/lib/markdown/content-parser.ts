/**
 * Enhanced Content Parser Service for Markdown Embed Resolution
 * Implements embed resolution for image, video, and link index references with Tailwind CSS support
 * Based on markdown-content-system design specifications
 */

import type {
	EmbedError,
	EmbedReference,
	EmbedResolutionMap,
	ExternalLink,
	MediaData,
	MediaEmbed,
	ValidationResult,
} from "../../types/content";
import {
	type ClassSuggestionEngine,
	createClassSuggestionEngine,
	createEmbedSyntaxParser,
	type EmbedSyntaxParser,
} from "./tailwind-css-validator";

// Enhanced embed syntax patterns for parsing with Tailwind CSS support
const EMBED_PATTERNS = {
	IMAGE: /!\[image:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
	VIDEO: /!\[video:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
	LINK: /\[link:(\d+)(?:\s+"([^"]*)")?(?:\s+class="([^"]*)")?\]/g,
	IFRAME: /<iframe[^>]*>.*?<\/iframe>/gi,
} as const;

// Enhanced content parser service interface with Tailwind CSS support
export interface ContentParserService {
	parseMarkdown(content: string, mediaData: MediaData): Promise<string>;
	resolveEmbedReferences(content: string, mediaData: MediaData): string;
	resolveEmbedReferencesToHTML(content: string, mediaData: MediaData): string;
	validateEmbedSyntax(content: string, mediaData: MediaData): ValidationResult;
	extractEmbedReferences(content: string): EmbedReference[];
	createEmbedResolutionMap(mediaData: MediaData): EmbedResolutionMap;
	sanitizeIframeContent(iframeHtml: string): string;
	sanitizeAndValidateIframe(iframeHtml: string): string;
	generateValidationFeedback(errors: EmbedError[]): string;
	validateTailwindClasses(
		classes: string[],
		embedType: "image" | "video" | "link" | "iframe",
	): {
		valid: string[];
		invalid: string[];
		suggestions: string[];
	};
}

// Media resolver service for mapping indices to URLs
export interface MediaResolverService {
	resolveImageIndex(index: number, images: string[]): string | null;
	resolveVideoIndex(index: number, videos: MediaEmbed[]): MediaEmbed | null;
	resolveLinkIndex(index: number, links: ExternalLink[]): ExternalLink | null;
	validateIndex(index: number, arrayLength: number): boolean;
}

// Implementation of media resolver service
export class MediaResolver implements MediaResolverService {
	resolveImageIndex(index: number, images: string[]): string | null {
		if (!this.validateIndex(index, images.length)) {
			return null;
		}
		return images[index] || null;
	}

	resolveVideoIndex(index: number, videos: MediaEmbed[]): MediaEmbed | null {
		if (!this.validateIndex(index, videos.length)) {
			return null;
		}
		return videos[index] || null;
	}

	resolveLinkIndex(index: number, links: ExternalLink[]): ExternalLink | null {
		if (!this.validateIndex(index, links.length)) {
			return null;
		}
		return links[index] || null;
	}

	validateIndex(index: number, arrayLength: number): boolean {
		return index >= 0 && index < arrayLength && Number.isInteger(index);
	}
}

// Enhanced implementation of content parser service with Tailwind CSS support
export class ContentParser implements ContentParserService {
	private mediaResolver: MediaResolverService;
	private classSuggestionEngine: ClassSuggestionEngine;
	private embedSyntaxParser: EmbedSyntaxParser;

	constructor(
		mediaResolver?: MediaResolverService,
		classSuggestionEngine?: ClassSuggestionEngine,
		embedSyntaxParser?: EmbedSyntaxParser,
	) {
		this.mediaResolver = mediaResolver || new MediaResolver();
		this.classSuggestionEngine =
			classSuggestionEngine || createClassSuggestionEngine();
		this.embedSyntaxParser =
			embedSyntaxParser || createEmbedSyntaxParser(this.classSuggestionEngine);
	}

	async parseMarkdown(content: string, mediaData: MediaData): Promise<string> {
		// First validate the content
		const validation = this.validateEmbedSyntax(content, mediaData);
		if (!validation.isValid) {
			console.warn("Embed validation errors found:", validation.errors);
		}

		// Resolve embed references to markdown format for parseMarkdown
		const resolved = this.resolveEmbedReferences(content, mediaData);
		return this.transformBookmarkTags(resolved);
	}

	// New method for HTML generation (used by MarkdownRenderer)
	resolveEmbedReferencesToHTML(content: string, mediaData: MediaData): string {
		let processedContent = content;

		// Create resolution map for efficient lookups
		const resolutionMap = this.createEmbedResolutionMap(mediaData);

		// Process image embeds with Tailwind CSS support
		processedContent = processedContent.replace(
			EMBED_PATTERNS.IMAGE,
			(_match, indexStr, altText, classString) => {
				const index = parseInt(indexStr, 10);
				const imageUrl = resolutionMap.images.get(index);

				if (!imageUrl) {
					return this.generateImageFallbackHTML(
						index,
						mediaData.images.length,
						altText,
					);
				}

				const alt = altText || `Image ${index}`;
				let classes = "";

				if (classString) {
					const classArray = classString
						.split(/\s+/)
						.filter((c: string) => c.length > 0);
					const validation =
						this.classSuggestionEngine.validateClasses(classArray);

					if (validation.invalid.length > 0) {
						console.warn(
							`Invalid Tailwind classes found in image:${index}:`,
							validation.invalid,
						);
					}

					classes =
						validation.valid.length > 0
							? ` class="${validation.valid.join(" ")}"`
							: "";
				}

				return `<img src="${imageUrl}" alt="${alt}"${classes} />`;
			},
		);

		// Process video embeds with Tailwind CSS support
		processedContent = processedContent.replace(
			EMBED_PATTERNS.VIDEO,
			(_match, indexStr, customTitle, classString) => {
				const index = parseInt(indexStr, 10);
				const video = resolutionMap.videos.get(index);

				if (!video) {
					return this.generateVideoFallbackHTML(
						index,
						mediaData.videos.length,
						customTitle,
					);
				}

				const title = customTitle || video.title || `Video ${index}`;
				let containerClasses = "video-embed";
				let iframeClasses = "";

				if (classString) {
					const classArray = classString
						.split(/\s+/)
						.filter((c: string) => c.length > 0);
					const validation =
						this.classSuggestionEngine.validateClasses(classArray);

					if (validation.invalid.length > 0) {
						console.warn(
							`Invalid Tailwind classes found in video:${index}:`,
							validation.invalid,
						);
					}

					if (validation.valid.length > 0) {
						containerClasses += ` ${validation.valid.join(" ")}`;
						iframeClasses = ` class="${validation.valid.join(" ")}"`;
					}
				}

				// Generate video embed HTML based on type
				switch (video.type) {
					case "youtube": {
						const youtubeId = this.extractYouTubeId(video.url);
						if (youtubeId) {
							return `<div class="${containerClasses} youtube-embed">
                <iframe 
                  src="https://www.youtube.com/embed/${youtubeId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen${iframeClasses}>
                </iframe>
              </div>`;
						}
						// Fall back with helpful message for malformed YouTube URLs
						return this.generateVideoUrlFallback(video.url, title, "YouTube");
					}
					case "vimeo": {
						const vimeoId = this.extractVimeoId(video.url);
						if (vimeoId) {
							return `<div class="${containerClasses} vimeo-embed">
                <iframe 
                  src="https://player.vimeo.com/video/${vimeoId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowfullscreen${iframeClasses}>
                </iframe>
              </div>`;
						}
						// Fall back with helpful message for malformed Vimeo URLs
						return this.generateVideoUrlFallback(video.url, title, "Vimeo");
					}
					default:
						// For unknown video types, provide helpful fallback
						return this.generateVideoTypeFallback(video.url, title, video.type);
				}
			},
		);

		// Process link embeds with Tailwind CSS support
		processedContent = processedContent.replace(
			EMBED_PATTERNS.LINK,
			(_match, indexStr, customText, classString) => {
				const index = parseInt(indexStr, 10);
				const link = resolutionMap.links.get(index);

				if (!link) {
					return this.generateLinkFallbackHTML(
						index,
						mediaData.externalLinks.length,
						customText,
					);
				}

				const linkText = customText || link.title || `Link ${index}`;
				let classes = "text-blue-500 hover:underline"; // Default link styling

				if (classString) {
					const classArray = classString
						.split(/\s+/)
						.filter((c: string) => c.length > 0);
					const validation =
						this.classSuggestionEngine.validateClasses(classArray);

					if (validation.invalid.length > 0) {
						console.warn(
							`Invalid Tailwind classes found in link:${index}:`,
							validation.invalid,
						);
					}

					if (validation.valid.length > 0) {
						classes = validation.valid.join(" ");
					}
				}

				return `<a href="${link.url}" class="${classes}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
			},
		);

		// Process and sanitize iframe embeds
		processedContent = processedContent.replace(
			EMBED_PATTERNS.IFRAME,
			(match) => {
				return this.sanitizeAndValidateIframe(match);
			},
		);

		processedContent = this.transformBookmarkTags(processedContent);
		return processedContent;
	}

	resolveEmbedReferences(content: string, mediaData: MediaData): string {
		let processedContent = content;

		// Create resolution map for efficient lookups
		const resolutionMap = this.createEmbedResolutionMap(mediaData);

		// Process image embeds - return markdown format
		processedContent = processedContent.replace(
			EMBED_PATTERNS.IMAGE,
			(_match, indexStr, altText) => {
				const index = parseInt(indexStr, 10);
				const imageUrl = resolutionMap.images.get(index);

				if (!imageUrl) {
					return this.generateImageFallback(
						index,
						mediaData.images.length,
						altText,
					);
				}

				const alt = altText || `Image ${index}`;

				// For markdown format, ignore Tailwind classes and return standard markdown
				return `![${alt}](${imageUrl})`;
			},
		);

		// Process video embeds - return HTML format (videos need HTML for embedding)
		processedContent = processedContent.replace(
			EMBED_PATTERNS.VIDEO,
			(_match, indexStr, customTitle, classString) => {
				const index = parseInt(indexStr, 10);
				const video = resolutionMap.videos.get(index);

				if (!video) {
					return this.generateVideoFallbackHTML(
						index,
						mediaData.videos.length,
						customTitle,
					);
				}

				const title = customTitle || video.title || `Video ${index}`;
				let containerClasses = "video-embed";
				let iframeClasses = "";

				if (classString) {
					const classArray = classString
						.split(/\s+/)
						.filter((c: string) => c.length > 0);
					const validation =
						this.classSuggestionEngine.validateClasses(classArray);

					if (validation.invalid.length > 0) {
						console.warn(
							`Invalid Tailwind classes found in video:${index}:`,
							validation.invalid,
						);
					}

					if (validation.valid.length > 0) {
						containerClasses += ` ${validation.valid.join(" ")}`;
						iframeClasses = ` class="${validation.valid.join(" ")}"`;
					}
				}

				// Generate video embed HTML based on type
				switch (video.type) {
					case "youtube": {
						const youtubeId = this.extractYouTubeId(video.url);
						if (youtubeId) {
							return `<div class="${containerClasses} youtube-embed">
                <iframe 
                  src="https://www.youtube.com/embed/${youtubeId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen${iframeClasses}>
                </iframe>
              </div>`;
						}
						// Fall back with helpful message for malformed YouTube URLs
						return this.generateVideoUrlFallback(video.url, title, "YouTube");
					}
					case "vimeo": {
						const vimeoId = this.extractVimeoId(video.url);
						if (vimeoId) {
							return `<div class="${containerClasses} vimeo-embed">
                <iframe 
                  src="https://player.vimeo.com/video/${vimeoId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowfullscreen${iframeClasses}>
                </iframe>
              </div>`;
						}
						// Fall back with helpful message for malformed Vimeo URLs
						return this.generateVideoUrlFallback(video.url, title, "Vimeo");
					}
					default:
						// For unknown video types, provide helpful fallback
						return this.generateVideoTypeFallback(video.url, title, video.type);
				}
			},
		);

		// Process link embeds - return markdown format
		processedContent = processedContent.replace(
			EMBED_PATTERNS.LINK,
			(_match, indexStr, customText) => {
				const index = parseInt(indexStr, 10);
				const link = resolutionMap.links.get(index);

				if (!link) {
					return this.generateLinkFallback(
						index,
						mediaData.externalLinks.length,
						customText,
					);
				}

				const linkText = customText || link.title || `Link ${index}`;

				// For markdown format, ignore Tailwind classes and return standard markdown
				return `[${linkText}](${link.url})`;
			},
		);

		// Process and sanitize iframe embeds
		processedContent = processedContent.replace(
			EMBED_PATTERNS.IFRAME,
			(match) => {
				return this.sanitizeAndValidateIframe(match);
			},
		);

		processedContent = this.transformBookmarkTags(processedContent);
		return processedContent;
	}

	validateEmbedSyntax(content: string, mediaData: MediaData): ValidationResult {
		const errors: EmbedError[] = [];
		const lines = content.split("\n");

		// Handle null or undefined media data gracefully
		if (!mediaData) {
			return {
				isValid: true,
				errors: [],
				warnings: [],
			};
		}

		// Extract all embed references for validation
		const embedRefs = this.extractEmbedReferences(content);

		embedRefs.forEach((ref) => {
			const { type, index, cssClasses } = ref;
			let isValid = false;
			let maxIndex = 0;

			// Validate index for non-iframe embeds
			if (type !== "iframe") {
				switch (type) {
					case "image":
						maxIndex = mediaData?.images?.length || 0;
						isValid = this.mediaResolver.validateIndex(index, maxIndex);
						break;
					case "video":
						maxIndex = mediaData?.videos?.length || 0;
						isValid = this.mediaResolver.validateIndex(index, maxIndex);
						break;
					case "link":
						maxIndex = mediaData?.externalLinks?.length || 0;
						isValid = this.mediaResolver.validateIndex(index, maxIndex);
						break;
				}

				if (!isValid) {
					// Find line number for error reporting
					const lineNumber = this.findLineNumber(content, ref, lines);

					const suggestion = this.generateDetailedIndexSuggestion(
						index,
						maxIndex,
						type,
					);
					errors.push({
						type: "INVALID_INDEX",
						line: lineNumber,
						column: 0, // Could be enhanced to find exact column
						message: `Invalid ${type} index ${index}. Available indices: 0-${maxIndex - 1}`,
						suggestion,
						severity: "error",
						embedType: type as "image" | "video" | "link" | "iframe",
						embedIndex: index,
					});
				}
			}

			// Validate Tailwind CSS classes if present
			if (cssClasses) {
				const classArray = cssClasses
					.split(/\s+/)
					.filter((c: string) => c.length > 0);
				const validation =
					this.classSuggestionEngine.validateClasses(classArray);

				if (validation.invalid.length > 0) {
					const lineNumber = this.findLineNumber(content, ref, lines);

					validation.invalid.forEach((invalidClass) => {
						const classSuggestions =
							this.classSuggestionEngine.suggestAlternatives(invalidClass);
						errors.push({
							type: "CLASS_VALIDATION",
							line: lineNumber,
							column: 0,
							message: `Invalid Tailwind CSS class: "${invalidClass}" in ${type} embed`,
							suggestion:
								classSuggestions.length > 0
									? `Try: ${classSuggestions.slice(0, 3).join(", ")}`
									: `Use valid Tailwind CSS classes for ${type} embeds`,
							severity: "warning",
							embedType: type as "image" | "video" | "link" | "iframe",
							embedIndex: index,
						});
					});
				}
			}
		});

		// Validate iframe syntax
		const iframes = content.match(EMBED_PATTERNS.IFRAME);
		if (iframes) {
			iframes.forEach((iframe) => {
				if (!this.validateIframeSyntax(iframe)) {
					const lineNumber = this.findIframeLineNumber(content, iframe, lines);
					errors.push({
						type: "MALFORMED_SYNTAX",
						line: lineNumber,
						column: 0,
						message: "Malformed iframe syntax",
						suggestion:
							"Ensure iframe has proper opening and closing tags with valid src attribute",
						severity: "error",
						embedType: "iframe",
					});
				}
			});
		}

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	extractEmbedReferences(content: string): EmbedReference[] {
		const references: EmbedReference[] = [];

		// Extract image references with Tailwind CSS classes
		const imagePattern = new RegExp(EMBED_PATTERNS.IMAGE.source, "g");
		for (const m of content.matchAll(imagePattern)) {
			references.push({
				type: "image",
				index: parseInt(m[1] as string, 10),
				altText: m[2] as string | undefined,
				cssClasses: m[3] as string | undefined,
				originalMatch: m[0] as string,
				startPos: (m.index as number) || 0,
				endPos: ((m.index as number) || 0) + (m[0]?.length || 0),
			});
		}

		// Extract video references with Tailwind CSS classes
		const videoPattern = new RegExp(EMBED_PATTERNS.VIDEO.source, "g");
		for (const m of content.matchAll(videoPattern)) {
			references.push({
				type: "video",
				index: parseInt(m[1] as string, 10),
				customText: m[2] as string | undefined,
				cssClasses: m[3] as string | undefined,
				originalMatch: m[0] as string,
				startPos: (m.index as number) || 0,
				endPos: ((m.index as number) || 0) + (m[0]?.length || 0),
			});
		}

		// Extract link references with Tailwind CSS classes
		const linkPattern = new RegExp(EMBED_PATTERNS.LINK.source, "g");
		for (const m of content.matchAll(linkPattern)) {
			references.push({
				type: "link",
				index: parseInt(m[1] as string, 10),
				customText: m[2] as string | undefined,
				cssClasses: m[3] as string | undefined,
				originalMatch: m[0] as string,
				startPos: (m.index as number) || 0,
				endPos: ((m.index as number) || 0) + (m[0]?.length || 0),
			});
		}

		// Extract iframe references
		const iframePattern = new RegExp(EMBED_PATTERNS.IFRAME.source, "gi");
		for (const m of content.matchAll(iframePattern)) {
			try {
				const parsed = this.embedSyntaxParser.parseIframeEmbed(m[0] as string);
				references.push({
					type: "iframe",
					index: -1, // iframes don't use index-based resolution
					cssClasses: parsed.classes?.join(" "),
					originalMatch: m[0] as string,
					startPos: (m.index as number) || 0,
					endPos: ((m.index as number) || 0) + (m[0]?.length || 0),
				});
			} catch {
				// Skip malformed iframes
				console.warn("Malformed iframe found:", m[0]);
			}
		}

		return references;
	}

	createEmbedResolutionMap(mediaData: MediaData): EmbedResolutionMap {
		const images = new Map<number, string>();
		const videos = new Map<number, MediaEmbed>();
		const links = new Map<number, ExternalLink>();

		// Map images by index
		mediaData.images.forEach((image, index) => {
			images.set(index, image);
		});

		// Map videos by index
		mediaData.videos.forEach((video, index) => {
			videos.set(index, video);
		});

		// Map links by index
		mediaData.externalLinks.forEach((link, index) => {
			links.set(index, link);
		});

		return { images, videos, links };
	}

	validateTailwindClasses(classes: string[]): {
		valid: string[];
		invalid: string[];
		suggestions: string[];
	} {
		return this.classSuggestionEngine.validateClasses(classes);
	}

	// Enhanced fallback content generation methods
	private generateImageFallback(
		index: number,
		_totalImages: number,
		altText?: string,
	): string {
		const fallbackAlt = altText || `Image ${index}`;
		return `![Image not found: index ${index}](# "${fallbackAlt}")`;
	}

	private generateLinkFallback(
		index: number,
		_totalLinks: number,
		customText?: string,
	): string {
		const fallbackText = customText || `Link ${index}`;
		return `[Link not found: index ${index}](# "${fallbackText}")`;
	}

	// HTML fallback methods for MarkdownRenderer
	private generateImageFallbackHTML(
		index: number,
		totalImages: number,
		altText?: string,
	): string {
		const suggestions = this.generateIndexSuggestions(
			index,
			totalImages,
			"画像",
		);
		const fallbackAlt = altText || `画像 ${index}`;

		return `<div class="embed-fallback bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-gray-600 my-4">
      <div class="text-lg mb-1">🖼️</div>
      <div class="font-medium text-gray-700 text-sm">画像が見つかりません</div>
      <div class="text-xs text-gray-500 mt-1">インデックス ${index} (${fallbackAlt})</div>
      ${suggestions ? `<div class="text-xs text-blue-600 mt-2">${suggestions}</div>` : ""}
    </div>`;
	}

	private generateVideoFallbackHTML(
		index: number,
		totalVideos: number,
		title?: string,
	): string {
		const suggestions = this.generateIndexSuggestions(
			index,
			totalVideos,
			"動画",
		);
		const fallbackTitle = title || `動画 ${index}`;

		return `<div class="embed-fallback bg-gray-50 border border-gray-200 rounded-lg p-3 text-center text-gray-600 my-4">
      <div class="text-lg mb-1">🎥</div>
      <div class="font-medium text-gray-700 text-sm">動画が見つかりません</div>
      <div class="text-xs text-gray-500 mt-1">インデックス ${index} (${fallbackTitle})</div>
      ${suggestions ? `<div class="text-xs text-blue-600 mt-2">${suggestions}</div>` : ""}
    </div>`;
	}

	private generateLinkFallbackHTML(
		index: number,
		totalLinks: number,
		customText?: string,
	): string {
		const suggestions = this.generateIndexSuggestions(
			index,
			totalLinks,
			"リンク",
		);
		const fallbackText = customText || `リンク ${index}`;

		return `<span class="embed-fallback inline-block bg-red-50 border border-red-200 rounded px-2 py-1 text-red-700 text-sm">
      <span class="mr-1">🔗</span>
      <span class="font-medium">リンクが見つかりません:</span>
      <span class="ml-1">インデックス ${index} (${fallbackText})</span>
      ${suggestions ? `<span class="block text-xs text-blue-600 mt-1">${suggestions}</span>` : ""}
    </span>`;
	}

	private generateIndexSuggestions(
		index: number,
		totalItems: number,
		type: string,
	): string | null {
		if (totalItems === 0) {
			return `${type}データがありません。まず${type}を追加してください。`;
		}

		if (index >= totalItems) {
			return `インデックス 0-${totalItems - 1} を使用してください。利用可能な${type}: ${totalItems}個`;
		}

		if (index < 0) {
			return `インデックスは0以上である必要があります。利用可能な${type}: 0-${totalItems - 1}`;
		}

		return null;
	}

	private generateDetailedIndexSuggestion(
		index: number,
		maxIndex: number,
		type: string,
	): string {
		if (maxIndex === 0) {
			return `No ${type} data available. Add ${type}s to your content first.`;
		}

		if (index >= maxIndex) {
			return `Index ${index} is too high. Available ${type} indices: 0-${maxIndex - 1} (${maxIndex} total)`;
		}

		if (index < 0) {
			return `Index must be 0 or greater. Available ${type} indices: 0-${maxIndex - 1}`;
		}

		return `Use index between 0 and ${maxIndex - 1}`;
	}

	private generateIframeFallback(src: string, reason: string): string {
		const allowedDomains = [
			"youtube.com",
			"www.youtube.com",
			"player.vimeo.com",
			"codepen.io",
			"codesandbox.io",
			"jsfiddle.net",
			"stackblitz.com",
			"replit.com",
			"github.com",
			"gist.github.com",
		];

		let suggestion = "Use a supported domain for iframe embeds.";

		if (src) {
			try {
				const url = new URL(src);
				const hostname = url.hostname.toLowerCase();

				if (!url.protocol.startsWith("https")) {
					suggestion = "Use HTTPS URLs for iframe embeds.";
				} else {
					suggestion = `Domain "${hostname}" is not allowed. Supported domains: ${allowedDomains.slice(0, 3).join(", ")}, etc.`;
				}
			} catch {
				suggestion = "Provide a valid URL for iframe src attribute.";
			}
		}

		return `<div class="embed-fallback bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center text-yellow-800">
      <div class="text-lg mb-2">⚠️</div>
      <div class="font-medium text-yellow-900">Iframe blocked</div>
      <div class="text-sm text-yellow-700 mt-1">${reason}</div>
      <div class="text-xs text-blue-600 mt-2">${suggestion}</div>
      <div class="text-xs text-gray-600 mt-1">Allowed: ${allowedDomains.slice(0, 3).join(", ")}, etc.</div>
    </div>`;
	}

	private generateVideoUrlFallback(
		url: string,
		title: string,
		platform: string,
	): string {
		return `<div class="embed-fallback bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
      <div class="flex items-center mb-2">
        <span class="text-lg mr-2">🎥</span>
        <span class="font-medium">Video embed failed</span>
      </div>
      <div class="text-sm mb-2">${platform} URL could not be processed</div>
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="inline-block bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
        ${title} →
      </a>
      <div class="text-xs text-blue-600 mt-2">
        Check that the ${platform} URL is valid and publicly accessible
      </div>
    </div>`;
	}

	private generateVideoTypeFallback(
		url: string,
		title: string,
		type: string,
	): string {
		return `<div class="embed-fallback bg-purple-50 border border-purple-200 rounded-lg p-3 text-purple-800">
      <div class="flex items-center mb-2">
        <span class="text-lg mr-2">🎬</span>
        <span class="font-medium">Unsupported video type</span>
      </div>
      <div class="text-sm mb-2">Video type "${type}" is not supported for embedding</div>
      <a href="${url}" target="_blank" rel="noopener noreferrer" 
         class="inline-block bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition-colors">
        ${title} →
      </a>
      <div class="text-xs text-purple-600 mt-2">
        Supported types: youtube, vimeo. Use iframe for other video platforms.
      </div>
    </div>`;
	}

	generateValidationFeedback(errors: EmbedError[]): string {
		if (errors.length === 0) {
			return '<div class="validation-success text-green-600 text-sm">✅ All embeds are valid</div>';
		}

		// Group errors by type for potential future use
		errors.reduce(
			(acc, error) => {
				if (!acc[error.type]) acc[error.type] = [];
				acc[error.type].push(error);
				return acc;
			},
			{} as Record<string, EmbedError[]>,
		);

		let feedback = '<div class="validation-feedback space-y-2">';

		// Group errors by severity
		const criticalErrors = errors.filter((e) => e.severity === "error");
		const warnings = errors.filter((e) => e.severity === "warning");

		if (criticalErrors.length > 0) {
			feedback += `<div class="validation-errors">
        <div class="text-red-600 font-medium text-sm mb-1">❌ ${criticalErrors.length} Error${criticalErrors.length > 1 ? "s" : ""}</div>
        <ul class="text-red-600 text-xs space-y-1 ml-4">`;

			criticalErrors.forEach((error) => {
				feedback += `<li>Line ${error.line}: ${error.message}`;
				if (error.suggestion) {
					feedback += ` <span class="text-blue-600">(${error.suggestion})</span>`;
				}
				feedback += "</li>";
			});

			feedback += "</ul></div>";
		}

		if (warnings.length > 0) {
			feedback += `<div class="validation-warnings">
        <div class="text-yellow-600 font-medium text-sm mb-1">⚠️ ${warnings.length} Warning${warnings.length > 1 ? "s" : ""}</div>
        <ul class="text-yellow-600 text-xs space-y-1 ml-4">`;

			warnings.forEach((error) => {
				feedback += `<li>Line ${error.line}: ${error.message}`;
				if (error.suggestion) {
					feedback += ` <span class="text-blue-600">(${error.suggestion})</span>`;
				}
				feedback += "</li>";
			});

			feedback += "</ul></div>";
		}

		feedback += "</div>";
		return feedback;
	}

	private transformBookmarkTags(content: string): string {
		const bookmarkPattern = /<Bookmark\b([^>]*)>([\s\S]*?)<\/Bookmark>/gi;
		let lastIndex = 0;
		let result = "";
		let match: RegExpExecArray | null = bookmarkPattern.exec(content);

		while (match) {
			const [fullMatch, rawAttributes = "", body = ""] = match;
			result += content.slice(lastIndex, match.index);

			const attributes: Record<string, string> = {};
			const attributePattern = /(\w+)=(?:"([^"]*)"|'([^']*)')/g;
			let attributeMatch: RegExpExecArray | null =
				attributePattern.exec(rawAttributes);
			while (attributeMatch) {
				const [, name, valueDouble, valueSingle] = attributeMatch;
				attributes[name] = (valueDouble ?? valueSingle ?? "").trim();
				attributeMatch = attributePattern.exec(rawAttributes);
			}

			const url = (attributes.url || "").trim();
			const textBody = this.stripHtml(body).trim();
			const titleCandidate = attributes.title || textBody || url;
			const descriptionCandidate = attributes.description || textBody || "";
			const payload = {
				title: titleCandidate.trim() || undefined,
				description: descriptionCandidate.trim() || undefined,
				url: url || undefined,
				image: attributes.image?.trim() || undefined,
			};

			if (!payload.url && !payload.title && !payload.description) {
				result += "";
			} else {
				try {
					const encoded = encodeURIComponent(JSON.stringify(payload));
					result += `<bookmark-card data-json="${encoded}"></bookmark-card>`;
				} catch (error) {
					console.warn("Failed to serialize bookmark payload", payload, error);
				}
			}

			lastIndex = match.index + fullMatch.length;
			match = bookmarkPattern.exec(content);
		}

		result += content.slice(lastIndex);
		return result;
	}

	private stripHtml(value: string): string {
		return value.replace(/<[^>]*>/g, "");
	}

	// Helper methods for video URL processing
	private extractYouTubeId(url: string): string | null {
		const patterns = [
			/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
			/youtube\.com\/shorts\/([^&\n?#]+)/,
		];

		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) {
				return match[1];
			}
		}

		return null;
	}

	private extractVimeoId(url: string): string | null {
		const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
		return match ? match[1] : null;
	}

	// Helper methods for error reporting
	private findLineNumber(
		_content: string,
		ref: EmbedReference,
		lines: string[],
	): number {
		const searchStr = `${ref.type}:${ref.index}`;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes(searchStr)) {
				return i + 1; // Line numbers are 1-based
			}
		}

		return 1; // Default to line 1 if not found
	}

	private findIframeLineNumber(
		_content: string,
		_iframe: string,
		lines: string[],
	): number {
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].includes("<iframe")) {
				return i + 1;
			}
		}
		return 1;
	}

	private validateIframeSyntax(iframe: string): boolean {
		// Basic iframe validation
		return iframe.includes("<iframe") && iframe.includes("</iframe>");
	}

	sanitizeIframeContent(iframeHtml: string): string {
		return this.sanitizeAndValidateIframe(iframeHtml);
	}

	sanitizeAndValidateIframe(iframeHtml: string): string {
		try {
			const parsed = this.embedSyntaxParser.parseIframeEmbed(iframeHtml);

			// Validate and sanitize the src URL
			const sanitizedSrc = this.sanitizeIframeSrc(parsed.src);
			if (!sanitizedSrc) {
				return this.generateIframeFallback(
					parsed.src,
					"Unsafe iframe source blocked",
				);
			}

			// Validate Tailwind CSS classes
			let validatedClasses = "";
			if (parsed.classes && parsed.classes.length > 0) {
				const validation = this.classSuggestionEngine.validateClasses(
					parsed.classes,
				);

				if (validation.invalid.length > 0) {
					console.warn(
						`Invalid Tailwind classes found in iframe:`,
						validation.invalid,
					);
				}

				if (validation.valid.length > 0) {
					validatedClasses = ` class="${validation.valid.join(" ")}"`;
				}
			}

			// Build sanitized iframe with security attributes
			const title = parsed.title ? ` title="${parsed.title}"` : "";
			const width = parsed.attributes.width || "100%";
			const height = parsed.attributes.height || "400";

			return `<iframe src="${sanitizedSrc}"${title} width="${width}" height="${height}" frameborder="0" loading="lazy"${validatedClasses}></iframe>`;
		} catch (error) {
			console.error("Error sanitizing iframe:", error);
			return this.generateIframeFallback("", "Invalid iframe syntax");
		}
	}

	private sanitizeIframeSrc(src: string): string | null {
		// List of allowed domains for iframe embeds
		const allowedDomains = [
			"youtube.com",
			"www.youtube.com",
			"player.vimeo.com",
			"codepen.io",
			"codesandbox.io",
			"jsfiddle.net",
			"stackblitz.com",
			"replit.com",
			"github.com",
			"gist.github.com",
		];

		try {
			const url = new URL(src);
			const hostname = url.hostname.toLowerCase();

			// Check if the domain is in the allowed list
			const isAllowed = allowedDomains.some(
				(domain) => hostname === domain || hostname.endsWith(`.${domain}`),
			);

			if (!isAllowed) {
				console.warn(`Blocked iframe from unauthorized domain: ${hostname}`);
				return null;
			}

			// Ensure HTTPS for security
			if (url.protocol !== "https:") {
				url.protocol = "https:";
			}

			return url.toString();
		} catch (error) {
			console.error("Invalid iframe URL:", src, error);
			return null;
		}
	}
}

// Factory function to create content parser instance
export const createContentParser = (
	mediaResolver?: MediaResolverService,
): ContentParserService => {
	return new ContentParser(mediaResolver);
};

// Default export
export default ContentParser;
