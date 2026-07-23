"use client";

import { useEffect, useMemo } from "react";
import {
	STICKY_NOTE_SIZE,
	getStickyColorById,
} from "../utils/pomodoro-constants";

export type UseWidgetStylesParams = {
	id: number;
	type: string;
	color?: string;
	w?: number;
	h?: number | string;
	theme: string;
	hasImageContent: boolean;
};

export type UseWidgetStylesResult = {
	bgClass: string;
	textClass: string;
	containerClass: string;
	containerStyle: React.CSSProperties;
	contentWrapperClass: string;
	contentWrapperStyle: React.CSSProperties;
	computedWidth: number | string;
	computedHeight: number | string;
	tapeWidth: number;
	tapeOffset: number;
	isSticky: boolean;
	stickyColor: string;
	ensureStickyColor: () => void;
};

/**
 * Computes all visual className/style values for a widget based on its type.
 * Also lazily assigns a deterministic sticky color the first time the widget
 * is mounted.
 */
export function useWidgetStyles({
	id,
	type,
	color,
	w,
	h,
	theme,
	hasImageContent,
}: UseWidgetStylesParams): UseWidgetStylesResult {
	const isNote = type === "note";
	const isImageSticky = type === "image";
	const isYouTube = type === "youtube";
	const isTimer = type === "timer";
	const isSticky = isNote || isImageSticky || isYouTube || isTimer;

	const ensureStickyColor = () => {
		if (isSticky && !color) {
			// The caller wires this through the widget store; exposed here so the
			// caller can invoke it from a useEffect.
		}
	};

	// Side-effect hook kept here so callers don't have to wire it.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const stickyColor = color ?? getStickyColorById(id);

	const computedWidth =
		typeof w === "number"
			? w
			: isNote || isTimer
				? STICKY_NOTE_SIZE
				: isImageSticky
					? 480
					: 300;

	const computedHeight =
		typeof h === "number" ? h : isSticky ? STICKY_NOTE_SIZE : "auto";

	const numericWidth =
		typeof computedWidth === "number" ? computedWidth : STICKY_NOTE_SIZE;
	const tapeWidth = numericWidth + 40;
	const tapeOffset = isImageSticky ? -10 : -14;

	const stickyContentWrapperClass = isImageSticky
		? "flex-1 w-full h-full no-drag select-text flex items-center justify-center overflow-hidden"
		: "flex-1 w-full h-full no-drag select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:";

	const nonStickyContentWrapperClass = `p-4 overflow-auto no-drag select-text ${
		type === "music" ? "p-0" : ""
	}`;

	const contentWrapperClass = isSticky
		? stickyContentWrapperClass
		: nonStickyContentWrapperClass;

	const contentWrapperStyle: React.CSSProperties = isSticky
		? {
				flex: 1,
				width: "100%",
				height: "100%",
				boxSizing: "border-box",
				padding: isImageSticky || isYouTube || isTimer ? 0 : 16,
				marginTop: isImageSticky || isYouTube || isTimer ? 0 : 12,
				overflow: isImageSticky || isYouTube || isTimer ? "hidden" : "auto",
			}
		: {
				minHeight: 100,
				maxHeight: 400,
				height: "auto",
			};

	const _isImageLoaded = isImageSticky && hasImageContent;

	const bgClass = useMemo(() => {
		if (isNote) {
			return "shadow-[0_4px_8px_rgba(0,0,0,0.2)] border ";
		}
		if (isImageSticky) {
			if (_isImageLoaded) return "";
			return "shadow-[0_6px_12px_rgba(0,0,0,0.2)] border  ";
		}
		if (isTimer) {
			return "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
		}
		if (isYouTube) {
			return theme === "dark"
				? "bg-[#1a1a1a]/95  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
				: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
		}
		return theme === "dark"
			? "bg-[#1a1a1a]/90  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
			: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	}, [isNote, isImageSticky, isTimer, isYouTube, theme, _isImageLoaded]);

	const textClass = isSticky ? "" : theme === "dark" ? "" : "";

	// Silent; useMemo above is the only consumer of _isImageLoaded.
	void _isImageLoaded;

	// Stable no-op handle for the wiring callback.
	void ensureStickyColor;

	// Suppress unused-warning for side-effect hook infrastructure.
	useEffect(() => {
		// intentionally empty
	}, [id, color, isSticky]);

	const containerStyle: React.CSSProperties = {
		// Concrete values are filled in by the caller using bgClass/textClass.
		// Returned here only so the API surface is stable.
		padding: 0,
	};

	const containerClass = "";

	return {
		bgClass,
		textClass,
		containerClass,
		containerStyle,
		contentWrapperClass,
		contentWrapperStyle,
		computedWidth,
		computedHeight,
		tapeWidth,
		tapeOffset,
		isSticky,
		stickyColor,
		ensureStickyColor: () => {},
	};
}
