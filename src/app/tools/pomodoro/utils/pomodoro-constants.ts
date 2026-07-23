import type { PomodoroSettings, PomodoroStats } from "../types";
import { DEFAULT_HIGHLIGHT_COLOR } from "../types";

export const STICKY_NOTE_COLORS = [
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

export const STICKY_NOTE_SIZE = 240;

export const STICKY_IMAGE_MAX_WIDTH = 480;

export const STICKY_WIDGET_TYPES = new Set([
	"note",
	"image",
	"youtube",
	"timer",
	"stats",
]);

export const BASE_WIDGET_Z = 60;

export const isStickyWidgetType = (type: string) =>
	STICKY_WIDGET_TYPES.has(type);

export const getStickyColorById = (id: number) =>
	STICKY_NOTE_COLORS[Math.abs(id) % STICKY_NOTE_COLORS.length];

export const hexToRgba = (hex: string, alpha = 1) => {
	const sanitized = hex.replace("#", "");
	const value =
		sanitized.length === 3
			? sanitized
					.split("")
					.map((c) => c + c)
					.join("")
			: sanitized.padEnd(6, "0");
	const intVal = parseInt(value, 16);
	const r = (intVal >> 16) & 255;
	const g = (intVal >> 8) & 255;
	const b = intVal & 255;
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DEFAULT_SETTINGS: PomodoroSettings = {
	workDuration: 25,
	shortBreakDuration: 3,
	longBreakDuration: 15,
	sessionsUntilLongBreak: 4,
	notificationSound: true,
	notificationVolume: 50,
	vibration: true,
	theme: "dark",
	autoPlayOnFocusSession: true,
	pauseOnBreak: true,
	youtubeDefaultVolume: 30,
	stickyWidgetSize: STICKY_NOTE_SIZE,
	youtubeWidgetWidth: 400,
	youtubeLoop: false,
	highlightColor: DEFAULT_HIGHLIGHT_COLOR,
};

export const DEFAULT_STATS: PomodoroStats = {
	totalSessions: 0,
	totalWorkTime: 0,
	totalBreakTime: 0,
	completedPomodoros: 0,
	currentStreak: 0,
	longestStreak: 0,
	todaysSessions: 0,
};

export interface ScheduleStep {
	id: number;
	type: "focus" | "break";
	duration: number;
	label: string;
	desc: string;
}

// Progressive cycle schedule — can be customized
export const SCHEDULE: ScheduleStep[] = [
	{
		id: 1,
		type: "focus",
		duration: 15,
		label: "Warm up",
		desc: "脳のアイドリング運転.メール確認や今日の計画立てなど、軽いタスクから始めましょう.",
	},
	{
		id: 2,
		type: "break",
		duration: 3,
		label: "Short Break",
		desc: "深呼吸をして、画面から目を離しましょう.水分補給を忘れずに.",
	},
	{
		id: 3,
		type: "focus",
		duration: 30,
		label: "Deep Work I",
		desc: "エンジンがかかってきました.主要なタスクの構成を練ったり、着手したりする時間です.",
	},
	{
		id: 4,
		type: "break",
		duration: 3,
		label: "Short Break",
		desc: "立ち上がってストレッチ.血流を良くして次の集中に備えます.",
	},
	{
		id: 5,
		type: "focus",
		duration: 45,
		label: "Deep Work II",
		desc: "集中力がピークに達する時間帯.クリエイティブな作業や複雑な思考を要するタスクに最適です.",
	},
	{
		id: 6,
		type: "break",
		duration: 3,
		label: "Short Break",
		desc: "短い休憩ですが、目を閉じて脳を完全に休めることを意識してください.",
	},
	{
		id: 7,
		type: "focus",
		duration: 60,
		label: "Flow State I",
		desc: "フロー状態への没入.時間はあっという間に過ぎ去ります.通知を切りましょう.",
	},
	{
		id: 8,
		type: "break",
		duration: 5,
		label: "Short Break",
		desc: "最後の大きな波の前の一呼吸.糖分補給も良いかもしれません.",
	},
	{
		id: 9,
		type: "focus",
		duration: 75,
		label: "Flow State II",
		desc: "このセッションの集大成.限界を超えて没頭する、最も生産性の高い時間です.",
	},
	{
		id: 10,
		type: "break",
		duration: 30,
		label: "Long Break",
		desc: "お疲れ様でした.散歩に出るか、食事をとって完全にリフレッシュしてください.",
	},
];

export const getTotalDuration = (schedule: ScheduleStep[]) =>
	schedule.reduce((acc, step) => acc + step.duration, 0);
