/**
 * Content Parser Service for Markdown Embed Resolution
 * Implements embed resolution for image, video, and link index references
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

// Embed syntax patterns for parsing
const EMBED_PATTERNS = {
  IMAGE: /!\[image:(\d+)(?:\s+"([^"]*)")?\]/g,
  VIDEO: /!\[video:(\d+)(?:\s+"([^"]*)")?\]/g,
  LINK: /\[link:(\d+)(?:\s+"([^"]*)")?\]/g,
  IFRAME: /<iframe[^>]*>.*?<\/iframe>/gi,
} as const;

// Content parser service interface
export interface ContentParserService {
  parseMarkdown(content: string, mediaData: MediaData): Promise<string>;
  resolveEmbedReferences(content: string, mediaData: MediaData): string;
  validateEmbedSyntax(content: string, mediaData: MediaData): ValidationResult;
  extractEmbedReferences(content: string): EmbedReference[];
  createEmbedResolutionMap(mediaData: MediaData): EmbedResolutionMap;
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

// Implementation of content parser service
export class ContentParser implements ContentParserService {
  private mediaResolver: MediaResolverService;

  constructor(mediaResolver?: MediaResolverService) {
    this.mediaResolver = mediaResolver || new MediaResolver();
  }

  async parseMarkdown(content: string, mediaData: MediaData): Promise<string> {
    // First validate the content
    const validation = this.validateEmbedSyntax(content, mediaData);
    if (!validation.isValid) {
      console.warn("Embed validation errors found:", validation.errors);
    }

    // Resolve embed references
    return this.resolveEmbedReferences(content, mediaData);
  }

  resolveEmbedReferences(content: string, mediaData: MediaData): string {
    let processedContent = content;

    // Create resolution map for efficient lookups
    const resolutionMap = this.createEmbedResolutionMap(mediaData);

    // Process image embeds
    processedContent = processedContent.replace(
      EMBED_PATTERNS.IMAGE,
      (match, indexStr, altText) => {
        const index = parseInt(indexStr, 10);
        const imageUrl = resolutionMap.images.get(index);

        if (!imageUrl) {
          return `![Image not found: index ${index}]`;
        }

        const alt = altText || `Image ${index}`;
        return `![${alt}](${imageUrl})`;
      },
    );

    // Process video embeds
    processedContent = processedContent.replace(
      EMBED_PATTERNS.VIDEO,
      (match, indexStr, customTitle) => {
        const index = parseInt(indexStr, 10);
        const video = resolutionMap.videos.get(index);

        if (!video) {
          return `[Video not found: index ${index}]`;
        }

        const title = customTitle || video.title || `Video ${index}`;

        // Generate video embed HTML based on type
        switch (video.type) {
          case "youtube":
            const youtubeId = this.extractYouTubeId(video.url);
            if (youtubeId) {
              return `<div class="video-embed youtube-embed">
                <iframe 
                  src="https://www.youtube.com/embed/${youtubeId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>`;
            }
            // Fall back to link format for malformed YouTube URLs
            return `[${title}](${video.url})`;
          case "vimeo":
            const vimeoId = this.extractVimeoId(video.url);
            if (vimeoId) {
              return `<div class="video-embed vimeo-embed">
                <iframe 
                  src="https://player.vimeo.com/video/${vimeoId}" 
                  title="${title}"
                  frameborder="0" 
                  allow="autoplay; fullscreen; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>`;
            }
            // Fall back to link format for malformed Vimeo URLs
            return `[${title}](${video.url})`;
          default:
            // For unknown video types, fall back to simple link format
            return `[${title}](${video.url})`;
        }
      },
    );

    // Process link embeds
    processedContent = processedContent.replace(
      EMBED_PATTERNS.LINK,
      (match, indexStr, customText) => {
        const index = parseInt(indexStr, 10);
        const link = resolutionMap.links.get(index);

        if (!link) {
          return `[Link not found: index ${index}]`;
        }

        const linkText = customText || link.title || `Link ${index}`;
        return `[${linkText}](${link.url})`;
      },
    );

    // Preserve iframe embeds (no processing needed, just validation)
    const iframes = processedContent.match(EMBED_PATTERNS.IFRAME);
    if (iframes) {
      // Log iframe usage for security monitoring
      console.log(`Found ${iframes.length} iframe embeds in content`);
    }

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
      const { type, index } = ref;
      let isValid = false;
      let maxIndex = 0;

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

        errors.push({
          type: "INVALID_INDEX",
          line: lineNumber,
          column: 0, // Could be enhanced to find exact column
          message: `Invalid ${type} index ${index}. Available indices: 0-${maxIndex - 1}`,
          suggestion:
            maxIndex > 0
              ? `Use index between 0 and ${maxIndex - 1}`
              : `No ${type} data available`,
        });
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
            suggestion: "Ensure iframe has proper opening and closing tags",
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

    // Extract image references
    let match;
    const imagePattern = new RegExp(EMBED_PATTERNS.IMAGE.source, "g");
    while ((match = imagePattern.exec(content)) !== null) {
      references.push({
        type: "image",
        index: parseInt(match[1], 10),
        altText: match[2],
      });
    }

    // Extract video references
    const videoPattern = new RegExp(EMBED_PATTERNS.VIDEO.source, "g");
    while ((match = videoPattern.exec(content)) !== null) {
      references.push({
        type: "video",
        index: parseInt(match[1], 10),
        customText: match[2],
      });
    }

    // Extract link references
    const linkPattern = new RegExp(EMBED_PATTERNS.LINK.source, "g");
    while ((match = linkPattern.exec(content)) !== null) {
      references.push({
        type: "link",
        index: parseInt(match[1], 10),
        customText: match[2],
      });
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
    content: string,
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
    content: string,
    iframe: string,
    lines: string[],
  ): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("<iframe")) {
        return i + 1;
      }
    }
    return 1;
  }

  private getPatternForType(type: string): RegExp {
    switch (type) {
      case "image":
        return EMBED_PATTERNS.IMAGE;
      case "video":
        return EMBED_PATTERNS.VIDEO;
      case "link":
        return EMBED_PATTERNS.LINK;
      default:
        return /./;
    }
  }

  private validateIframeSyntax(iframe: string): boolean {
    // Basic iframe validation
    return iframe.includes("<iframe") && iframe.includes("</iframe>");
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
