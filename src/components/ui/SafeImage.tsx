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
	const baseStyle: React.CSSProperties = {
		...(props.style || {}),
	};
	// If objectPosition is not provided, default to center when using cover positioning patterns
	if (!baseStyle.objectPosition && (className || "").includes("object-cover")) {
		baseStyle.objectPosition = "center center";
	}

	// next/image はクエリ付きローカルURLに対して localPatterns 設定が必要。
	// ギャラリーでは /api/cms/media?… を直接表示するため、該当ケースは <img> にフォールバック。
	const isApiMediaSrc =
		typeof currentSrc === "string" &&
		(currentSrc.startsWith("/api/cms/media") ||
			currentSrc.includes("/api/cms/media"));

	// width と height が undefined の場合、fill を使うか <img> にフォールバック
	const shouldUseFill = !fill && !width && !height;
	const shouldUseImgTag = isApiMediaSrc || shouldUseFill;

	if (shouldUseImgTag) {
		// fillプロパティを使っている場合、画像を親要素にフィットさせる
		const imgStyle: React.CSSProperties = {
			...baseStyle,
		};
		if (fill || shouldUseFill) {
			// fillプロパティを使っている場合、position: absoluteを優先
			// props.styleで上書きされないように、最後に設定
			Object.assign(imgStyle, {
				position: "absolute",
				top: "0",
				left: "0",
				width: "100%",
				height: "100%",
			});
		}
		// propsからstyleを除外して、imgStyleを優先
		const { style: _style, ...restProps } = props as Record<string, unknown> & {
			style?: React.CSSProperties;
		};
		return (
			<div
				className={`relative ${fill || shouldUseFill ? "w-full h-full" : ""}`}
			>
				<img
					src={currentSrc}
					alt={alt}
					className={className}
					loading={loading}
					onError={handleError}
					onLoad={handleLoad}
					width={width}
					height={height}
					style={imgStyle}
					{...restProps}
				/>
				{shouldShowDebug && <ImageDebugInfo src={currentSrc} alt={alt} />}
			</div>
		);
	}

	return (
		<div className={`relative ${fill ? "w-full h-full" : ""}`}>
			<Image src={currentSrc} alt={alt} {...imageProps} style={baseStyle} />
			{shouldShowDebug && <ImageDebugInfo src={currentSrc} alt={alt} />}
		</div>
	);
}
