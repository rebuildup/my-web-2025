"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BASE_WIDGET_Z, STICKY_NOTE_COLORS } from "../utils/pomodoro-constants";
import { useLocalStorage } from "./useLocalStorage";

export type WidgetRecord = {
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

export type UsePomodoroWidgetStoreOptions = {
	stickyWidgetSize: number;
	youtubeWidgetWidth: number;
	seedRef: React.MutableRefObject<number>;
};

export type UsePomodoroWidgetStoreResult = {
	widgets: WidgetRecord[];
	nextZ: () => number;
	nextId: () => number;
	getDeterministicStickyColor: () => string;
	nextJitter: (range: number) => number;
	isDraggingStickyWidget: boolean;
	setIsDraggingStickyWidget: (value: boolean) => void;
	addWidget: (type: string) => void;
	updateWidget: (id: number, data: Partial<WidgetRecord>) => void;
	removeWidget: (id: number) => void;
};

/**
 * Owns the widgets array, the stacked z-index counter, and the deterministic
 * id/colour/jitter helpers. Pulled out of PomodoroTimer so the timer component
 * stays focused on the timer lifecycle.
 */
export function usePomodoroWidgetStore(
	options: UsePomodoroWidgetStoreOptions,
): UsePomodoroWidgetStoreResult {
	const { stickyWidgetSize, youtubeWidgetWidth, seedRef } = options;

	const [widgets, setWidgets] = useLocalStorage<WidgetRecord[]>(
		"pomodoro-widgets",
		[],
	);
	const [isDraggingStickyWidget, setIsDraggingStickyWidget] = useState(false);

	const zCounterRef = useRef(BASE_WIDGET_Z);

	useEffect(() => {
		const maxZ =
			widgets.reduce(
				(acc, w) => Math.max(acc, w.zIndex ?? BASE_WIDGET_Z),
				BASE_WIDGET_Z,
			) + 1;
		zCounterRef.current = Math.max(zCounterRef.current, maxZ);
	}, [widgets]);

	const nextSeed = useCallback(() => {
		seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0;
		return seedRef.current;
	}, [seedRef]);

	const nextZ = useCallback(() => {
		zCounterRef.current = (zCounterRef.current || BASE_WIDGET_Z) + 1;
		return zCounterRef.current;
	}, []);

	const nextId = useCallback(() => nextSeed(), [nextSeed]);

	const nextJitter = useCallback(
		(range: number) => {
			const value = nextSeed() / 0xffffffff;
			return (value - 0.5) * range * 2;
		},
		[nextSeed],
	);

	const getDeterministicStickyColor = useCallback(() => {
		const index = nextSeed() % STICKY_NOTE_COLORS.length;
		return STICKY_NOTE_COLORS[index];
	}, [nextSeed]);

	const addWidget = useCallback(
		(type: string) => {
			if (type === "music") {
				const id = nextId();
				const newWidget: WidgetRecord = {
					id,
					type: "youtube",
					x: window.innerWidth / 2 - youtubeWidgetWidth / 2 + nextJitter(40),
					y: window.innerHeight / 2 - 150 + nextJitter(40),
					content: "",
					w: youtubeWidgetWidth,
					h: "auto",
					zIndex: nextZ(),
				};
				setWidgets([...widgets, newWidget]);
				return;
			}
			if (type === "stats") {
				const id = nextId();
				const newWidget: WidgetRecord = {
					id,
					type: "stats",
					x: window.innerWidth / 2 - 180 + nextJitter(40),
					y: window.innerHeight / 2 - 120 + nextJitter(40),
					content: "",
					w: stickyWidgetSize,
					h: stickyWidgetSize,
					zIndex: nextZ(),
					color: getDeterministicStickyColor(),
				};
				setWidgets([...widgets, newWidget]);
				return;
			}
			const id = nextId();
			const content = "";
			const shouldHaveStickyStyle =
				type === "note" || type === "image" || type === "timer";
			const initialSize = shouldHaveStickyStyle ? stickyWidgetSize : undefined;
			const newWidget: WidgetRecord = {
				id,
				type,
				x: window.innerWidth / 2 - 150 + nextJitter(40),
				y: window.innerHeight / 2 - 100 + nextJitter(40),
				content,
				w: initialSize,
				h: initialSize,
				color: shouldHaveStickyStyle
					? getDeterministicStickyColor()
					: undefined,
				zIndex: nextZ(),
			};
			setWidgets([...widgets, newWidget]);
		},
		[
			getDeterministicStickyColor,
			nextId,
			nextJitter,
			nextZ,
			setWidgets,
			stickyWidgetSize,
			widgets,
			youtubeWidgetWidth,
		],
	);

	const updateWidget = useCallback(
		(id: number, newData: Partial<WidgetRecord>) => {
			setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...newData } : w)));
		},
		[setWidgets, widgets],
	);

	const removeWidget = useCallback(
		(id: number) => {
			setWidgets(widgets.filter((w) => w.id !== id));
		},
		[setWidgets, widgets],
	);

	return {
		widgets,
		nextZ,
		nextId,
		getDeterministicStickyColor,
		nextJitter,
		isDraggingStickyWidget,
		setIsDraggingStickyWidget,
		addWidget,
		updateWidget,
		removeWidget,
	};
}
