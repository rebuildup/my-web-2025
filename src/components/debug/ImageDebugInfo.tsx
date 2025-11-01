/**
 * Image Debug Information Component
 * Shows image loading status and paths for debugging
 */

"use client";

import { useEffect, useState } from "react";

interface ImageDebugInfoProps {
	src: string;
	alt: string;
}

export function ImageDebugInfo({ src, alt }: ImageDebugInfoProps) {
	const [imageStatus, setImageStatus] = useState<
		"loading" | "loaded" | "error"
	>("loading");
	const [actualSrc, setActualSrc] = useState<string>("");

	useEffect(() => {
		if (!src) return;

		setImageStatus("loading");
		setActualSrc("");

		const img = new Image();
		img.onload = () => {
			setImageStatus("loaded");
			setActualSrc(img.src);
		};
		img.onerror = () => {
			setImageStatus("error");
			setActualSrc(img.src);
		};
		img.src = src;
	}, [src]);

	if (process.env.NODE_ENV === "production") {
		return null;
	}

	return (
		<div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white text-xs p-2 z-50 max-w-full overflow-hidden">
			<div>
				Status:{" "}
				<span
					className={`font-bold ${
						imageStatus === "loaded"
							? "text-green-400"
							: imageStatus === "error"
								? "text-red-400"
								: "text-yellow-400"
					}`}
				>
					{imageStatus}
				</span>
			</div>
			<div>Original: {src}</div>
			<div>Actual: {actualSrc}</div>
			<div>Alt: {alt}</div>
			<div>Env: {process.env.NODE_ENV}</div>
		</div>
	);
}
