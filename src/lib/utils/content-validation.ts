// Content validation utilities
import {
  ContentItem,
  ContentType,
  MediaEmbed,
  ExternalLink,
  DownloadInfo,
  SEOData,
} from '@/types/content';

export interface ContentValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
}

/**
 * Validates a ContentItem object against the required schema
 * @param content The ContentItem to validate
 * @returns Validation result with errors if any
 */
export function validateContentItem(content: Partial<ContentItem>): ContentValidationResult {
  const errors: Record<string, string[]> = {};

  // Required fields
  if (!content.id) {
    addError(errors, 'id', 'ID is required');
  } else if (typeof content.id !== 'string') {
    addError(errors, 'id', 'ID must be a string');
  }

  if (!content.type) {
    addError(errors, 'type', 'Content type is required');
  } else if (!isValidContentType(content.type)) {
    addError(errors, 'type', `Invalid content type: ${content.type}`);
  }

  if (!content.title) {
    addError(errors, 'title', 'Title is required');
  } else if (typeof content.title !== 'string') {
    addError(errors, 'title', 'Title must be a string');
  }

  if (!content.description) {
    addError(errors, 'description', 'Description is required');
  } else if (typeof content.description !== 'string') {
    addError(errors, 'description', 'Description must be a string');
  }

  if (!content.category) {
    addError(errors, 'category', 'Category is required');
  } else if (typeof content.category !== 'string') {
    addError(errors, 'category', 'Category must be a string');
  }

  // Tags validation
  if (content.tags) {
    if (!Array.isArray(content.tags)) {
      addError(errors, 'tags', 'Tags must be an array of strings');
    } else {
      const invalidTags = content.tags.filter(tag => typeof tag !== 'string');
      if (invalidTags.length > 0) {
        addError(errors, 'tags', 'All tags must be strings');
      }
    }
  } else {
    // Default to empty array if missing
    content.tags = [];
  }

  // Status validation
  if (!content.status) {
    addError(errors, 'status', 'Status is required');
  } else if (!['published', 'draft', 'archived', 'scheduled'].includes(content.status)) {
    addError(errors, 'status', `Invalid status: ${content.status}`);
  }

  // Priority validation
  if (content.priority === undefined) {
    addError(errors, 'priority', 'Priority is required');
  } else if (
    typeof content.priority !== 'number' ||
    content.priority < 0 ||
    content.priority > 100
  ) {
    addError(errors, 'priority', 'Priority must be a number between 0 and 100');
  }

  // Timestamp validation
  if (!content.createdAt) {
    addError(errors, 'createdAt', 'Creation timestamp is required');
  } else if (!isValidISODate(content.createdAt)) {
    addError(errors, 'createdAt', 'Creation timestamp must be a valid ISO 8601 date string');
  }

  if (content.updatedAt && !isValidISODate(content.updatedAt)) {
    addError(errors, 'updatedAt', 'Update timestamp must be a valid ISO 8601 date string');
  }

  if (content.publishedAt && !isValidISODate(content.publishedAt)) {
    addError(errors, 'publishedAt', 'Publish timestamp must be a valid ISO 8601 date string');
  }

  // Optional field validations
  if (content.thumbnail && typeof content.thumbnail !== 'string') {
    addError(errors, 'thumbnail', 'Thumbnail must be a string URL');
  }

  if (content.images) {
    if (!Array.isArray(content.images)) {
      addError(errors, 'images', 'Images must be an array of strings');
    } else {
      const invalidImages = content.images.filter(img => typeof img !== 'string');
      if (invalidImages.length > 0) {
        addError(errors, 'images', 'All images must be string URLs');
      }
    }
  }

  // Validate videos
  if (content.videos) {
    if (!Array.isArray(content.videos)) {
      addError(errors, 'videos', 'Videos must be an array');
    } else {
      content.videos.forEach((video, index) => {
        const videoErrors = validateMediaEmbed(video);
        if (videoErrors.length > 0) {
          videoErrors.forEach(err => {
            addError(errors, `videos[${index}]`, err);
          });
        }
      });
    }
  }

  // Validate external links
  if (content.externalLinks) {
    if (!Array.isArray(content.externalLinks)) {
      addError(errors, 'externalLinks', 'External links must be an array');
    } else {
      content.externalLinks.forEach((link, index) => {
        const linkErrors = validateExternalLink(link);
        if (linkErrors.length > 0) {
          linkErrors.forEach(err => {
            addError(errors, `externalLinks[${index}]`, err);
          });
        }
      });
    }
  }

  // Validate download info
  if (content.downloadInfo) {
    const downloadErrors = validateDownloadInfo(content.downloadInfo);
    if (downloadErrors.length > 0) {
      downloadErrors.forEach(err => {
        addError(errors, 'downloadInfo', err);
      });
    }
  }

  // Validate content and contentPath
  if (content.content && typeof content.content !== 'string') {
    addError(errors, 'content', 'Content must be a string');
  }

  if (content.contentPath && typeof content.contentPath !== 'string') {
    addError(errors, 'contentPath', 'Content path must be a string');
  }

  // Validate SEO data
  if (content.seo) {
    const seoErrors = validateSEOData(content.seo);
    if (seoErrors.length > 0) {
      seoErrors.forEach(err => {
        addError(errors, 'seo', err);
      });
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates a MediaEmbed object
 * @param media The MediaEmbed to validate
 * @returns Array of error messages
 */
function validateMediaEmbed(media: Partial<MediaEmbed>): string[] {
  const errors: string[] = [];

  if (!media.type) {
    errors.push('Media type is required');
  } else if (!['youtube', 'vimeo', 'code', 'social', 'iframe'].includes(media.type)) {
    errors.push(`Invalid media type: ${media.type}`);
  }

  if (!media.url) {
    errors.push('Media URL is required');
  } else if (typeof media.url !== 'string') {
    errors.push('Media URL must be a string');
  }

  if (media.title && typeof media.title !== 'string') {
    errors.push('Media title must be a string');
  }

  if (media.description && typeof media.description !== 'string') {
    errors.push('Media description must be a string');
  }

  if (media.thumbnail && typeof media.thumbnail !== 'string') {
    errors.push('Media thumbnail must be a string URL');
  }

  if (media.duration !== undefined && (typeof media.duration !== 'number' || media.duration < 0)) {
    errors.push('Media duration must be a positive number');
  }

  if (media.width !== undefined && (typeof media.width !== 'number' || media.width <= 0)) {
    errors.push('Media width must be a positive number');
  }

  if (media.height !== undefined && (typeof media.height !== 'number' || media.height <= 0)) {
    errors.push('Media height must be a positive number');
  }

  return errors;
}

/**
 * Validates an ExternalLink object
 * @param link The ExternalLink to validate
 * @returns Array of error messages
 */
function validateExternalLink(link: Partial<ExternalLink>): string[] {
  const errors: string[] = [];

  if (!link.type) {
    errors.push('Link type is required');
  } else if (!['github', 'demo', 'booth', 'website', 'other'].includes(link.type)) {
    errors.push(`Invalid link type: ${link.type}`);
  }

  if (!link.url) {
    errors.push('Link URL is required');
  } else if (typeof link.url !== 'string') {
    errors.push('Link URL must be a string');
  } else {
    try {
      new URL(link.url);
    } catch {
      errors.push('Link URL must be a valid URL');
    }
  }

  if (!link.title) {
    errors.push('Link title is required');
  } else if (typeof link.title !== 'string') {
    errors.push('Link title must be a string');
  }

  if (link.description && typeof link.description !== 'string') {
    errors.push('Link description must be a string');
  }

  return errors;
}

/**
 * Validates a DownloadInfo object
 * @param info The DownloadInfo to validate
 * @returns Array of error messages
 */
function validateDownloadInfo(info: Partial<DownloadInfo>): string[] {
  const errors: string[] = [];

  if (!info.fileName) {
    errors.push('File name is required');
  } else if (typeof info.fileName !== 'string') {
    errors.push('File name must be a string');
  }

  if (info.fileSize === undefined) {
    errors.push('File size is required');
  } else if (typeof info.fileSize !== 'number' || info.fileSize < 0) {
    errors.push('File size must be a positive number');
  }

  if (!info.fileType) {
    errors.push('File type is required');
  } else if (typeof info.fileType !== 'string') {
    errors.push('File type must be a string');
  }

  if (info.price !== undefined && (typeof info.price !== 'number' || info.price < 0)) {
    errors.push('Price must be a positive number');
  }

  if (info.version && typeof info.version !== 'string') {
    errors.push('Version must be a string');
  }

  if (info.downloadCount === undefined) {
    errors.push('Download count is required');
  } else if (typeof info.downloadCount !== 'number' || info.downloadCount < 0) {
    errors.push('Download count must be a non-negative number');
  }

  if (info.lastDownloaded && !isValidISODate(info.lastDownloaded)) {
    errors.push('Last downloaded timestamp must be a valid ISO 8601 date string');
  }

  return errors;
}

/**
 * Validates an SEOData object
 * @param seo The SEOData to validate
 * @returns Array of error messages
 */
function validateSEOData(seo: Partial<SEOData>): string[] {
  const errors: string[] = [];

  if (seo.title && typeof seo.title !== 'string') {
    errors.push('SEO title must be a string');
  }

  if (seo.description && typeof seo.description !== 'string') {
    errors.push('SEO description must be a string');
  }

  if (seo.keywords) {
    if (!Array.isArray(seo.keywords)) {
      errors.push('SEO keywords must be an array of strings');
    } else {
      const invalidKeywords = seo.keywords.filter(keyword => typeof keyword !== 'string');
      if (invalidKeywords.length > 0) {
        errors.push('All SEO keywords must be strings');
      }
    }
  }

  if (seo.ogImage && typeof seo.ogImage !== 'string') {
    errors.push('Open Graph image must be a string URL');
  }

  if (seo.twitterImage && typeof seo.twitterImage !== 'string') {
    errors.push('Twitter image must be a string URL');
  }

  if (seo.canonical && typeof seo.canonical !== 'string') {
    errors.push('Canonical URL must be a string');
  }

  if (seo.noindex !== undefined && typeof seo.noindex !== 'boolean') {
    errors.push('Noindex must be a boolean');
  }

  if (seo.nofollow !== undefined && typeof seo.nofollow !== 'boolean') {
    errors.push('Nofollow must be a boolean');
  }

  return errors;
}

/**
 * Helper function to add an error to the errors object
 */
function addError(errors: Record<string, string[]>, field: string, message: string): void {
  if (!errors[field]) {
    errors[field] = [];
  }
  errors[field].push(message);
}

/**
 * Checks if a string is a valid ISO 8601 date
 */
function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.includes('T');
  } catch {
    return false;
  }
}

/**
 * Checks if a value is a valid ContentType
 */
function isValidContentType(type: string): type is ContentType {
  return ['portfolio', 'plugin', 'blog', 'profile', 'page', 'tool', 'asset', 'download'].includes(
    type
  );
}
