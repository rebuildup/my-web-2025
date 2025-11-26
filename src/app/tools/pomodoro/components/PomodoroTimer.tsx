"use client";

import {
	Edit3,
	Image as ImageIcon,
	Moon,
	Music,
	Pause,
	RotateCcw,
	Settings,
	SkipForward,
	StickyNote,
	Sun,
	Timer,
	Trash2,
	Upload,
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
import type {
	PomodoroSession,
	PomodoroSessionType,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import { playNotificationSound } from "../utils/soundPlayer";
import MiniTimer from "./MiniTimer";
import YouTubePlayer from "./youtube/YouTubePlayer";

const STICKY_NOTE_COLORS = [
	"#FFF8B1", // Soft Yellow
	"#FFEFA1", // Vivid Yellow (softer)
	"#FFD9E8", // Pink
	"#FFC9DA", // Tropical Pink
	"#CAE8FF", // Blue
	"#BBDDF8", // Blue Paradise
	"#DAF5C4", // Green
	"#E9FFAF", // Acid Lime
	"#FFD7AA", // Vital Orange
];

const STICKY_NOTE_SIZE = 240;

const STICKY_IMAGE_MAX_WIDTH = 480;

const getRandomStickyColor = () =>
	STICKY_NOTE_COLORS[Math.floor(Math.random() * STICKY_NOTE_COLORS.length)];

const DEFAULT_SETTINGS: PomodoroSettings = {
	workDuration: 25,
	shortBreakDuration: 5,
	longBreakDuration: 15,
	sessionsUntilLongBreak: 4,
	notificationSound: true,
	notificationVolume: 50,
	vibration: true,
	theme: "dark",
	autoPlayOnFocusSession: true,
	pauseOnBreak: true,
	youtubeDefaultVolume: 30,
};

const DEFAULT_STATS: PomodoroStats = {
	totalSessions: 0,
	totalWorkTime: 0,
	totalBreakTime: 0,
	completedPomodoros: 0,
	currentStreak: 0,
	longestStreak: 0,
	todaysSessions: 0,
};

// Schedule based on progressive cycle - can be customized
let SCHEDULE = [
	{
		id: 1,
		type: "focus",
		duration: 15,
		label: "Warm up",
		desc: "脳のアイドリング運転。メール確認や今日の計画立てなど、軽いタスクから始めましょう。",
	},
	{
		id: 2,
		type: "break",
		duration: 5,
		label: "Short Break",
		desc: "深呼吸をして、画面から目を離しましょう。水分補給を忘れずに。",
	},
	{
		id: 3,
		type: "focus",
		duration: 30,
		label: "Deep Work I",
		desc: "エンジンがかかってきました。主要なタスクの構成を練ったり、着手したりする時間です。",
	},
	{
		id: 4,
		type: "break",
		duration: 5,
		label: "Short Break",
		desc: "立ち上がってストレッチ。血流を良くして次の集中に備えます。",
	},
	{
		id: 5,
		type: "focus",
		duration: 45,
		label: "Deep Work II",
		desc: "集中力がピークに達する時間帯。クリエイティブな作業や複雑な思考を要するタスクに最適です。",
	},
	{
		id: 6,
		type: "break",
		duration: 5,
		label: "Short Break",
		desc: "短い休憩ですが、目を閉じて脳を完全に休めることを意識してください。",
	},
	{
		id: 7,
		type: "focus",
		duration: 60,
		label: "Flow State I",
		desc: "フロー状態への没入。時間はあっという間に過ぎ去ります。通知を切りましょう。",
	},
	{
		id: 8,
		type: "break",
		duration: 5,
		label: "Short Break",
		desc: "最後の大きな波の前の一呼吸。糖分補給も良いかもしれません。",
	},
	{
		id: 9,
		type: "focus",
		duration: 75,
		label: "Flow State II",
		desc: "このセッションの集大成。限界を超えて没頭する、最も生産性の高い時間です。",
	},
	{
		id: 10,
		type: "break",
		duration: 30,
		label: "Long Break",
		desc: "お疲れ様でした。散歩に出るか、食事をとって完全にリフレッシュしてください。",
	},
];

const getTotalDuration = (schedule: typeof SCHEDULE) =>
	schedule.reduce((acc, step) => acc + step.duration, 0);

// Dock Component
const Dock = ({
	children,
	theme,
}: {
	children: React.ReactNode;
	theme: string;
}) => {
	const [mouseX, setMouseX] = useState<number | null>(null);
	const dockRef = useRef<HTMLDivElement>(null);

	const handleMouseMove = (e: React.MouseEvent) => {
		if (dockRef.current) {
			const rect = dockRef.current.getBoundingClientRect();
			setMouseX(e.clientX - rect.left);
		}
	};

	const handleMouseLeave = () => {
		setMouseX(null);
	};

	return (
		<div
			className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-40 px-4 h-16 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-end gap-2 transition-all duration-300 no-timer-click
         ${theme === "dark" ? "bg-[#111]/80 border-white/10" : "bg-white/80 border-black/5"}
      `}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			ref={dockRef}
		>
			{React.Children.map(children, (child) => {
				if (React.isValidElement(child)) {
					return (
						<DockItem mouseX={mouseX} theme={theme}>
							{child}
						</DockItem>
					);
				}
				return null;
			})}
		</div>
	);
};

const DockItem = ({
	mouseX,
	children,
	theme,
}: {
	mouseX: number | null;
	children: React.ReactElement;
	theme: string;
}) => {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(40);

	useEffect(() => {
		if (mouseX !== null && ref.current) {
			const iconCenterX = ref.current.offsetLeft + ref.current.offsetWidth / 2;
			const distance = Math.abs(mouseX - iconCenterX);

			const scale = Math.max(1, 2 - distance / 100);
			const newWidth = Math.min(64, Math.max(40, 40 * scale));

			setWidth(newWidth);
		} else {
			setWidth(40);
		}
	}, [mouseX]);

	return (
		<div
			ref={ref}
			style={{ width: `${width}px`, height: `${width}px` }}
			className="relative flex items-center justify-center mb-2 transition-[width,height] duration-100 ease-out will-change-[width,height] rounded-full overflow-hidden"
		>
			{React.cloneElement(children, { size: width * 0.5 })}
		</div>
	);
};

const DockButton = ({
	onClick,
	icon: Icon,
	label,
	theme,
	colorClass,
}: {
	onClick: () => void;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	label: string;
	theme: string;
	colorClass?: string;
}) => (
	<button
		onClick={onClick}
		className={`w-full h-full rounded-full flex items-center justify-center shadow-md transition-colors relative group
      ${theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10"}
      ${colorClass || ""}
    `}
	>
		<Icon
			className={`pointer-events-none ${
				theme === "dark" ? "text-white" : "text-gray-900"
			}`}
		/>
		<span
			className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none
       ${theme === "dark" ? "bg-[#333] text-white" : "bg-white text-black shadow-sm"}
    `}
		>
			{label}
		</span>
	</button>
);

// Markdown Viewer
const MarkdownViewer = ({
	content,
	theme,
}: {
	content: string;
	theme: string;
}) => {
	if (!content)
		return <div className="text-gray-500 opacity-80 italic">Empty note...</div>;

	const lines = content.split("\n");
	return (
		<div className={`space-y-1 text-sm text-gray-900`}>
			{lines.map((line, i) => {
				if (line.startsWith("# "))
					return (
						<h1
							key={i}
							className="text-xl font-bold border-b border-gray-500/20 pb-1 mb-2"
						>
							{line.slice(2)}
						</h1>
					);
				if (line.startsWith("## "))
					return (
						<h2 key={i} className="text-lg font-bold mb-1">
							{line.slice(3)}
						</h2>
					);
				if (line.startsWith("- "))
					return (
						<li key={i} className="ml-4 list-disc">
							{line.slice(2)}
						</li>
					);
				if (line.startsWith("[ ] "))
					return (
						<div key={i} className="flex items-center gap-2">
							<div className="w-3 h-3 border rounded"></div>
							{line.slice(4)}
						</div>
					);
				if (line.startsWith("[x] "))
					return (
						<div key={i} className="flex items-center gap-2">
							<div className="w-3 h-3 border bg-blue-500 rounded flex items-center justify-center text-[8px] text-white">
								✓
							</div>
							<span className="line-through opacity-50">{line.slice(4)}</span>
						</div>
					);

				const boldParts = line.split(/\*\*(.*?)\*\*/g);
				if (boldParts.length > 1) {
					return (
						<p key={i}>
							{boldParts.map((part, j) =>
								j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
							)}
						</p>
					);
				}

				return (
					<p key={i} className="min-h-[1em]">
						{line}
					</p>
				);
			})}
		</div>
	);
};

// Widget Component
const Widget = ({
	widget,
	updateWidget,
	removeWidget,
	theme,
	onDragStart,
	onDragEnd,
	settings,
	pomodoroState,
}: {
	widget: {
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
	updateWidget: (id: number, data: Partial<typeof widget>) => void;
	removeWidget: (id: number) => void;
	theme: string;
	onDragStart?: () => void;
	onDragEnd?: () => void;
	settings?: PomodoroSettings;
	pomodoroState?: {
		isActive: boolean;
		sessionType: "work" | "shortBreak" | "longBreak";
	};
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isEditing, setIsEditing] = useState(
		widget.type === "note" && !widget.content,
	);
	const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

	const isNote = widget.type === "note";
	const isImageSticky = widget.type === "image";
	const isYouTube = widget.type === "youtube";
	const isTimer = widget.type === "timer";
	const isSticky = isNote || isImageSticky || isYouTube || isTimer;

	const widgetRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const onDragStartRef = useRef<(() => void) | undefined>(undefined);
	const onDragEndRef = useRef<(() => void) | undefined>(undefined);

	// Update refs when props change
	useEffect(() => {
		onDragStartRef.current = onDragStart;
		onDragEndRef.current = onDragEnd;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	});

	const handleMouseDown = (e: React.MouseEvent) => {
		// テープ部分（.tape-handle）をクリックした場合のみドラッグ開始
		if (!(e.target as HTMLElement).closest(".tape-handle")) return;
		if ((e.target as HTMLElement).closest(".no-drag")) return;
		setIsDragging(true);
		if (isSticky) {
			onDragStartRef.current?.();
		}
		if (widgetRef.current) {
			const rect = widgetRef.current.getBoundingClientRect();
			setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
		}
	};

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return;
			updateWidget(widget.id, {
				x: e.clientX - dragOffset.x,
				y: e.clientY - dragOffset.y,
			});

			// 削除エリアの判定
			const deleteZone = document.querySelector(".delete-zone");
			if (deleteZone && isSticky) {
				const rect = deleteZone.getBoundingClientRect();
				const isOver =
					e.clientX >= rect.left &&
					e.clientX <= rect.right &&
					e.clientY >= rect.top &&
					e.clientY <= rect.bottom;
				setIsOverDeleteZone(isOver);
				// 削除エリアの視覚的フィードバック
				const indicator = deleteZone.querySelector("#delete-zone-indicator");
				const icon = deleteZone.querySelector("#delete-zone-icon");
				if (indicator && icon) {
					if (isOver) {
						indicator.className =
							"w-64 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all duration-200 bg-transparent border-gray-400/50";
						icon.setAttribute(
							"class",
							"lucide lucide-trash2 text-red-500 transition-all duration-200 scale-150",
						);
					} else {
						indicator.className =
							"w-64 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all duration-200 bg-transparent border-gray-400/30";
						icon.setAttribute(
							"class",
							"lucide lucide-trash2 text-gray-600 opacity-30 transition-all duration-200 scale-100",
						);
					}
				}
			}
		};

		const handleMouseUp = () => {
			if (isDragging && isOverDeleteZone && isSticky) {
				removeWidget(widget.id);
			}
			setIsDragging(false);
			setIsOverDeleteZone(false);
			if (isSticky) {
				onDragEndRef.current?.();
			}
		};

		if (isDragging) {
			window.addEventListener("mousemove", handleMouseMove);
			window.addEventListener("mouseup", handleMouseUp);
		}
		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
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
		updateWidget(widget.id, { zIndex: Date.now() });
	};

	useEffect(() => {
		if (isSticky && !widget.color) {
			updateWidget(widget.id, { color: getRandomStickyColor() });
		}
	}, [isSticky, updateWidget, widget.color, widget.id]);

	const fallbackStickyColor = useMemo(
		() => getRandomStickyColor(),
		[widget.id],
	);
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
			: isSticky
				? STICKY_NOTE_SIZE
				: "auto";

	const numericWidth =
		typeof computedWidth === "number" ? computedWidth : STICKY_NOTE_SIZE;
	const tapeWidth = numericWidth + 40;
	const tapeOffset = isImageSticky ? -10 : -14;
	const stickyContentWrapperClass = isImageSticky
		? "flex-1 w-full h-full no-drag flex items-center justify-center overflow-hidden"
		: "flex-1 w-full h-full no-drag [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-500/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500/30 [&::-webkit-scrollbar-track]:bg-transparent";
	const nonStickyContentWrapperClass = `p-4 overflow-auto no-drag ${
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
			const scale = Math.min(STICKY_IMAGE_MAX_WIDTH / naturalWidth, 1);
			const width = Math.round(naturalWidth * scale);
			const height = Math.round(naturalHeight * scale);
			updateWidget(widget.id, { w: width, h: height });
		},
		[updateWidget, widget.id],
	);

	const isImageLoaded = widget.type === "image" && widget.content;

	let bgClass = "";
	if (isNote) {
		bgClass = "shadow-[0_4px_8px_rgba(0,0,0,0.2)] border border-black/5";
	} else if (isImageSticky) {
		if (isImageLoaded) {
			bgClass = "";
		} else {
			bgClass =
				"shadow-[0_6px_12px_rgba(0,0,0,0.2)] border border-transparent bg-transparent";
		}
	} else if (isTimer) {
		bgClass = "bg-white/95 border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	} else if (isYouTube) {
		bgClass =
			theme === "dark"
				? "bg-[#1a1a1a]/95 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
				: "bg-white/95 border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	} else {
		bgClass =
			theme === "dark"
				? "bg-[#1a1a1a]/90 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
				: "bg-white/90 border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.1)]";
	}

	const textClass = isSticky
		? "text-gray-900"
		: theme === "dark"
			? "text-gray-200"
			: "text-gray-800";

	return (
		<div
			ref={widgetRef}
			onMouseDown={handleFocus}
			style={{
				left: widget.x,
				top: widget.y,
				zIndex: widget.zIndex || 1,
				width: computedWidth,
				height: computedHeight,
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
						: "rounded-xl border backdrop-blur-md"
			} ${isOverDeleteZone ? "opacity-50 scale-95" : ""}`}
		>
			{/* メモ帳の場合はテープ風のハンドル */}
			{isSticky && (
				<div
					onMouseDown={handleMouseDown}
					className="tape-handle absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing flex justify-center"
					style={{
						top: `${tapeOffset}px`,
						width: `${tapeWidth}px`,
						zIndex: (widget.zIndex || 1) + 5,
					}}
				>
					<div
						className="h-8 bg-center bg-cover w-44"
						style={{ backgroundImage: "url('/images/sticky-tape.png')" }}
					></div>
				</div>
			)}

			{/* 他のウィジェットタイプのヘッダー */}
			{!isSticky && (
				<div
					onMouseDown={handleMouseDown}
					className={`h-8 flex items-center justify-between px-2 cursor-grab border-b ${theme === "dark" ? "border-white/5" : "border-black/5"}`}
				>
					<div className="flex items-center gap-2 opacity-50">
						{widget.type === "image" && <ImageIcon size={14} />}
						{widget.type === "music" && <Music size={14} />}
						<span className="text-xs font-bold uppercase tracking-wider">
							{widget.type}
						</span>
					</div>
					<div className="flex items-center gap-1 no-drag">
						<button
							onClick={() => removeWidget(widget.id)}
							className="p-1 rounded hover:bg-red-500/20 text-red-500 hover:text-red-600 transition-colors"
						>
							<X size={12} />
						</button>
					</div>
				</div>
			)}

			<div className={contentWrapperClass} style={contentWrapperStyle}>
				{widget.type === "note" &&
					(isEditing ? (
						<textarea
							ref={textareaRef}
							className={`w-full h-full bg-transparent resize-none outline-none font-mono text-sm ${textClass} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-500/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500/30 [&::-webkit-scrollbar-track]:bg-transparent`}
							placeholder="# Title&#10;- List item&#10;**Bold text**"
							value={widget.content || ""}
							onChange={(e) =>
								updateWidget(widget.id, { content: e.target.value })
							}
							onBlur={() => {
								// キャレットが外れたときに自動でプレビュー表示に
								setIsEditing(false);
							}}
							autoFocus
						/>
					) : (
						<div
							className="h-full cursor-text"
							onClick={() => setIsEditing(true)}
						>
							<MarkdownViewer content={widget.content} theme={theme} />
						</div>
					))}
				{widget.type === "image" && (
					<div className="flex flex-col gap-4 w-full h-full items-center justify-center p-4">
						{!widget.content ? (
							<div
								className={`w-full flex flex-col gap-3 p-6 rounded-xl backdrop-blur-md shadow-lg ${
									theme === "dark"
										? "bg-[#222]/90 border border-white/10"
										: "bg-white/90 border border-black/5"
								}`}
							>
								<input
									type="text"
									placeholder="Paste image URL..."
									className={`w-full bg-transparent border-b p-2 text-sm outline-none transition-colors ${
										theme === "dark"
											? "border-white/20 text-white placeholder-white/50 focus:border-white/80"
											: "border-black/20 text-black placeholder-black/50 focus:border-black/80"
									}`}
									onKeyDown={(e) => {
										if (e.key === "Enter")
											updateWidget(widget.id, {
												content: e.currentTarget.value,
											});
									}}
								/>
								<div
									className={`text-center text-[10px] font-bold uppercase tracking-widest ${
										theme === "dark" ? "text-white/40" : "text-black/40"
									}`}
								>
									OR
								</div>
								<label
									className={`cursor-pointer flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed transition-all ${
										theme === "dark"
											? "border-white/30 hover:bg-white/10 text-gray-200"
											: "border-black/30 hover:bg-black/5 text-gray-800"
									}`}
								>
									<Upload size={16} />
									<span className="text-xs font-medium">Upload File</span>
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												const reader = new FileReader();
												reader.onloadend = () => {
													updateWidget(widget.id, {
														content: reader.result as string,
													});
												};
												reader.readAsDataURL(file);
											}
										}}
									/>
								</label>
							</div>
						) : (
							<div className="relative group w-full h-full flex items-center justify-center">
								<img
									src={widget.content}
									alt="Widget"
									className="w-full h-full object-contain pointer-events-none select-none rounded-lg"
									onLoad={handleImageLoad}
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://via.placeholder.com/300?text=Image+Error";
									}}
								/>
								<button
									onClick={() => updateWidget(widget.id, { content: "" })}
									className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
								>
									<Edit3 size={14} />
								</button>
							</div>
						)}
					</div>
				)}
				{widget.type === "music" && (
					<div className="w-full h-[152px] overflow-hidden rounded-b-xl">
						<iframe
							width="100%"
							height="100%"
							src={`https://www.youtube.com/embed/${widget.content || "jfKfPfyJRdk"}?controls=0&autoplay=0`}
							title="Music Player"
							frameBorder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						></iframe>
						<div className="p-2 flex gap-2 justify-center no-drag">
							<input
								type="text"
								placeholder="YouTube Video ID"
								className={`text-[10px] text-center bg-transparent opacity-30 hover:opacity-100 outline-none transition-opacity ${textClass}`}
								onKeyDown={(e) => {
									if (e.key === "Enter")
										updateWidget(widget.id, {
											content: e.currentTarget.value,
										});
								}}
							/>
						</div>
					</div>
				)}
				{widget.type === "youtube" && (
					<YouTubePlayer
						onClose={() => removeWidget(widget.id)}
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
						// Pass new settings
						autoPlayOnFocusSession={settings?.autoPlayOnFocusSession ?? true}
						pauseOnBreak={settings?.pauseOnBreak ?? true}
						defaultVolume={settings?.youtubeDefaultVolume ?? 30}
					/>
				)}
				{widget.type === "timer" && (
					<MiniTimer id={widget.id} theme={theme as "light" | "dark"} />
				)}
			</div>
		</div>
	);
};

