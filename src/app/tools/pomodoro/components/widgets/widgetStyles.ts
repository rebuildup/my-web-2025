"use client";

import {
	getStickyColorById,
	STICKY_NOTE_SIZE,
} from "../../utils/pomodoro-constants";

export type WidgetVisualLayout = {
	widget: {
		type: string;
		w?: number;
		h?: number | string;
		color?: string;
	};
	theme: string;
	isImageLoaded: boolean;
};

/**
 * Returns the height, width, and tape offsets used by the widget frame.
 * Pulled out of Widget.tsx so the component file can stay focused on
 * rendering rather than visual arithmetic.
 */
export function getWidgetSize(widget: WidgetVisualLayout["widget"]) {
	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isTimer = widget.type === "timer";

	const computedWidth =
		typeof widget.w === "number"
			? widget.w
			: isNote || isTimer
				? STICKY_NOTE_SIZE
				: isImageSticky
					? 480
					: 300;

	const computedHeight =
		typeof widget.h === "number"
			? widget.h
			: isNote || isImageSticky || widget.type === "youtube" || isTimer
				? STICKY_NOTE_SIZE
				: "auto";

	const numericWidth =
		typeof computedWidth === "number" ? computedWidth : STICKY_NOTE_SIZE;
	const tapeWidth = numericWidth + 40;
	const tapeOffset = isImageSticky ? -10 : -14;

	return { computedWidth, computedHeight, numericWidth, tapeWidth, tapeOffset };
}

/**
 * Returns the background class for the widget frame.
 */
export function getWidgetBgClass({
	widget,
	theme,
	isImageLoaded,
}: WidgetVisualLayout): string {
	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isTimer = widget.type === "timer";
	const isYouTube = widget.type === "youtube";

	if (isNote) return "shadow-[0_4px_8px_rgba(0,0,0,0.2)] border ";
	if (isImageSticky) {
		if (isImageLoaded) return "";
		return "shadow-[0_6px_12px_rgba(0,0,0,0.2)] border  ";
	}
	if (isTimer) return "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	if (isYouTube) {
		return theme === "dark"
			? "bg-[#1a1a1a]/95  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
			: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	}
	return theme === "dark"
		? "bg-[#1a1a1a]/90  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
		: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
}

/**
 * Returns the className and style for the inner content wrapper.
 */
export function getContentWrapperLayout({ widget }: WidgetVisualLayout): {
	className: string;
	style: React.CSSProperties;
} {
	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isYouTube = widget.type === "youtube";
	const isTimer = widget.type === "timer";
	const isSticky = isNote || isImageSticky || isYouTube || isTimer;

	const stickyContentWrapperClass = isImageSticky
		? "flex-1 w-full h-full no-drag select-text flex items-center justify-center overflow-hidden"
		: "flex-1 w-full h-full no-drag select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:";

	const nonStickyContentWrapperClass = `p-4 overflow-auto no-drag select-text ${
		widget.type === "music" ? "p-0" : ""
	}`;

	const style: React.CSSProperties = isSticky
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

	const className = isSticky
		? stickyContentWrapperClass
		: nonStickyContentWrapperClass;

	return { className, style };
}

/**
 * Returns the deterministic sticky colour used as a fallback before the
 * widget has been touched by the user.
 */
export function getStickyColorForWidget(
	widget: WidgetVisualLayout["widget"],
): string {
	return (
		widget.color ?? getStickyColorById((widget as { id?: number }).id ?? 0)
	);
}
