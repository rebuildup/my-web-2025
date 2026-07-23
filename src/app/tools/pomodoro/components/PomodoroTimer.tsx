"use client";

import {
	BarChart2,
	Image as ImageIcon,
	Moon,
	Music,
	Settings,
	StickyNote,
	Sun,
	Timer,
	X,
} from "lucide-react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNotifications } from "../hooks/useNotifications";
import { useTimerEngine } from "../hooks/useTimerEngine";
import type {
	PomodoroSession,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import { DEFAULT_HIGHLIGHT_COLOR } from "../types";
import {
	BASE_WIDGET_Z,
	DEFAULT_SETTINGS,
	DEFAULT_STATS,
	SCHEDULE,
	STICKY_NOTE_COLORS,
	STICKY_NOTE_SIZE,
	getStickyColorById,
	isStickyWidgetType,
	type ScheduleStep,
} from "../utils/pomodoro-constants";
import { Dock, DockButton } from "./Dock";
import { ImageWidget } from "./widgets/ImageWidget";
import { MusicWidget } from "./widgets/MusicWidget";
import { NoteWidget } from "./widgets/NoteWidget";
import MiniTimer from "./MiniTimer";
import StatsWidget from "./StatsWidget";
import { SettingsPanel } from "./settings/SettingsPanel";
import { CircularTimer } from "./widgets/CircularTimer";
import { CurrentStepLabel } from "./widgets/CurrentStepLabel";
import { DeleteZone } from "./widgets/DeleteZone";
import { StopDialog } from "./widgets/StopDialog";
import { WorkflowProgressBar } from "./widgets/WorkflowProgressBar";
import YouTubePlayer from "./youtube/YouTubePlayer";

type Widget = {
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

// Widget Component
const Widget = ({
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
}: {
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
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isYouTube = widget.type === "youtube";
	const isTimer = widget.type === "timer";
	const isSticky = isStickyWidgetType(widget.type);
	const widgetZIndex = widget.zIndex ?? BASE_WIDGET_Z;

	const widgetRef = useRef<HTMLDivElement>(null);
	const onDragStartRef = useRef<(() => void) | undefined>(undefined);
	const onDragEndRef = useRef<(() => void) | undefined>(undefined);
	const lastPointerId = useRef<number | null>(null);

	useEffect(() => {
		onDragStartRef.current = onDragStart;
		onDragEndRef.current = onDragEnd;
	}, [onDragStart, onDragEnd]);

	const startDrag = (clientX: number, clientY: number) => {
		bringToFront();
		setIsDragging(true);
		if (isSticky) {
			onDragStartRef.current?.();
		}
		if (widgetRef.current) {
			const rect = widgetRef.current.getBoundingClientRect();
			setDragOffset({ x: clientX - rect.left, y: clientY - rect.top });
		}
	};

	const handlePointerDown = (e: React.PointerEvent) => {
		const target = e.target as HTMLElement;
		const canDrag = isSticky ? !!target.closest(".tape-handle") : true;
		if (!canDrag) return;
		if (target.closest(".no-drag")) return;
		e.preventDefault();
		lastPointerId.current = e.pointerId;
		if (widgetRef.current?.setPointerCapture) {
			try {
				widgetRef.current.setPointerCapture(e.pointerId);
			} catch {
				// ignore
			}
		}
		startDrag(e.clientX, e.clientY);
	};

	useEffect(() => {
		const handlePointerMove = (e: PointerEvent) => {
			if (!isDragging) return;
			e.preventDefault();
			updateWidget(widget.id, {
				x: e.clientX - dragOffset.x,
				y: e.clientY - dragOffset.y,
			});

			const deleteZone = document.querySelector(".delete-zone");
			if (deleteZone && isSticky) {
				const rect = deleteZone.getBoundingClientRect();
				const isOver =
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom;
				setIsOverDeleteZone(isOver);
				const indicator = deleteZone.querySelector("#delete-zone-indicator");
				const icon = deleteZone.querySelector("#delete-zone-icon");
				if (indicator && icon) {
					if (isOver) {
						indicator.className =
							"w-64 h-24 rounded-2xl   flex items-center justify-center transition-all duration-200  ";
						icon.setAttribute(
							"class",
							"lucide lucide-trash2  transition-all duration-200 scale-150",
						);
					} else {
						indicator.className =
							"w-64 h-24 rounded-2xl   flex items-center justify-center transition-all duration-200  ";
						icon.setAttribute(
							"class",
							"lucide lucide-trash2   transition-all duration-200 scale-100",
						);
					}
				}
			}
		};

		const handlePointerUp = () => {
			if (isDragging && isOverDeleteZone && isSticky) {
				removeWidget(widget.id);
			}
			if (
				lastPointerId.current !== null &&
				widgetRef.current?.releasePointerCapture
			) {
				try {
					widgetRef.current.releasePointerCapture(lastPointerId.current);
				} catch {
					// ignore
				}
			}
			setIsDragging(false);
			setIsOverDeleteZone(false);
			if (isSticky) {
				onDragEndRef.current?.();
			}
		};

		const handleVisibility = () => {
			if (document.hidden) {
				setIsDragging(false);
				setIsOverDeleteZone(false);
			}
		};

		if (isDragging) {
			window.addEventListener("pointermove", handlePointerMove);
			window.addEventListener("pointerup", handlePointerUp);
			window.addEventListener("pointercancel", handlePointerUp);
			window.addEventListener("mouseup", handlePointerUp);
			window.addEventListener("touchend", handlePointerUp);
			window.addEventListener("visibilitychange", handleVisibility);
		}
		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerUp);
			window.removeEventListener("mouseup", handlePointerUp);
			window.removeEventListener("touchend", handlePointerUp);
			window.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [
		isDragging,
		dragOffset,
		widget.id,
		widget.type,
		updateWidget,
		isOverDeleteZone,
		removeWidget,
	]);

	const handleFocus = () => {
		bringToFront();
	};

	useEffect(() => {
		if (isSticky && !widget.color) {
			updateWidget(widget.id, { color: getStickyColorById(widget.id) });
		}
	}, [isSticky, updateWidget, widget.color, widget.id]);

	const fallbackStickyColor = useMemo(
		() => getStickyColorById(widget.id),
		[widget.id],
	);
	const stickyColor = widget.color ?? fallbackStickyColor;

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
			: isSticky
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
	const contentWrapperClass = isSticky
		? stickyContentWrapperClass
		: nonStickyContentWrapperClass;
	const contentWrapperStyle = isSticky
		? {
				flex: 1,
				width: "100%",
				height: "100%",
				boxSizing: "border-box" as const,
				padding: isImageSticky || isYouTube || isTimer ? 0 : 16,
				marginTop: isImageSticky || isYouTube || isTimer ? 0 : 12,
				overflow: isImageSticky || isYouTube || isTimer ? "hidden" : "auto",
			}
		: {
				minHeight: 100,
				maxHeight: 400,
				height: "auto",
			};

	const handleImageLoad = useCallback(
		(e: React.SyntheticEvent<HTMLImageElement>) => {
			const { naturalWidth, naturalHeight } = e.currentTarget;
			if (!naturalWidth || !naturalHeight) return;
			const scale = Math.min(480 / naturalWidth, 1);
			const width = Math.round(naturalWidth * scale);
			const height = Math.round(naturalHeight * scale);
			updateWidget(widget.id, { w: width, h: height });
		},
		[updateWidget, widget.id],
	);

	const isImageLoaded = widget.type === "image" && widget.content;

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

	const textClass = isSticky ? "" : theme === "dark" ? "" : "";

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
					: isSticky && widget.type !== "image" && widget.type !== "youtube"
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
				isSticky && widget.type !== "image" && widget.type !== "youtube"
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
					<NoteWidget
						content={widget.content}
						theme={theme}
						textClass={textClass}
						onChange={(c) => updateWidget(widget.id, { content: c })}
					/>
				)}
				{widget.type === "image" && (
					<div className="flex flex-col gap-4 w-full h-full items-center justify-center p-4">
						<ImageWidget
							content={widget.content}
							theme={theme}
							onChange={(c) => updateWidget(widget.id, { content: c })}
							onLoad={handleImageLoad}
						/>
					</div>
				)}
				{widget.type === "music" && (
					<MusicWidget
						content={widget.content}
						textClass={textClass}
						onChange={(c) => updateWidget(widget.id, { content: c })}
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
};

export default function PomodoroTimer() {
	const [settings, setSettings] = useLocalStorage(
		"pomodoro-settings",
		DEFAULT_SETTINGS,
	);
	const [_stats, setStats] = useLocalStorage("pomodoro-stats", DEFAULT_STATS);
	const [_sessions, setSessions] = useLocalStorage<PomodoroSession[]>(
		"pomodoro-sessions",
		[],
	);

	const [customSchedule, setCustomSchedule] = useState<ScheduleStep[]>(
		SCHEDULE.map((s) => ({ ...s })),
	);
	const [theme, setTheme] = useState(settings.theme || "dark");
	const [showStopDialog, setShowStopDialog] = useState(false);
	const [showSettingsPanel, setShowSettingsPanel] = useState(false);
	const [settingsTab, setSettingsTab] = useState<
		"workflow" | "dock" | "widgets" | "youtube"
	>("workflow");
	const [dockVisibility, setDockVisibility] = useState({
		note: true,
		image: false,
		music: true,
		timer: true,
		stats: false,
		theme: true,
		settings: true,
	});
	const [widgets, setWidgets] = useLocalStorage<Widget[]>(
		"pomodoro-widgets",
		[],
	);

	const zCounterRef = useRef(BASE_WIDGET_Z);
	const nextZ = useCallback(() => {
		zCounterRef.current = (zCounterRef.current || BASE_WIDGET_Z) + 1;
		return zCounterRef.current;
	}, []);
	useEffect(() => {
		const maxZ =
			widgets.reduce(
				(acc, w) => Math.max(acc, w.zIndex ?? BASE_WIDGET_Z),
				BASE_WIDGET_Z,
			) + 1;
		zCounterRef.current = Math.max(zCounterRef.current, maxZ);
	}, [widgets]);

	const [isDraggingStickyWidget, setIsDraggingStickyWidget] = useState(false);
	const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

	const { requestPermission, showNotification } = useNotifications();

	const seedRef = useRef(123456789);
	const nextSeed = useCallback(() => {
		seedRef.current = (seedRef.current * 1664525 + 1013904223) >>> 0;
		return seedRef.current;
	}, []);
	const nextJitter = useCallback(
		(range: number) => {
			const value = nextSeed() / 0xffffffff;
			return (value - 0.5) * range * 2;
		},
		[nextSeed],
	);
	const nextId = useCallback(() => nextSeed(), [nextSeed]);
	const getDeterministicStickyColor = useCallback(() => {
		const index = nextSeed() % STICKY_NOTE_COLORS.length;
		return STICKY_NOTE_COLORS[index];
	}, [nextSeed]);

	const {
		currentStep,
		totalDuration,
		timeLeft,
		isActive,
		isFinished,
		start,
		pause,
		reset,
		goToNext,
	} = useTimerEngine({
		schedule: customSchedule,
		settings,
		showNotification,
		requestPermission,
		onStatsUpdate: setStats,
		onSessionsUpdate: setSessions,
	});

	const highlightColor = settings.highlightColor ?? DEFAULT_HIGHLIGHT_COLOR;

	const handleTimerClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest(".no-timer-click")) {
			return;
		}

		if (isFinished) {
			goToNext();
		} else if (isActive) {
			setShowStopDialog(true);
		} else {
			requestPermission();
			start();
		}
	};

	const handleStop = () => {
		pause();
		setShowStopDialog(false);
	};

	const handleReset = () => {
		reset();
		setShowStopDialog(false);
	};

	const handleSkip = () => {
		pause();
		setIsFinished(false);
		goToNext();
		setShowStopDialog(false);
	};

	const toggleTheme = () =>
		setTheme((prev) => (prev === "light" ? "dark" : "light"));

	const addWidget = (type: string) => {
		const currentSettings = settings;
		const stickySize = currentSettings.stickyWidgetSize ?? STICKY_NOTE_SIZE;
		const youtubeWidth = currentSettings.youtubeWidgetWidth ?? 400;

		if (type === "music") {
			const id = nextId();
			const newWidget: Widget = {
				id,
				type: "youtube",
				x: window.innerWidth / 2 - youtubeWidth / 2 + nextJitter(40),
				y: window.innerHeight / 2 - 150 + nextJitter(40),
				content: "",
				w: youtubeWidth,
				h: "auto",
				zIndex: nextZ(),
			};
			setWidgets([...widgets, newWidget]);
			return;
		}
		if (type === "stats") {
			const id = nextId();
			const newWidget: Widget = {
				id,
				type: "stats",
				x: window.innerWidth / 2 - 180 + nextJitter(40),
				y: window.innerHeight / 2 - 120 + nextJitter(40),
				content: "",
				w: stickySize,
				h: stickySize,
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
		const initialSize = shouldHaveStickyStyle ? stickySize : undefined;
		const newWidget: Widget = {
			id,
			type,
			x: window.innerWidth / 2 - 150 + nextJitter(40),
			y: window.innerHeight / 2 - 100 + nextJitter(40),
			content,
			w: initialSize,
			h: initialSize,
			color: shouldHaveStickyStyle ? getDeterministicStickyColor() : undefined,
			zIndex: nextZ(),
		};
		setWidgets([...widgets, newWidget]);
	};

	const updateWidget = (id: number, newData: Partial<Widget>) => {
		setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...newData } : w)));
	};

	const removeWidget = (id: number) => {
		setWidgets(widgets.filter((w) => w.id !== id));
	};

	const currentStepProgressPercent = useMemo(() => {
		const durationMs = currentStep.duration * 60 * 1000;
		if (durationMs <= 0) return 0;
		const progress = ((durationMs - timeLeft) / durationMs) * 100;
		return Math.min(100, Math.max(0, progress));
	}, [currentStep.duration, timeLeft]);

	const updateSchedule = (index: number, updates: Partial<ScheduleStep>) => {
		const newSchedule = [...customSchedule];
		newSchedule[index] = { ...newSchedule[index], ...updates };
		setCustomSchedule(newSchedule);
	};

	const addStep = () => {
		const newStep: ScheduleStep = {
			id: nextId(),
			type: "focus",
			duration: 25,
			label: "New Step",
			desc: "",
		};
		setCustomSchedule([...customSchedule, newStep]);
	};

	const removeStep = (index: number) => {
		setCustomSchedule(customSchedule.filter((_, i) => i !== index));
	};

	const updateDockVisibility = (
		key: keyof typeof dockVisibility,
		visible: boolean,
	) => {
		setDockVisibility((prev) => ({ ...prev, [key]: visible }));
	};

	const updateSettings = (updates: Partial<PomodoroSettings>) => {
		setSettings({ ...settings, ...updates });
	};

	return (
		<div
			className={`relative w-full h-screen overflow-hidden transition-colors duration-500 select-none ${
				theme === "dark" ? " " : " "
			}`}
			style={{
				backgroundImage:
					theme === "light"
						? "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1px)"
						: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
				backgroundSize: "24px 24px",
			}}
		>
			{widgets.map((widget) => (
				<Widget
					key={widget.id}
					widget={widget}
					updateWidget={updateWidget}
					removeWidget={removeWidget}
					theme={theme}
					bringToFront={() => updateWidget(widget.id, { zIndex: nextZ() })}
					onDragStart={() => {
						if (isStickyWidgetType(widget.type)) {
							setIsDraggingStickyWidget(true);
						}
					}}
					onDragEnd={() => {
						setIsDraggingStickyWidget(false);
					}}
					pomodoroState={{
						isActive,
						sessionType:
							currentStep.type === "focus" ? "work" : ("shortBreak" as any),
					}}
					stats={_stats}
					sessions={_sessions}
				/>
			))}

			<CurrentStepLabel label={currentStep.label} theme={theme} />

			<CircularTimer
				timeLeft={timeLeft}
				isActive={isActive}
				theme={theme}
				sessionType={currentStep.type}
				durationMinutes={currentStep.duration}
				onClick={handleTimerClick}
			/>

			<WorkflowProgressBar
				schedule={customSchedule}
				currentStepIndex={0}
				currentStepDuration={currentStep.duration}
				currentStepProgressPercent={currentStepProgressPercent}
				totalDuration={totalDuration}
				highlightColor={highlightColor}
				isActive={isActive}
				theme={theme}
				hoveredStepIndex={hoveredStepIndex}
				onHover={setHoveredStepIndex}
			/>

			{isDraggingStickyWidget && <DeleteZone />}

			{showStopDialog && (
				<StopDialog
					theme={theme}
					onClose={() => setShowStopDialog(false)}
					onReset={handleReset}
					onStop={handleStop}
					onSkip={handleSkip}
				/>
			)}

			<Dock theme={theme}>
				{dockVisibility.note && (
					<DockButton
						onClick={() => addWidget("note")}
						icon={StickyNote}
						label="Note"
						theme={theme}
						colorClass=""
					/>
				)}
				{dockVisibility.image && (
					<DockButton
						onClick={() => addWidget("image")}
						icon={ImageIcon}
						label="Image"
						theme={theme}
						colorClass=""
					/>
				)}
				{dockVisibility.music && (
					<DockButton
						onClick={() => addWidget("music")}
						icon={Music}
						label="YouTube"
						theme={theme}
						colorClass=""
					/>
				)}
				{dockVisibility.timer && (
					<DockButton
						onClick={() => addWidget("timer")}
						icon={Timer}
						label="Timer"
						theme={theme}
						colorClass=""
					/>
				)}
				{dockVisibility.stats && (
					<DockButton
						onClick={() => addWidget("stats")}
						icon={BarChart2}
						label="Stats"
						theme={theme}
						colorClass=""
					/>
				)}

				{(dockVisibility.note ||
					dockVisibility.image ||
					dockVisibility.music) &&
					(dockVisibility.theme || true) && (
						<div className="w-px h-8   mx-1 self-center" />
					)}

				{dockVisibility.theme && (
					<DockButton
						onClick={toggleTheme}
						icon={theme === "dark" ? Sun : Moon}
						label="Theme"
						theme={theme}
						colorClass=""
					/>
				)}
				<DockButton
					onClick={() => setShowSettingsPanel(true)}
					icon={Settings}
					label="Settings"
					theme={theme}
					accentColor={highlightColor}
				/>
			</Dock>

			{showSettingsPanel && (
				<SettingsPanel
					theme={theme}
					settings={settings}
					settingsTab={settingsTab}
					customSchedule={customSchedule}
					dockVisibility={dockVisibility}
					highlightColor={highlightColor}
					onTabChange={setSettingsTab}
					onClose={() => setShowSettingsPanel(false)}
					onUpdateSchedule={updateSchedule}
					onAddStep={addStep}
					onRemoveStep={removeStep}
					onUpdateDockVisibility={updateDockVisibility}
					onUpdateSettings={updateSettings}
					nextId={nextId}
				/>
			)}
		</div>
	);
}
