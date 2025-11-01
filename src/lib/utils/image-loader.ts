/**
 * Custom Image Loader for Production
 * Fixes image loading issues in production deployment
 */

interface ImageLoaderProps {
	src: string;
	width: number;
	quality?: number;
}

export default function imageLoader({
	src,
	width,
	quality,
}: ImageLoaderProps): string {
	// For external URLs (YouTube thumbnails, etc.), return as-is
	if (src.startsWith("http://") || src.startsWith("https://")) {
		return src;
	}

	// For local images, ensure they start with /
	const normalizedSrc = src.startsWith("/") ? src : `/${src}`;

	// In standalone builds, return the direct path without optimization
	// This prevents issues with Next.js image optimization in standalone builds
	if (process.env.NEXT_BUILD_STANDALONE === "true") {
		return normalizedSrc;
	}

	// In development, use default behavior
	return `${normalizedSrc}?w=${width}&q=${quality || 75}`;
}
