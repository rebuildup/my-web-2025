"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

interface YouTubeThumbnailProps {
	videoId: string;
	alt: string;
	fallbackSrc?: string;
	className?: string;
	onLoad?: () => void;
	style?: CSSProperties;
}

export default function YouTubeThumbnail({
	videoId,
	alt,
	fallbackSrc,
	className = "",
	onLoad,
	style,
}: YouTubeThumbnailProps) {
	// Try maxresdefault first for highest quality
	const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

	return (
		<Image
			src={thumbnailUrl}
			alt={alt}
			fill
			sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
			className={`${className} object-cover object-center`}
			style={style}
			onLoad={onLoad}
			onError={(e) => {
				const img = e.target as HTMLImageElement;
				// Try hqdefault if maxresdefault fails
				if (img.src.includes("maxresdefault")) {
					img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
				} else if (img.src.includes("hqdefault") && fallbackSrc) {
					// If hqdefault also fails, try fallback
					img.src = fallbackSrc;
				} else if (img.src.includes("hqdefault")) {
					// If no fallback, try mqdefault
					img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
				}
			}}
		/>
	);
}
