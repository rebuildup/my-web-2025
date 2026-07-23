import type { WidgetRecord } from "../hooks/usePomodoroWidgetStore";
import {
	STICKY_IMAGE_MAX_WIDTH,
	STICKY_NOTE_SIZE,
	getStickyColorById,
} from "./pomodoro-constants";

export type WidgetVisuals = {
	computedWidth: number | string;
	computedHeight: number | string;
	tapeWidth: number;
	tapeOffset: number;
	contentWrapperClass: string;
	contentWrapperStyle: React.CSSProperties;
	outerStyle: React.CSSProperties;
	outerClassName: string;
	textClass: string;
	isImageLoaded: boolean;
	stickyColor: string;
};

export const computeWidgetVisuals = (
	widget: WidgetRecord,
	theme: string,
	isDragging: boolean,
	isOverDeleteZone: boolean,
): WidgetVisuals => {
	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isYouTube = widget.type === "youtube";
	const isTimer = widget.type === "timer";
	const isStickyType =
		widget.type === "note" ||
		widget.type === "image" ||
		widget.type === "youtube" ||
		widget.type === "timer" ||
		widget.type === "stats";

	const fallbackStickyColor = getStickyColorById(widget.id);
	const stickyColor = widget.color ?? fallbackStickyColor;

	const computedWidth =
		typeof widget.w === "number"
			? widget.w
			: isNote || isTimer
				? STICKY_NOTE_SIZE
				: isImageSticky
					? STICKY_IMAGE_MAX_WIDTH
					: 300;

	const computedHeight =
		typeof widget.h === "number"
			? widget.h
			: isStickyType
				? STICKY_NOTE_SIZE
				: "auto";

	const numericWidth =
		typeof computedWidth === "number" ? computedWidth : STICKY_NOTE_SIZE;
	const tapeWidth = numericWidth + 40;
	const tapeOffset = isImageSticky ? -10 : -14;

	const stickyContentWrapperClass = isImageSticky
		? "flex-1 w-full h-full no-drag select-text flex items-center justify-center overflow-hidden"
		: "flex-1 w-full h-full no-drag select-text [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]: [&::-webkit-scrollbar-track]:";
	const nonStickyContentWrapperClass = `p-4 overflow-auto no-drag select-text ${
		widget.type === "music" ? "p-0" : ""
	}`;

	const isImageLoaded = widget.type === "image" && !!widget.content;

	let bgClass = "";
	if (isNote) {
		bgClass = "shadow-[0_4px_8px_rgba(0,0,0,0.2)] border ";
	} else if (isImageSticky) {
		if (isImageLoaded) {
			bgClass = "";
		} else {
			bgClass = "shadow-[0_6px_12px_rgba(0,0,0,0.2)] border  ";
		}
	} else if (isTimer) {
		bgClass = "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	} else if (isYouTube) {
		bgClass =
			theme === "dark"
				? "bg-[#1a1a1a]/95  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
				: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	} else {
		bgClass =
			theme === "dark"
				? "bg-[#1a1a1a]/90  shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
				: "  shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	}

	const outerClassName = `absolute flex flex-col transition-shadow duration-200 ${bgClass} ${
		isDragging ? "cursor-grabbing" : ""
	} ${
		isStickyType && widget.type !== "image" && widget.type !== "youtube"
			? "rounded-lg"
			: isImageLoaded
				? ""
				: "rounded-xl border "
	} ${isOverDeleteZone ? " scale-95" : ""}`;

	const outerStyle: React.CSSProperties = {
		left: widget.x,
		top: widget.y,
		zIndex: widget.zIndex ?? 60,
		width: computedWidth,
		height: computedHeight,
		touchAction: "none",
		backgroundColor: isImageLoaded
			? "transparent"
			: isStickyType && widget.type !== "image" && widget.type !== "youtube"
				? stickyColor
				: undefined,
		borderColor: isStickyType ? "transparent" : undefined,
		boxShadow: isImageLoaded ? "none" : undefined,
		border: isImageLoaded ? "none" : undefined,
		boxSizing: "border-box",
		pointerEvents: "auto",
	};

	const contentWrapperClass = isStickyType
		? stickyContentWrapperClass
		: nonStickyContentWrapperClass;
	const contentWrapperStyle: React.CSSProperties = isStickyType
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

	const textClass = isStickyType ? "" : theme === "dark" ? "" : "";

	return {
		computedWidth,
		computedHeight,
		tapeWidth,
		tapeOffset,
		contentWrapperClass,
		contentWrapperStyle,
		outerStyle,
		outerClassName,
		textClass,
		isImageLoaded,
		stickyColor,
	};
};
