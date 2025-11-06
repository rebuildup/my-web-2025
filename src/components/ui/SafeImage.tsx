/**
 * Safe Image Component
 * Handles image loading with fallbacks and error handling
 */

"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { ImageDebugInfo } from "@/components/debug/ImageDebugInfo";
import { getImageUrl } from "@/lib/utils/image-utils";

interface SafeImageProps {
	src: string | undefined;
	alt: string;
	fill?: boolean;
	width?: number;
	height?: number;
	sizes?: string;
	className?: string;
	style?: React.CSSProperties;
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
				const fallback = fallbackSrc || "/images/placeholder.svg";
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

	// Show debug info only when explicitly requested (not automatically in development)
	const shouldShowDebug = showDebug === true;

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

	// Normalize style so object-position is respected
	const style: React.CSSProperties = {
		...(props.style || {}),
	};
	// If objectPosition is not provided, default to center when using cover positioning patterns
	if (!style.objectPosition && (className || "").includes("object-cover")) {
		style.objectPosition = "center center";
	}

	// next/image はクエリ付きローカルURLに対して localPatterns 設定が必要。
	// ギャラリーでは /api/cms/media?… を直接表示するため、該当ケースは <img> にフォールバック。
	const isApiMediaSrc =
		typeof currentSrc === "string" && currentSrc.startsWith("/api/cms/media");

	if (isApiMediaSrc) {
		return (
			<div className={`relative ${fill ? "w-full h-full" : ""}`}>
				<img
					src={currentSrc}
					alt={alt}
					className={className}
					loading={loading}
					onError={handleError}
					onLoad={handleLoad}
					width={width}
					height={height}
					style={style}
					{...(props as Record<string, unknown>)}
				/>
				{shouldShowDebug && <ImageDebugInfo src={currentSrc} alt={alt} />}
			</div>
		);
	}

	return (
		<div className={`relative ${fill ? "w-full h-full" : ""}`}>
			<Image src={currentSrc} alt={alt} {...imageProps} style={style} />
			{shouldShowDebug && <ImageDebugInfo src={currentSrc} alt={alt} />}
		</div>
	);
}
