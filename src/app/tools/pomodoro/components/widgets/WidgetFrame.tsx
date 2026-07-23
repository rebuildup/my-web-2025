"use client";

import { Image as ImageIcon, Music, X } from "lucide-react";
import React from "react";
import type { WidgetRecord } from "../../hooks/usePomodoroWidgetStore";
import type { WidgetVisuals } from "../../utils/widget-style";

export const WidgetFrame = ({
	visual,
	widget,
	theme,
	widgetRef,
	isDragging,
	isOverDeleteZone,
	isSticky,
	widgetZIndex,
	handlePointerDown,
	handleFocus,
	onRemove,
	children,
}: {
	visual: WidgetVisuals;
	widget: WidgetRecord;
	theme: string;
	widgetRef: React.RefObject<HTMLDivElement>;
	isDragging: boolean;
	isOverDeleteZone: boolean;
	isSticky: boolean;
	widgetZIndex: number;
	handlePointerDown: (e: React.PointerEvent) => void;
	handleFocus: () => void;
	onRemove: () => void;
	children: React.ReactNode;
}) => {
	return (
		<div
			ref={widgetRef}
			onMouseDown={handleFocus}
			style={{
				...visual.outerStyle,
				zIndex: widgetZIndex,
				width: visual.computedWidth,
				height: visual.computedHeight,
				cursor: isDragging ? "grabbing" : undefined,
			}}
			className={visual.outerClassName}
		>
			{isSticky && (
				<div
					onPointerDown={handlePointerDown}
					className="tape-handle absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing flex justify-center"
					style={{
						top: `${visual.tapeOffset}px`,
						width: `${visual.tapeWidth}px`,
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
							onClick={onRemove}
							className="p-1"
							aria-label="ウィジェットを削除"
						>
							<X size={12} />
						</button>
					</div>
				</div>
			)}

			<div
				className={visual.contentWrapperClass}
				style={visual.contentWrapperStyle}
			>
				{children}
			</div>
		</div>
	);
};
