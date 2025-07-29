/**
 * Image utility functions for handling different image types
 */

import { ImageItem } from "@/types/content";

/**
 * Extract URL from image item (string or ImageItem)
 */
export function getImageUrl(image: string | ImageItem | undefined): string {
  if (!image) {
    return "/images/portfolio/placeholder-image.svg";
  }

  if (typeof image === "string") {
    return image;
  }

  return image.url;
}

/**
 * Extract thumbnail URL from images array
 */
export function getThumbnailUrl(
  thumbnail: string | undefined,
  images: (string | ImageItem)[] | undefined,
): string {
  if (thumbnail) {
    return thumbnail;
  }

  if (images && images.length > 0) {
    return getImageUrl(images[0]);
  }

  return "/images/portfolio/placeholder-image.svg";
}

/**
 * Get image dimensions if available
 */
export function getImageDimensions(image: string | ImageItem): {
  width?: number;
  height?: number;
} {
  if (typeof image === "string") {
    return {};
  }

  return {
    width: image.width,
    height: image.height,
  };
}

/**
 * Calculate aspect ratio from image
 */
export function getImageAspectRatio(
  image: string | ImageItem,
): number | undefined {
  if (typeof image === "string") {
    return undefined;
  }

  if (image.width && image.height) {
    return image.width / image.height;
  }

  return undefined;
}
