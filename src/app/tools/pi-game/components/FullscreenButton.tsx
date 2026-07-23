"use client";

import type React from "react";

interface FullscreenButtonProps {
	isFullscreen: boolean;
	onToggle: () => void;
}

export function FullscreenButton({
	isFullscreen,
	onToggle,
}: FullscreenButtonProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="px-4 py-2 text-sm font-inherit cursor-pointer border border-gray-300 rounded bg-[#f5f5f5] self-end"
			style={{
				position: isFullscreen ? "fixed" : "relative",
				top: isFullscreen ? 16 : undefined,
				right: isFullscreen ? 16 : undefined,
				zIndex: isFullscreen ? 10 : undefined,
			}}
		>
			{isFullscreen ? "終了" : "全画面"}
		</button>
	);
}
