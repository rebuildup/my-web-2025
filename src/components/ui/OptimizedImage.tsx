"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image component with lazy loading and performance optimizations
 * Implements Next.js Image with additional performance features
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  placeholder = "empty",
  blurDataURL,
  sizes,
  fill = false,
  loading = "lazy",
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const currentRef = imgRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px", // Load image 50px before it comes into view
        threshold: 0.1,
      },
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [priority, isInView]);

  // Handle load event
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle error event
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? "100vw"
      : "(max-width: 384px) 384px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px");

  // Generate blur data URL if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const defaultBlurDataURL =
    blurDataURL ||
    (width && height ? generateBlurDataURL(width, height) : undefined);

  // Error fallback component
  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Loading placeholder
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-100 animate-pulse ${className}`}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={!fill ? { width, height } : undefined}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={responsiveSizes}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${fill ? "object-cover" : ""}`}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

// Gallery component with optimized images
interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  itemClassName?: string;
  priority?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  className = "",
  itemClassName = "",
  priority = false,
}) => {
  return (
    <div className={`grid gap-4 ${className}`}>
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={itemClassName}
          priority={priority && index < 2} // Prioritize first 2 images
          sizes="(max-width: 384px) 384px, (max-width: 768px) 768px, 1024px"
        />
      ))}
    </div>
  );
};

// Progressive image component for hero sections
interface ProgressiveImageProps {
  src: string;
  alt: string;
  lowQualitySrc?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  lowQualitySrc,
  className = "",
  width,
  height,
  priority = false,
}) => {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Low quality image (loads first) */}
      {lowQualitySrc && (
        <OptimizedImage
          src={lowQualitySrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          quality={20}
          className={`absolute inset-0 transition-opacity duration-500 ${
            highQualityLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* High quality image */}
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={90}
        className={`transition-opacity duration-500 ${
          highQualityLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setHighQualityLoaded(true)}
      />
    </div>
  );
};

// Responsive image with art direction
interface ResponsiveImageProps {
  sources: Array<{
    src: string;
    media: string;
    width: number;
    height: number;
  }>;
  fallback: {
    src: string;
    width: number;
    height: number;
  };
  alt: string;
  className?: string;
  priority?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  sources,
  fallback,
  alt,
  className = "",
  priority = false,
}) => {
  const [currentSource, setCurrentSource] = useState(fallback);

  useEffect(() => {
    const updateSource = () => {
      for (const source of sources) {
        if (window.matchMedia(source.media).matches) {
          setCurrentSource(source);
          return;
        }
      }
      setCurrentSource(fallback);
    };

    updateSource();

    // Listen for media query changes
    const mediaQueries = sources.map((source) =>
      window.matchMedia(source.media),
    );
    mediaQueries.forEach((mq) => mq.addEventListener("change", updateSource));

    return () => {
      mediaQueries.forEach((mq) =>
        mq.removeEventListener("change", updateSource),
      );
    };
  }, [sources, fallback]);

  return (
    <OptimizedImage
      src={currentSource.src}
      alt={alt}
      width={currentSource.width}
      height={currentSource.height}
      className={className}
      priority={priority}
      sizes="(max-width: 384px) 384px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1280px"
    />
  );
};
