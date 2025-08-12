/**
 * Safe Image Component
 * Handles image loading with fallbacks and error handling
 */

"use client";

import { ImageDebugInfo } from "@/components/debug/ImageDebugInfo";
import { getImageUrl } from "@/lib/utils/image-utils";
import Image from "next/image";
import { useCallback, useState } from "react";

interface SafeImageProps {
  src: string | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  fallbackSrc?: string;
  showDebug?: boolean;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  loading = "lazy",
  priority = false,
  fallbackSrc,
  showDebug = false,
  onError,
  onLoad,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(() => getImageUrl(src));

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.NODE_ENV !== "test"
      ) {
        console.error("SafeImage: Image failed to load:", currentSrc);
        console.error("SafeImage: Error details:", e);
      }

      if (!hasError) {
        setHasError(true);
        const fallback =
          fallbackSrc || "/images/portfolio/placeholder-image.svg";
        if (
          process.env.NODE_ENV !== "production" &&
          process.env.NODE_ENV !== "test"
        ) {
          console.log("SafeImage: Using fallback:", fallback);
        }
        setCurrentSrc(fallback);
      }

      onError?.(e);
    },
    [currentSrc, hasError, fallbackSrc, onError],
  );

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (
        process.env.NODE_ENV !== "production" &&
        process.env.NODE_ENV !== "test"
      ) {
        console.log("SafeImage: Image loaded successfully:", currentSrc);
        console.log("SafeImage: Environment:", process.env.NODE_ENV);
      }
      onLoad?.(e);
    },
    [currentSrc, onLoad],
  );

  // Show debug info in development or when explicitly requested
  const shouldShowDebug = showDebug || process.env.NODE_ENV === "development";

  // Prepare image props, filtering out undefined values to avoid DOM warnings
  const imageProps: Omit<
    NonNullable<Parameters<typeof Image>[0]>,
    "src" | "alt"
  > & { src?: string; alt?: string } = {
    className,
    loading,
    onError: handleError,
    onLoad: handleLoad,
    ...props,
  } as const;

  // Only add boolean props if they are true to avoid DOM warnings
  if (fill) imageProps.fill = fill;
  if (priority) imageProps.priority = priority;
  if (width) imageProps.width = width;
  if (height) imageProps.height = height;
  if (sizes) imageProps.sizes = sizes;
  if (process.env.NEXT_BUILD_STANDALONE === "true")
    imageProps.unoptimized = true;

  return (
    <div className={`relative ${fill ? "w-full h-full" : ""}`}>
      <Image src={currentSrc} alt={alt} {...imageProps} />
      {shouldShowDebug && <ImageDebugInfo src={currentSrc} alt={alt} />}
    </div>
  );
}
