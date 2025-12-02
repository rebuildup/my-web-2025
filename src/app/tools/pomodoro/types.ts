export interface PomodoroSettings {
	workDuration: number; // in minutes
	shortBreakDuration: number; // in minutes
	longBreakDuration: number; // in minutes
	sessionsUntilLongBreak: number;
	notificationSound: boolean;
	notificationVolume: number; // 0-100
	vibration: boolean;
	theme: "light" | "dark";
	autoPlayOnFocusSession?: boolean;
	pauseOnBreak?: boolean;
	youtubeDefaultVolume?: number; // 0-100
	/**
	 * Base size (width & height) for sticky-style widgets (note, image, timer, stats)
	 * in pixels. If not set, falls back to the internal default sticky size.
	 */
	stickyWidgetSize?: number;
	/**
	 * Width for YouTube widgets in pixels.
	 * Height is automatically adjusted based on content.
	 */
	youtubeWidgetWidth?: number;
	/**
	 * Whether newly added YouTube players should loop playback by default.
	 */
	youtubeLoop?: boolean;
	/**
	 * Accent/highlight color used across the UI (hex string).
	 */
	highlightColor?: string;
}

export const DEFAULT_HIGHLIGHT_COLOR = "#3b82f6";

export type PomodoroSessionType =
	| "work"
	| "shortBreak"
	| "longBreak"
	| "focus"
	| "break";

export interface PomodoroSession {
	id: string;
	type: PomodoroSessionType;
	duration: number; // stored in minutes for progressive schedule
	completedAt: string | Date;
	startTime?: string;
	endTime?: string;
	completed?: boolean;
}

export interface PomodoroStats {
	totalSessions: number;
	totalWorkTime: number; // in seconds
	totalBreakTime: number; // in seconds
	completedPomodoros: number;
	currentStreak: number;
	longestStreak: number;
	todaysSessions: number;
}

export type TimerState = "idle" | "running" | "paused" | "completed";
export type SessionType = "work" | "shortBreak" | "longBreak";

// 新しいサイクルシステム: 15分→5分→30分→5分→45分→5分→60分→5分→75分→30分
export const PROGRESSIVE_WORK_DURATIONS = [15, 30, 45, 60, 75]; // in minutes
export const PROGRESSIVE_BREAK_DURATIONS = [5, 5, 5, 5, 30]; // in minutes

export interface TimerDisplay {
	minutes: number;
	seconds: number;
	progress: number; // 0-100
}

export interface NotificationOptions {
	title: string;
	body: string;
	icon?: string;
	requireInteraction?: boolean;
}
