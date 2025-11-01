"use client";

import {
	BarChart3,
	Pause,
	Play,
	Settings,
	SkipForward,
	Square,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useNotifications } from "../hooks/useNotifications";
import type {
	PomodoroSession,
	PomodoroSettings,
	PomodoroStats,
	SessionType,
	TimerState,
} from "../types";
import SettingsPanel from "./SettingsPanel";
import StatsPanel from "./StatsPanel";
import TimerDisplay from "./TimerDisplay";

const DEFAULT_SETTINGS: PomodoroSettings = {
	workDuration: 25,
	shortBreakDuration: 5,
	longBreakDuration: 15,
	sessionsUntilLongBreak: 4,
	autoStartBreaks: false,
	autoStartPomodoros: false,
	notificationSound: true,
	notificationVolume: 50,
	vibration: true,
	theme: "light",
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

export default function PomodoroTimer() {
	const [settings, setSettings] = useLocalStorage(
		"pomodoro-settings",
		DEFAULT_SETTINGS,
	);
	const [stats, setStats] = useLocalStorage("pomodoro-stats", DEFAULT_STATS);
	const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>(
		"pomodoro-sessions",
		[],
	);

	const [timerState, setTimerState] = useState<TimerState>("idle");
	const [currentSession, setCurrentSession] = useState<SessionType>("work");
	const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
	const [sessionCount, setSessionCount] = useState(0);
	const [showSettings, setShowSettings] = useState(false);
	const [showStats, setShowStats] = useState(false);

	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const { requestPermission, showNotification } = useNotifications();

	const handleNextSession = useCallback(() => {
		if (currentSession === "work") {
			const newSessionCount = sessionCount + 1;
			setSessionCount(newSessionCount);

			if (newSessionCount % settings.sessionsUntilLongBreak === 0) {
				setCurrentSession("longBreak");
				setTimeLeft(settings.longBreakDuration * 60);
			} else {
				setCurrentSession("shortBreak");
				setTimeLeft(settings.shortBreakDuration * 60);
			}
		} else {
			setCurrentSession("work");
			setTimeLeft(settings.workDuration * 60);
		}

		setTimerState("idle");
	}, [currentSession, sessionCount, settings]);

	const handleSessionComplete = useCallback(() => {
		setTimerState("completed");

		// Create session record
		const session: PomodoroSession = {
			id: Date.now().toString(),
			type: currentSession,
			duration:
				currentSession === "work"
					? settings.workDuration * 60
					: currentSession === "shortBreak"
						? settings.shortBreakDuration * 60
						: settings.longBreakDuration * 60,
			completedAt: new Date(),
		};

		setSessions((prev) => [...prev, session]);

		// Update stats
		setStats((prev) => {
			const newStats = { ...prev };
			newStats.totalSessions += 1;

			if (currentSession === "work") {
				newStats.totalWorkTime += settings.workDuration * 60;
				newStats.completedPomodoros += 1;
				newStats.currentStreak += 1;
				newStats.longestStreak = Math.max(
					newStats.longestStreak,
					newStats.currentStreak,
				);
			} else {
				newStats.totalBreakTime += session.duration;
			}

			// Check if today's session
			const today = new Date().toDateString();
			if (session.completedAt.toDateString() === today) {
				newStats.todaysSessions += 1;
			}

			return newStats;
		});

		// Show notification
		if (settings.notificationSound) {
			const title =
				currentSession === "work" ? "作業時間終了！" : "休憩時間終了！";
			const body =
				currentSession === "work"
					? "休憩時間です。リフレッシュしましょう。"
					: "作業時間です。集中して取り組みましょう。";

			showNotification({ title, body });
		}

		// Vibration for mobile
		if (settings.vibration && "vibrate" in navigator) {
			navigator.vibrate([200, 100, 200]);
		}

		// Auto-start next session
		const shouldAutoStart =
			currentSession === "work"
				? settings.autoStartBreaks
				: settings.autoStartPomodoros;

		if (shouldAutoStart) {
			setTimeout(() => {
				handleNextSession();
				setTimerState("running");
			}, 1000);
		}
	}, [
		currentSession,
		settings,
		showNotification,
		setSessions,
		setStats,
		handleNextSession,
	]);

	// Calculate initial time when settings change
	useEffect(() => {
		if (timerState === "idle") {
			const duration =
				currentSession === "work"
					? settings.workDuration
					: currentSession === "shortBreak"
						? settings.shortBreakDuration
						: settings.longBreakDuration;
			setTimeLeft(duration * 60);
		}
	}, [settings, currentSession, timerState]);

	// Timer logic
	useEffect(() => {
		if (timerState === "running" && timeLeft > 0) {
			intervalRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						handleSessionComplete();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [timerState, timeLeft, handleSessionComplete]);

	const handleStart = useCallback(() => {
		if (timerState === "idle" || timerState === "completed") {
			requestPermission();
		}
		setTimerState("running");
	}, [timerState, requestPermission]);

	const handlePause = useCallback(() => {
		setTimerState("paused");
	}, []);

	const handleStop = useCallback(() => {
		setTimerState("idle");
		const duration =
			currentSession === "work"
				? settings.workDuration
				: currentSession === "shortBreak"
					? settings.shortBreakDuration
					: settings.longBreakDuration;
		setTimeLeft(duration * 60);
	}, [currentSession, settings]);

	const handleSkip = useCallback(() => {
		handleSessionComplete();
		handleNextSession();
	}, [handleSessionComplete, handleNextSession]);

	const getCurrentDuration = () => {
		return currentSession === "work"
			? settings.workDuration * 60
			: currentSession === "shortBreak"
				? settings.shortBreakDuration * 60
				: settings.longBreakDuration * 60;
	};

	const getSessionLabel = () => {
		switch (currentSession) {
			case "work":
				return "作業時間";
			case "shortBreak":
				return "短い休憩";
			case "longBreak":
				return "長い休憩";
			default:
				return "";
		}
	};

	const progress =
		((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100;

	return (
		<div className="space-y-8">
			{/* Timer Display */}
			<div className="bg-base border border-main p-8 rounded-lg text-center">
				<div className="space-y-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-semibold text-main">
							{getSessionLabel()}
						</h2>
						<div className="text-sm text-main">
							セッション {sessionCount + 1} / {settings.sessionsUntilLongBreak}
						</div>
					</div>

					<TimerDisplay
						timeLeft={timeLeft}
						progress={progress}
						isRunning={timerState === "running"}
						sessionType={currentSession}
					/>

					{/* Controls */}
					<div className="flex justify-center items-center gap-4">
						{timerState === "idle" || timerState === "completed" ? (
							<button
								type="button"
								onClick={handleStart}
								className="flex items-center gap-2 px-6 py-3 bg-main text-white rounded-lg hover:bg-main/80 transition-colors"
								aria-label="タイマー開始"
							>
								<Play size={20} />
								開始
							</button>
						) : timerState === "running" ? (
							<button
								type="button"
								onClick={handlePause}
								className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
								aria-label="タイマー一時停止"
							>
								<Pause size={20} />
								一時停止
							</button>
						) : (
							<button
								type="button"
								onClick={handleStart}
								className="flex items-center gap-2 px-6 py-3 bg-main text-white rounded-lg hover:bg-main/80 transition-colors"
								aria-label="タイマー再開"
							>
								<Play size={20} />
								再開
							</button>
						)}

						<button
							type="button"
							onClick={handleStop}
							className="flex items-center gap-2 px-4 py-3 border border-main rounded-lg hover:bg-main/10 transition-colors"
							aria-label="タイマー停止"
						>
							<Square size={20} />
							停止
						</button>

						<button
							type="button"
							onClick={handleSkip}
							className="flex items-center gap-2 px-4 py-3 border border-main rounded-lg hover:bg-main/10 transition-colors"
							aria-label="セッションスキップ"
						>
							<SkipForward size={20} />
							スキップ
						</button>
					</div>

					{/* Status */}
					<div className="text-sm text-main">
						状態:{" "}
						{timerState === "idle"
							? "待機中"
							: timerState === "running"
								? "実行中"
								: timerState === "paused"
									? "一時停止中"
									: "完了"}
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex justify-center gap-4">
				<button
					type="button"
					onClick={() => setShowSettings(!showSettings)}
					className="flex items-center gap-2 px-4 py-2 border border-main rounded-lg hover:bg-main/10 transition-colors"
					aria-label="設定"
				>
					<Settings size={20} />
					設定
				</button>

				<button
					type="button"
					onClick={() => setShowStats(!showStats)}
					className="flex items-center gap-2 px-4 py-2 border border-main rounded-lg hover:bg-main/10 transition-colors"
					aria-label="統計"
				>
					<BarChart3 size={20} />
					統計
				</button>
			</div>

			{/* Settings Panel */}
			{showSettings && (
				<SettingsPanel
					settings={settings}
					onSettingsChange={setSettings}
					onClose={() => setShowSettings(false)}
				/>
			)}

			{/* Stats Panel */}
			{showStats && (
				<StatsPanel
					stats={stats}
					sessions={sessions}
					onClose={() => setShowStats(false)}
				/>
			)}

			{/* Instructions */}
			<div className="bg-base border border-main p-6 rounded-lg">
				<h3 className="text-lg font-semibold mb-4 text-main">
					ポモドーロテクニックについて
				</h3>
				<div className="space-y-3 text-sm text-main">
					<div className="flex items-start gap-3">
						<span className="text-accent font-medium">1.</span>
						<div>
							<strong>25分間集中して作業</strong>
							<p>一つのタスクに集中し、中断を避けます。</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-accent font-medium">2.</span>
						<div>
							<strong>5分間の短い休憩</strong>
							<p>軽くストレッチしたり、水分補給をします。</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-accent font-medium">3.</span>
						<div>
							<strong>4セット後に長い休憩</strong>
							<p>15分間の長い休憩でしっかりリフレッシュします。</p>
						</div>
					</div>
					<div className="flex items-start gap-3">
						<span className="text-accent font-medium">4.</span>
						<div>
							<strong>サイクルを繰り返す</strong>
							<p>このサイクルを繰り返して効率的に作業を進めます。</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
