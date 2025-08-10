/**
 * Image Fallback Utilities
 * Handles image loading failures and provides fallback mechanisms
 */

import { getImageUrl } from "./image-utils";

/**
 * Check if an image exists and is accessible
 */
export async function checkImageExists(src: string): Promise<boolean> {
  if (!src || typeof window === "undefined") {
    return false;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;

    // Timeout after 5 seconds
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * Get a working image URL with fallback
 */
export async function getWorkingImageUrl(
  primarySrc: string | undefined,
  fallbackSrc?: string,
): Promise<string> {
  const defaultFallback = "/images/portfolio/placeholder-image.svg";

  if (!primarySrc) {
    return fallbackSrc || defaultFallback;
  }

  const normalizedSrc = getImageUrl(primarySrc);

  // For external URLs, return as-is (YouTube thumbnails, etc.)
  if (
    normalizedSrc.startsWith("http://") ||
    normalizedSrc.startsWith("https://")
  ) {
    return normalizedSrc;
  }

  // For local images, check if they exist
  const exists = await checkImageExists(normalizedSrc);
  if (exists) {
    return normalizedSrc;
  }

  // Try fallback
  if (fallbackSrc) {
    const fallbackExists = await checkImageExists(fallbackSrc);
    if (fallbackExists) {
      return fallbackSrc;
    }
  }

  return defaultFallback;
}

/**
 * Create an image error handler
 */
export function createImageErrorHandler(fallbackSrc?: string) {
  return (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    const currentSrc = target.src;

    console.warn("Image failed to load:", currentSrc);

    // Prevent infinite loop
    if (target.dataset.errorHandled === "true") {
      return;
    }

    target.dataset.errorHandled = "true";
    target.src = fallbackSrc || "/images/portfolio/placeholder-image.svg";
  };
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Resolve even on error to not block
        img.src = url;
      });
    }),
  );
}