export default function PomodoroTimer() {
	const [settings] = useLocalStorage("pomodoro-settings", DEFAULT_SETTINGS);
	const [_stats, setStats] = useLocalStorage("pomodoro-stats", DEFAULT_STATS);
	const [_sessions, setSessions] = useLocalStorage<PomodoroSession[]>(
		"pomodoro-sessions",
		[],
	);

	const [currentStepIndex, setCurrentStepIndex] = useLocalStorage(
		"pomodoro-current-step",
		0,
	);
	const [customSchedule, setCustomSchedule] = useState(SCHEDULE);
	const [savedTime, setSavedTime] = useLocalStorage("pomodoro-time-left", -1);
	const [timeLeft, setTimeLeft] = useState(() => {
		if (savedTime !== -1) return savedTime;
		return customSchedule[0].duration * 60 * 1000;
	});
	const [isActive, setIsActive] = useState(false);
	const [isFinished, setIsFinished] = useState(false);
	const [theme, setTheme] = useState(settings.theme || "dark");
	const [showStopDialog, setShowStopDialog] = useState(false);
	const [showSettingsPanel, setShowSettingsPanel] = useState(false);
	const [settingsTab, setSettingsTab] = useState<"workflow" | "dock">(
		"workflow",
	);
	const [dockVisibility, setDockVisibility] = useState({
		note: true,
		image: true,
		music: true,
		timer: true,
		theme: true,
		settings: true,
	});
	const [widgets, setWidgets] = useLocalStorage<
		Array<{
			id: number;
			type: string;
			x: number;
			y: number;
			content: string;
			zIndex?: number;
			w?: number;
			h?: number | string;
			color?: string;
		}>
	>("pomodoro-widgets", []);
	const [isDraggingNote, setIsDraggingNote] = useState(false);
	const [hoveredStepIndex, setHoveredStepIndex] = useState<number | null>(null);

	const startTimeRef = useRef<number | null>(null);
	const savedTimeRef = useRef(0);
	const requestRef = useRef<number | null>(null);
	const { requestPermission, showNotification } = useNotifications();

	const currentStep = customSchedule[currentStepIndex];
	const totalDuration = getTotalDuration(customSchedule);
	const currentStepRef = useRef(currentStep);
	const settingsRef = useRef(settings);
	const showNotificationRef = useRef(showNotification);
	const setSessionsRef = useRef(setSessions);
	const setStatsRef = useRef(setStats);
	const autoStartNextRef = useRef(false);

	// Keep refs up to date
	useEffect(() => {
		currentStepRef.current = currentStep;
		settingsRef.current = settings;
		showNotificationRef.current = showNotification;
		setSessionsRef.current = setSessions;
		setStatsRef.current = setStats;
	}, [currentStep, settings, showNotification, setSessions, setStats]);

	// Timer Logic with requestAnimationFrame
	const animate = useCallback((time: number) => {
		if (!startTimeRef.current) startTimeRef.current = time;
		const elapsed = time - startTimeRef.current;
		const step = currentStepRef.current;
		const newTimeLeft = Math.max(
			step.duration * 60 * 1000 - savedTimeRef.current - elapsed,
			0,
		);

		setTimeLeft(newTimeLeft);

		if (newTimeLeft <= 0) {
			setIsFinished(true);
			setIsActive(false);
			startTimeRef.current = null;
			savedTimeRef.current = 0;

			// Play sound
			if (settingsRef.current.notificationSound) {
				const normalizedVolume = Math.min(
					1,
					Math.max(0, settingsRef.current.notificationVolume / 100),
				);
				playNotificationSound(normalizedVolume);
			}

			// Vibration
			if (settingsRef.current.vibration && navigator.vibrate) {
				navigator.vibrate([200, 100, 200]);
			}

			// Update stats
			setStatsRef.current((prev) => {
				const newStats = { ...prev };
				if (step.type === "focus") {
					newStats.completedPomodoros += 1;
					newStats.totalWorkTime += step.duration;
					newStats.todaysSessions += 1; // Simple increment, ideally check date
				} else {
					newStats.totalBreakTime += step.duration;
				}
				newStats.totalSessions += 1;
				return newStats;
			});

			// Update sessions log
			setSessionsRef.current((prev) => {
				const completedAt = new Date();
				return [
					...prev,
					{
						id: completedAt.getTime().toString(),
						type: step.type as PomodoroSessionType,
						startTime: new Date(
							completedAt.getTime() - step.duration * 60000,
						).toISOString(),
						endTime: completedAt.toISOString(),
						duration: step.duration,
						completed: true,
						completedAt: completedAt.toISOString(),
					},
				];
			});

			// Show notification
			showNotificationRef.current({
				title: step.type === "focus" ? "Work Session Complete!" : "Break Over!",
				body:
					step.type === "focus"
						? "Time to take a break."
						: "Time to get back to work.",
			});
		} else {
			requestRef.current = requestAnimationFrame(animate);
		}
	}, []);

	useEffect(() => {
		if (isActive) {
			requestRef.current = requestAnimationFrame(animate);
		} else {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
			startTimeRef.current = null;
			if (!isFinished) {
				savedTimeRef.current = currentStep.duration * 60 * 1000 - timeLeft;
			}
		}
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [isActive, currentStep.duration, animate, isFinished]);

	// Persist timeLeft logic
	const timeLeftRef = useRef(timeLeft);
	const prevStepIndexRef = useRef(currentStepIndex);

	useEffect(() => {
		timeLeftRef.current = timeLeft;
	}, [timeLeft]);

	// Save time periodically
	useEffect(() => {
		// Save immediately when pausing or finishing
		if (!isActive) {
			setSavedTime(timeLeft);
			return;
		}

		// Save every second while active
		const interval = setInterval(() => {
			setSavedTime(timeLeftRef.current);
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, setSavedTime, timeLeft]); // timeLeft dependency for pause case

	useEffect(() => {
		// Only reset time if step actually changed
		if (prevStepIndexRef.current !== currentStepIndex) {
			const newDuration = customSchedule[currentStepIndex].duration * 60 * 1000;
			const shouldAutoStart = autoStartNextRef.current;
			autoStartNextRef.current = false;

			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
			startTimeRef.current = null;
			setIsFinished(false);

			// Reset saved time in storage when step changes
			setSavedTime(newDuration);

			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
				requestRef.current = null;
			}

			setIsActive(shouldAutoStart);
			prevStepIndexRef.current = currentStepIndex;
		}
	}, [currentStepIndex, customSchedule, setSavedTime]);

	useEffect(() => {
		if (!isFinished || customSchedule.length === 0) return;

		const nextIndex =
			currentStepIndex < customSchedule.length - 1 ? currentStepIndex + 1 : 0;

		// Set autoStartNextRef to true BEFORE changing the step
		autoStartNextRef.current = true;

		// Use setTimeout to ensure the ref is set before the step change triggers
		setTimeout(() => {
			setCurrentStepIndex(nextIndex);
		}, 0);
	}, [isFinished, currentStepIndex, customSchedule.length]);

	// ワークフロー変更時に自動適用（タイマーが停止中の場合のみ）
	useEffect(() => {
		if (!isActive && currentStepIndex < customSchedule.length) {
			const newDuration = customSchedule[currentStepIndex].duration * 60 * 1000;
			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
		}
		if (currentStepIndex >= customSchedule.length) {
			setCurrentStepIndex(0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [customSchedule]);

	const handleTimerClick = (e: React.MouseEvent) => {
		if ((e.target as HTMLElement).closest(".no-timer-click")) {
			return;
		}

		if (isFinished) {
			handleNext();
		} else if (isActive) {
			// 実行中は停止ダイアログを表示
			setShowStopDialog(true);
		} else {
			// 停止中は開始
			requestPermission();
			setIsActive(true);
		}
	};

	const handleStop = () => {
		setIsActive(false);
		setShowStopDialog(false);
	};

	const handleReset = () => {
		setIsActive(false);
		setIsFinished(false);
		setCurrentStepIndex(0);
		setTimeLeft(customSchedule[0].duration * 60 * 1000);
		savedTimeRef.current = 0;
		startTimeRef.current = null;
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
			requestRef.current = null;
		}
		setShowStopDialog(false);
	};

	const handleSkip = () => {
		setIsActive(false);
		setIsFinished(false);
		handleNext();
		setShowStopDialog(false);
	};

	const handleNext = () => {
		if (currentStepIndex < customSchedule.length - 1) {
			setCurrentStepIndex((prev) => prev + 1);
		} else {
			setCurrentStepIndex(0);
		}
	};

	const toggleTheme = () =>
		setTheme((prev) => (prev === "light" ? "dark" : "light"));

	const addWidget = (type: string) => {
		if (type === "music") {
			const id = Date.now();
			const newWidget = {
				id,
				type: "youtube",
				x: window.innerWidth / 2 - 200 + (Math.random() * 40 - 20),
				y: window.innerHeight / 2 - 150 + (Math.random() * 40 - 20),
				content: "",
				w: 400,
				h: "auto",
			};
			setWidgets([...widgets, newWidget]);
			return;
		}
		const id = Date.now();
		const content = "";
		const shouldHaveStickyStyle = type === "note" || type === "image";
		const initialSize = shouldHaveStickyStyle ? STICKY_NOTE_SIZE : undefined;
		const newWidget = {
			id,
			type,
			x: window.innerWidth / 2 - 150 + (Math.random() * 40 - 20),
			y: window.innerHeight / 2 - 100 + (Math.random() * 40 - 20),
			content,
			w: initialSize,
			h: initialSize,
			color: shouldHaveStickyStyle ? getRandomStickyColor() : undefined,
		};
		setWidgets([...widgets, newWidget]);
	};

	const updateWidget = (id: number, newData: Partial<(typeof widgets)[0]>) => {
		setWidgets(widgets.map((w) => (w.id === id ? { ...w, ...newData } : w)));
	};

	const removeWidget = (id: number) => {
		setWidgets(widgets.filter((w) => w.id !== id));
	};

	// Time Formatter
	const formatTime = (ms: number) => {
		const totalSeconds = Math.floor(ms / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const milliseconds = Math.floor((ms % 1000) / 10);

		return (
			<div
				className={`flex items-baseline justify-center tabular-nums tracking-[-0.15em] select-none cursor-pointer font-mono font-bold transition-opacity duration-300
        ${theme === "dark" ? "text-neutral-100" : "text-slate-900"}
        ${isActive ? "opacity-100" : "opacity-60 hover:opacity-80"}
      `}
			>
				<span className="text-8xl leading-none text-right w-auto min-w-18">
					{String(minutes).padStart(2, "0")}
				</span>
				<span
					className={`text-8xl leading-none -mx-1.25 -translate-y-0.75 ${isActive ? "animate-pulse" : "opacity-50"}`}
				>
					:
				</span>
				<span className="text-8xl leading-none text-left w-auto min-w-18">
					{String(seconds).padStart(2, "0")}
				</span>
				<span className="text-2xl leading-none ml-0.75 w-14 opacity-40 font-medium self-end mb-2.5">
					.{String(milliseconds).padStart(2, "0")}
				</span>
			</div>
		);
	};

	const progressPercent = useMemo(() => {
		const totalDuration = currentStep.duration * 60 * 1000;
		return Math.min(
			100,
			Math.max(0, ((totalDuration - timeLeft) / totalDuration) * 100),
		);
	}, [timeLeft, currentStep.duration]);

	return (
		<div
			className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${
				theme === "dark"
					? "bg-[#050505] text-gray-100"
					: "bg-[#f5f5f7] text-gray-900"
			}`}
			style={{
				backgroundImage:
					theme === "light"
						? "radial-gradient(#e5e5e5 1px, transparent 1px)"
						: "radial-gradient(#1a1a1a 1px, transparent 1px)",
				backgroundSize: "24px 24px",
			}}
		>
			{/* Widgets */}
			{widgets.map((widget) => (
				<Widget
					key={widget.id}
					widget={widget}
					updateWidget={updateWidget}
					removeWidget={removeWidget}
					theme={theme}
					onDragStart={() => {
						if (widget.type === "note") setIsDraggingNote(true);
					}}
					onDragEnd={() => {
						setIsDraggingNote(false);
					}}
					pomodoroState={{
						isActive,
						sessionType:
							currentStep.type === "focus" ? "work" : ("shortBreak" as any),
					}}
				/>
			))}

			{/* Top: Current Step Label - Fixed */}
			<div
				className={`fixed top-8 left-1/2 -translate-x-1/2 z-30 text-sm tracking-[0.4em] uppercase font-bold opacity-30 pointer-events-none
           ${theme === "dark" ? "text-white" : "text-black"}
        `}
			>
				{currentStep.label}
			</div>

			{/* Center: Main Timer with circular progress */}
			<div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
				<div
					className="relative flex items-center justify-center"
					style={{ width: "500px", height: "500px" }}
				>
					{/* Background circle */}
					<svg
						className="absolute inset-0 w-full h-full"
						viewBox="0 0 100 100"
						aria-hidden="true"
						style={{ transform: "rotate(90deg) scaleX(-1)" }}
					>
						<circle
							cx="50"
							cy="50"
							r="45"
							stroke={theme === "dark" ? "#555" : "#ddd"}
							strokeWidth="3"
							fill="none"
						/>
						<circle
							cx="50"
							cy="50"
							r="45"
							stroke={
								currentStep.type === "focus"
									? theme === "dark"
										? "rgba(255, 255, 255, 0.5)"
										: "rgba(0, 0, 0, 0.5)"
									: theme === "dark"
										? "rgba(14, 165, 233, 0.5)"
										: "rgba(59, 130, 246, 0.5)"
							}
							strokeWidth="3"
							fill="none"
							strokeDasharray={Math.PI * 2 * 45}
							strokeDashoffset={Math.PI * 2 * 45 * (progressPercent / 100)}
							strokeLinecap="butt"
						/>
					</svg>
					<button
						onClick={handleTimerClick}
						className="relative group pointer-events-auto focus:outline-none"
						style={{ zIndex: 50 }}
					>
						{formatTime(timeLeft)}
					</button>
				</div>
			</div>

			{/* Left Panel: Flow Progress Bar */}
			<aside
				className={`fixed left-8 top-1/2 transform -translate-y-1/2 z-20 flex flex-col items-start gap-4 transition-opacity duration-500 no-timer-click
         ${isActive ? "opacity-20 hover:opacity-100" : "opacity-100"}
      `}
			>
				<div
					className="relative flex flex-col items-center h-[60vh] w-1.5 rounded-full bg-opacity-20 backdrop-blur-sm transition-all duration-300 hover:w-2"
					style={{
						backgroundColor:
							theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
					}}
				>
					{customSchedule.map((step, index) => {
						const heightPercent = (step.duration / totalDuration) * 100;
						const isCurrent = index === currentStepIndex;
						const isPast = index < currentStepIndex;
						const isHovered = hoveredStepIndex === index;
						const barColor =
							step.type === "focus"
								? theme === "dark"
									? "#3b82f6"
									: "#2563eb"
								: theme === "dark"
									? "#0ea5e9"
									: "#06b6d4";

						const hoverPaddingLeft = 28;
						const hoverPaddingRight = 24;

						return (
							<div
								key={step.id}
								className="relative w-full border-b border-transparent last:border-0"
								style={{ height: `${heightPercent}%` }}
							>
								<div
									className="absolute inset-y-0"
									style={{
										left: -hoverPaddingLeft,
										right: -hoverPaddingRight,
									}}
								>
									<div
										className="w-full h-full cursor-pointer"
										onMouseEnter={() => setHoveredStepIndex(index)}
										onMouseLeave={() =>
											setHoveredStepIndex((prev) =>
												prev === index ? null : prev,
											)
										}
									/>
								</div>
								<div className="absolute inset-0 flex justify-center pointer-events-none">
									<div className="relative w-full h-full">
										{/* 一定の色で表示（過去のステップ） */}
										<div
											className="absolute inset-0 w-full h-full transition-opacity duration-300"
											style={{
												backgroundColor: isPast ? barColor : "transparent",
												opacity: isPast ? 0.4 : 0,
											}}
										/>

										{/* ホバー時に灰色で明るく表示 */}
										<div
											className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"} ${
												theme === "dark" ? "bg-gray-400/30" : "bg-gray-600/20"
											}`}
										/>

										{isCurrent && (
											<div
												className="absolute top-0 left-0 w-full transition-all duration-75 ease-linear shadow-[0_0_15px_rgba(59,130,246,0.5)]"
												style={{
													height: `${progressPercent}%`,
													backgroundColor: barColor,
												}}
											/>
										)}
									</div>
								</div>

								<div
									className={`absolute top-1/2 -translate-y-1/2 w-48 p-2 rounded-lg backdrop-blur-md border transition-all duration-300 pointer-events-none shadow-xl z-50 ${
										isHovered
											? "opacity-100 translate-x-0"
											: "opacity-0 translate-x-[-10px]"
									}
                    ${theme === "dark" ? "bg-[#1a1a1a]/90 border-white/10 text-gray-100" : "bg-white/90 border-black/5 text-gray-800"}
                 `}
									style={{
										left: `calc(50% + ${hoverPaddingRight}px)`,
									}}
								>
									<div className="flex items-center justify-between">
										<span
											className={`text-xs font-bold uppercase tracking-wider ${step.type === "focus" ? "text-blue-400" : "text-sky-400"}`}
										>
											{step.label}
										</span>
										<span className="text-[10px] font-mono opacity-50">
											{step.duration} min
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</aside>

			{/* Delete Zone - ドックの上、ドラッグ中のみ表示 */}
			{isDraggingNote && (
				<div className="delete-zone fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
					<div
						id="delete-zone-indicator"
						className="w-64 h-24 rounded-2xl border-4 border-dashed flex items-center justify-center transition-all duration-200 bg-transparent border-gray-400/30"
					>
						<Trash2
							id="delete-zone-icon"
							size={32}
							className="text-gray-600 opacity-30 transition-all duration-200 scale-100"
						/>
					</div>
				</div>
			)}

			{/* Stop Dialog */}
			{showStopDialog && (
				<div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto">
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setShowStopDialog(false)}
					/>
					{/* Dialog */}
					<div
						className={`relative z-10 rounded-2xl border backdrop-blur-xl shadow-2xl p-6 max-w-md w-full mx-4 ${
							theme === "dark"
								? "bg-[#1a1a1a]/95 border-white/10"
								: "bg-white/95 border-black/5"
						}`}
					>
						<button
							onClick={() => setShowStopDialog(false)}
							className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
								theme === "dark"
									? "hover:bg-white/10 text-gray-400 hover:text-white"
									: "hover:bg-black/5 text-gray-500 hover:text-black"
							}`}
						>
							<X size={20} />
						</button>

						<h3
							className={`text-xl font-bold mb-4 ${
								theme === "dark" ? "text-white" : "text-black"
							}`}
						>
							タイマーを停止しますか？
						</h3>
						<div className="grid grid-cols-3 gap-3">
							<button
								onClick={handleReset}
								className="px-2 py-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
							>
								<RotateCcw size={24} />
								<span className="text-xs">リセット</span>
							</button>
							<button
								onClick={handleStop}
								className="px-2 py-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
							>
								<Pause size={24} />
								<span className="text-xs">一時停止</span>
							</button>
							<button
								onClick={handleSkip}
								className="px-2 py-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
							>
								<SkipForward size={24} />
								<span className="text-xs">スキップ</span>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Bottom Dock */}
			<Dock theme={theme}>
				{dockVisibility.note && (
					<DockButton
						onClick={() => addWidget("note")}
						icon={StickyNote}
						label="Note"
						theme={theme}
						colorClass="hover:text-blue-500"
					/>
				)}
				{dockVisibility.image && (
					<DockButton
						onClick={() => addWidget("image")}
						icon={ImageIcon}
						label="Image"
						theme={theme}
						colorClass="hover:text-sky-500"
					/>
				)}
				{dockVisibility.music && (
					<DockButton
						onClick={() => addWidget("music")}
						icon={Music}
						label="YouTube"
						theme={theme}
						colorClass="hover:text-red-500"
					/>
				)}
				{dockVisibility.timer && (
					<DockButton
						onClick={() => addWidget("timer")}
						icon={Timer}
						label="Timer"
						theme={theme}
						colorClass="hover:text-green-500"
					/>
				)}

				{(dockVisibility.note ||
					dockVisibility.image ||
					dockVisibility.music) &&
					(dockVisibility.theme || true) && (
						<div className="w-px h-8 bg-current opacity-10 mx-1 self-center" />
					)}

				{dockVisibility.theme && (
					<DockButton
						onClick={toggleTheme}
						icon={theme === "dark" ? Sun : Moon}
						label="Theme"
						theme={theme}
						colorClass="hover:text-yellow-500"
					/>
				)}
				<DockButton
					onClick={() => setShowSettingsPanel(true)}
					icon={Settings}
					label="Settings"
					theme={theme}
					colorClass="hover:text-purple-500"
				/>
			</Dock>

			{/* Settings Panel */}
			{showSettingsPanel && (
				<div className="fixed inset-0 z-100 flex items-center justify-center pointer-events-auto">
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => setShowSettingsPanel(false)}
					/>
					{/* Panel */}
					<div
						className={`relative z-10 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-6xl w-full mx-4 h-[600px] overflow-hidden flex flex-row ${
							theme === "dark"
								? "bg-[#1a1a1a]/95 border-white/10"
								: "bg-white/95 border-black/5"
						}`}
					>
						{/* Left Sidebar - Tabs */}
						<div
							className={`w-64 border-r flex flex-col shrink-0 ${
								theme === "dark" ? "border-white/10" : "border-black/5"
							}`}
						>
							<div
								className={`flex items-center justify-between p-4 border-b shrink-0 ${
									theme === "dark" ? "border-white/10" : "border-black/5"
								}`}
							>
								<h2
									className={`text-xl font-bold ${
										theme === "dark" ? "text-white" : "text-black"
									}`}
								>
									設定
								</h2>
								<button
									onClick={() => setShowSettingsPanel(false)}
									className={`p-2 rounded-lg transition-colors ${
										theme === "dark"
											? "hover:bg-white/10 text-gray-300"
											: "hover:bg-gray-100 text-gray-700"
									}`}
								>
									<X size={20} />
								</button>
							</div>
							<div className="flex-1 overflow-y-auto p-2 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-500/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500/30 [&::-webkit-scrollbar-track]:bg-transparent">
								<button
									onClick={() => setSettingsTab("workflow")}
									className={`w-full text-left px-4 py-3 rounded-lg transition-colors mb-1 ${
										settingsTab === "workflow"
											? theme === "dark"
												? "bg-white/10 text-white"
												: "bg-gray-100 text-black"
											: theme === "dark"
												? "hover:bg-white/5 text-gray-300"
												: "hover:bg-gray-50 text-gray-700"
									}`}
								>
									ワークフロー
								</button>
								<button
									onClick={() => setSettingsTab("dock")}
									className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
										settingsTab === "dock"
											? theme === "dark"
												? "bg-white/10 text-white"
												: "bg-gray-100 text-black"
											: theme === "dark"
												? "hover:bg-white/5 text-gray-300"
												: "hover:bg-gray-50 text-gray-700"
									}`}
								>
									ドック
								</button>
							</div>
						</div>

						{/* Right Content */}
						<div className="flex-1 overflow-y-auto p-6 min-h-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-500/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500/30 [&::-webkit-scrollbar-track]:bg-transparent">
							{settingsTab === "workflow" && (
								<div>
									<h3
										className={`text-lg font-semibold mb-4 ${
											theme === "dark" ? "text-white" : "text-black"
										}`}
									>
										ワークフローの編集
									</h3>
									<div className="space-y-2">
										{customSchedule.map((step, index) => (
											<div
												key={step.id}
												className={`flex items-center gap-2 p-2 rounded border ${
													theme === "dark"
														? "bg-white/5 border-white/10"
														: "bg-gray-50 border-gray-200"
												}`}
											>
												<input
													type="text"
													value={step.label}
													onChange={(e) => {
														const newSchedule = [...customSchedule];
														newSchedule[index] = {
															...step,
															label: e.target.value,
														};
														setCustomSchedule(newSchedule);
													}}
													className={`flex-1 px-2 py-1.5 rounded bg-transparent border text-sm ${
														theme === "dark"
															? "border-white/20 text-white"
															: "border-gray-300 text-black"
													}`}
													placeholder="ラベル"
												/>
												<input
													type="number"
													min="1"
													value={step.duration}
													onChange={(e) => {
														const newSchedule = [...customSchedule];
														newSchedule[index] = {
															...step,
															duration: parseInt(e.target.value) || 1,
														};
														setCustomSchedule(newSchedule);
													}}
													className={`w-16 px-2 py-1.5 rounded bg-transparent border text-sm ${
														theme === "dark"
															? "border-white/20 text-white"
															: "border-gray-300 text-black"
													}`}
												/>
												<span
													className={`text-xs ${
														theme === "dark" ? "text-gray-400" : "text-gray-600"
													}`}
												>
													分
												</span>
												<select
													value={step.type}
													onChange={(e) => {
														const newSchedule = [...customSchedule];
														newSchedule[index] = {
															...step,
															type: e.target.value as "focus" | "break",
														};
														setCustomSchedule(newSchedule);
													}}
													className={`px-2 py-1.5 rounded bg-transparent border text-sm appearance-none cursor-pointer ${
														theme === "dark"
															? "border-white/20 text-white bg-[#1a1a1a]"
															: "border-gray-300 text-black bg-white"
													}`}
													style={{
														backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='${theme === "dark" ? "white" : "black"}' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
														backgroundRepeat: "no-repeat",
														backgroundPosition: "right 0.5rem center",
														paddingRight: "2rem",
													}}
												>
													<option value="focus">作業</option>
													<option value="break">休憩</option>
												</select>
												<button
													onClick={() => {
														const newSchedule = customSchedule.filter(
															(_, i) => i !== index,
														);
														setCustomSchedule(newSchedule);
													}}
													className="p-1 text-red-500 hover:bg-red-500/20 rounded transition-colors shrink-0"
												>
													<X size={14} />
												</button>
											</div>
										))}
										<button
											onClick={() => {
												const newStep = {
													id: Date.now(),
													type: "focus" as const,
													duration: 25,
													label: "New Step",
													desc: "",
												};
												setCustomSchedule([...customSchedule, newStep]);
											}}
											className={`w-full py-3 rounded-lg border border-dashed transition-colors ${
												theme === "dark"
													? "border-white/20 hover:bg-white/5 text-gray-300"
													: "border-gray-300 hover:bg-gray-50 text-gray-700"
											}`}
										>
											+ ステップを追加
										</button>
									</div>
								</div>
							)}

							{settingsTab === "dock" && (
								<div>
									<h3
										className={`text-lg font-semibold mb-4 ${
											theme === "dark" ? "text-white" : "text-black"
										}`}
									>
										ドックの表示設定
									</h3>
									<div className="space-y-2">
										{Object.entries(dockVisibility)
											.filter(([key]) => key !== "settings")
											.map(([key, value]) => (
												<label
													key={key}
													className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
														theme === "dark"
															? "hover:bg-white/5"
															: "hover:bg-gray-50"
													}`}
												>
													<input
														type="checkbox"
														checked={value as boolean}
														onChange={(e) =>
															setDockVisibility((prev) => ({
																...prev,
																[key]: e.target.checked,
															}))
														}
														className="w-4 h-4 rounded"
													/>
													<span
														className={`text-sm ${
															theme === "dark"
																? "text-gray-300"
																: "text-gray-700"
														}`}
													>
														{key === "note"
															? "メモ"
															: key === "image"
																? "画像"
																: key === "music"
																	? "音楽"
																	: key === "theme"
																		? "テーマ"
																		: "設定"}
													</span>
												</label>
											))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
