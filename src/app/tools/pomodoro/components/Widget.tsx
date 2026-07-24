"use client";

import { Image as ImageIcon, Music, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useWidgetDrag } from "../hooks/useWidgetDrag";
import type {
	PomodoroSession,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import {
	BASE_WIDGET_Z,
	getStickyColorById,
	isStickyWidgetType,
} from "../utils/pomodoro-constants";
import MiniTimer from "./MiniTimer";
import StatsWidget from "./StatsWidget";
import { WidgetImageContent } from "./widgets/WidgetImageContent";
import { WidgetMusicContent } from "./widgets/WidgetMusicContent";
import { WidgetNoteContent } from "./widgets/WidgetNoteContent";
import {
	getContentWrapperLayout,
	getStickyColorForWidget,
	getWidgetBgClass,
	getWidgetSize,
} from "./widgets/widgetStyles";
import YouTubePlayer from "./youtube/YouTubePlayer";

export type Widget = {
	id: number;
	type: string;
	x: number;
	y: number;
	content: string;
	zIndex?: number;
	w?: number;
	h?: number | string;
	color?: string;
};

export type WidgetProps = {
	widget: Widget;
	updateWidget: (id: number, data: Partial<Widget>) => void;
	removeWidget: (id: number) => void;
	theme: string;
	bringToFront: () => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
	settings?: PomodoroSettings;
	pomodoroState?: {
		isActive: boolean;
		sessionType: "work" | "shortBreak" | "longBreak";
	};
	stats?: PomodoroStats;
	sessions?: PomodoroSession[];
};

export function Widget({
	widget,
	updateWidget,
	removeWidget,
	theme,
	bringToFront,
	onDragStart,
	onDragEnd,
	settings,
	pomodoroState,
	stats,
	sessions,
}: WidgetProps) {
	const isSticky = isStickyWidgetType(widget.type);
	const widgetZIndex = widget.zIndex ?? BASE_WIDGET_Z;
	const isImageLoaded = widget.type === "image" && widget.content;

	const {
		widgetRef,
		isDragging,
		isOverDeleteZone,
		handlePointerDown,
		handleFocus,
	} = useWidgetDrag({
		id: widget.id,
		type: widget.type,
		isSticky,
		bringToFront,
		updateWidget,
		removeWidget,
		onDragStart,
		onDragEnd,
	});

	// First-stick: assign a deterministic sticky colour if missing.
	useEffect(() => {
		if (isSticky && !widget.color) {
			updateWidget(widget.id, { color: getStickyColorById(widget.id) });
		}
	}, [isSticky, updateWidget, widget.color, widget.id]);

	const stickyColor = useMemo(
		() => getStickyColorForWidget(widget),
		[widget.color, widget.id],
	);

	const { computedWidth, computedHeight, tapeWidth, tapeOffset } = useMemo(
		() => getWidgetSize(widget),
		[widget.w, widget.h, widget.type],
	);

	const bgClass = useMemo(
		() =>
			getWidgetBgClass({
				widget,
				theme,
				isImageLoaded: Boolean(isImageLoaded),
			}),
		[widget.type, theme, isImageLoaded],
	);

	const { className: contentWrapperClass, style: contentWrapperStyle } =
		useMemo(
			() =>
				getContentWrapperLayout({
					widget,
					theme,
					isImageLoaded: Boolean(isImageLoaded),
				}),
			[widget.type, theme, isImageLoaded],
		);

	const textClass = isSticky ? "" : theme === "dark" ? "" : "";

	const isStickyVisible =
		isSticky && widget.type !== "image" && widget.type !== "youtube";

	return (
		<div
			ref={widgetRef}
			onMouseDown={handleFocus}
			style={{
				left: widget.x,
				top: widget.y,
				zIndex: widgetZIndex,
				width: computedWidth,
				height: computedHeight,
				touchAction: "none",
				backgroundColor: isImageLoaded
					? "transparent"
					: isStickyVisible
						? stickyColor
						: undefined,
				borderColor: isSticky ? "transparent" : undefined,
				boxShadow: isImageLoaded ? "none" : undefined,
				border: isImageLoaded ? "none" : undefined,
				boxSizing: "border-box" as const,
				pointerEvents: "auto",
			}}
			className={`absolute flex flex-col transition-shadow duration-200 ${bgClass} ${
				isDragging ? "cursor-grabbing" : ""
			} ${
				isStickyVisible
					? "rounded-lg"
					: isImageLoaded
						? ""
						: "rounded-xl border "
			} ${isOverDeleteZone ? " scale-95" : ""}`}
		>
			{isSticky && (
				<div
					onPointerDown={handlePointerDown}
					className="tape-handle absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing flex justify-center"
					style={{
						top: `${tapeOffset}px`,
						width: `${tapeWidth}px`,
						touchAction: "none",
						zIndex: widgetZIndex + 5,
					}}
				>
					<div
						className="h-8 bg-center bg-cover w-44"
						style={{ backgroundImage: "url('/images/sticky-tape.png')" }}
					></div>
				</div>
			)}

			{!isSticky && (
				<div
					onPointerDown={handlePointerDown}
					className={`h-8 flex items-center justify-between px-2 cursor-grab  ${theme === "dark" ? "" : ""}`}
					style={{ touchAction: "none" }}
				>
					<div className="flex items-center gap-2 ">
						{widget.type === "image" && <ImageIcon size={14} />}
						{widget.type === "music" && <Music size={14} />}
						<span className="text-xs font-bold uppercase tracking-wider">
							{widget.type}
						</span>
					</div>
					<div className="flex items-center gap-1 no-drag">
						<button
							onClick={() => removeWidget(widget.id)}
							className="p-1"
							aria-label="ウィジェットを削除"
						>
							<X size={12} />
						</button>
					</div>
				</div>
			)}

			<div className={contentWrapperClass} style={contentWrapperStyle}>
				{widget.type === "note" && (
					<WidgetNoteContent
						content={widget.content}
						theme={theme}
						id={widget.id}
						updateWidget={updateWidget}
					/>
				)}
				{widget.type === "image" && (
					<WidgetImageContent
						content={widget.content}
						theme={theme}
						id={widget.id}
						updateWidget={updateWidget}
					/>
				)}
				{widget.type === "music" && (
					<WidgetMusicContent
						content={widget.content}
						textClass={textClass}
						id={widget.id}
						updateWidget={updateWidget}
					/>
				)}
				{widget.type === "youtube" && (
					<YouTubePlayer
						pomodoroState={
							pomodoroState || {
								isActive: false,
								sessionType: "work",
							}
						}
						theme={theme as "light" | "dark"}
						url={widget.content}
						onUrlChange={(newUrl) =>
							updateWidget(widget.id, { content: newUrl })
						}
						onToggleMinimize={(isMinimized) => {
							if (isMinimized) {
								updateWidget(widget.id, { w: 200, h: 240 });
							} else {
								updateWidget(widget.id, { w: 400, h: 350 });
							}
						}}
						autoPlayOnFocusSession={settings?.autoPlayOnFocusSession ?? true}
						pauseOnBreak={settings?.pauseOnBreak ?? true}
						defaultVolume={settings?.youtubeDefaultVolume ?? 30}
						loopEnabled={settings?.youtubeLoop ?? false}
					/>
				)}
				{widget.type === "stats" && stats && sessions && (
					<StatsWidget stats={stats} sessions={sessions} />
				)}
				{widget.type === "timer" && (
					<MiniTimer id={widget.id} theme={theme as "light" | "dark"} />
				)}
			</div>
		</div>
	);
}
