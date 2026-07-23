"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useNotifications } from "./useNotifications";
import { useSessionStorage } from "./useSessionStorage";
import type {
	PomodoroSession,
	PomodoroSessionType,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import {
	DEFAULT_SETTINGS,
	DEFAULT_STATS,
	SCHEDULE,
	type ScheduleStep,
	getTotalDuration,
} from "../utils/pomodoro-constants";
import { playNotificationSound } from "../utils/soundPlayer";

export type UsePomodoroTimerResult = {
	settings: PomodoroSettings;
	setSettings: (
		value: PomodoroSettings | ((prev: PomodoroSettings) => PomodoroSettings),
	) => void;
	stats: PomodoroStats;
	setStats: (
		value: PomodoroStats | ((prev: PomodoroStats) => PomodoroStats),
	) => void;
	sessions: PomodoroSession[];
	setSessions: (
		value: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[]),
	) => void;

	currentStepIndex: number;
	setCurrentStepIndex: (value: number | ((prev: number) => number)) => void;
	customSchedule: ScheduleStep[];
	setCustomSchedule: (
		value: ScheduleStep[] | ((prev: ScheduleStep[]) => ScheduleStep[]),
	) => void;
	timeLeft: number;
	setTimeLeft: (value: number | ((prev: number) => number)) => void;
	isActive: boolean;
	setIsActive: (value: boolean | ((prev: boolean) => boolean)) => void;
	isFinished: boolean;

	currentStep: ScheduleStep;
	totalDuration: number;
	start: () => void;
	pause: () => void;
	reset: () => void;
	goToNext: () => void;
	skipToNext: () => void;
	updateSchedule: (index: number, updates: Partial<ScheduleStep>) => void;
	addStep: (id: number) => void;
	removeStep: (index: number) => void;
};

/**
 * Single source of truth for the Pomodoro timer state machine. Encapsulates
 * the requestAnimationFrame tick loop, step transitions, and persistence
 * (localStorage for settings/stats/sessions, sessionStorage for the current
 * step index and time-left). Callbacks are stable for downstream consumers.
 */
export function usePomodoroTimer(): UsePomodoroTimerResult {
	const [settings, setSettings] = useLocalStorage(
		"pomodoro-settings",
		DEFAULT_SETTINGS,
	);
	const [stats, setStats] = useLocalStorage("pomodoro-stats", DEFAULT_STATS);
	const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>(
		"pomodoro-sessions",
		[],
	);

	const [currentStepIndex, setCurrentStepIndex] = useSessionStorage(
		"pomodoro-current-step",
		0,
	);
	const [customSchedule, setCustomSchedule] = useState<ScheduleStep[]>(
		SCHEDULE.map((s) => ({ ...s })),
	);
	const [savedTime, setSavedTime] = useSessionStorage("pomodoro-time-left", -1);
	const [timeLeft, setTimeLeft] = useState(() => {
		if (savedTime !== -1) return savedTime;
		return customSchedule[0].duration * 60 * 1000;
	});
	const [isActive, setIsActive] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

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
	const hasQueuedAutoAdvanceRef = useRef(false);

	useEffect(() => {
		currentStepRef.current = currentStep;
		settingsRef.current = settings;
		showNotificationRef.current = showNotification;
		setSessionsRef.current = setSessions;
		setStatsRef.current = setStats;
	}, [currentStep, settings, showNotification, setSessions, setStats]);

	useEffect(() => {
		if (isActive) {
			const tick = (time: number) => {
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

					if (settingsRef.current.notificationSound) {
						const normalizedVolume = Math.min(
							1,
							Math.max(0, settingsRef.current.notificationVolume / 100),
						);
						playNotificationSound(normalizedVolume);
					}

					if (settingsRef.current.vibration && navigator.vibrate) {
						navigator.vibrate([200, 100, 200]);
					}

					setStatsRef.current((prev) => {
						const newStats = { ...prev };
						if (step.type === "focus") {
							newStats.completedPomodoros += 1;
							newStats.totalWorkTime += step.duration;
							newStats.todaysSessions += 1;
						} else {
							newStats.totalBreakTime += step.duration;
						}
						newStats.totalSessions += 1;
						return newStats;
					});

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

					showNotificationRef.current({
						title:
							step.type === "focus" ? "Work Session Complete!" : "Break Over!",
						body:
							step.type === "focus"
								? "Time to take a break."
								: "Time to get back to work.",
					});
				} else {
					requestRef.current = requestAnimationFrame(tick);
				}
			};

			requestRef.current = requestAnimationFrame(tick);
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
	}, [isActive, currentStep.duration, isFinished]);

	const timeLeftRef = useRef(timeLeft);
	const prevStepIndexRef = useRef(currentStepIndex);

	useEffect(() => {
		timeLeftRef.current = timeLeft;
	}, [timeLeft]);

	useEffect(() => {
		if (!isActive) {
			setSavedTime(
				typeof timeLeft === "number" ? timeLeft : timeLeftRef.current,
			);
			return;
		}

		const interval = setInterval(() => {
			setSavedTime(timeLeftRef.current);
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, setSavedTime, timeLeft]);

	useEffect(() => {
		if (prevStepIndexRef.current !== currentStepIndex) {
			const newDuration = customSchedule[currentStepIndex].duration * 60 * 1000;
			const shouldAutoStart = autoStartNextRef.current;
			autoStartNextRef.current = false;

			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
			startTimeRef.current = null;
			setIsFinished(false);

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
		if (!isFinished || customSchedule.length === 0) {
			hasQueuedAutoAdvanceRef.current = false;
			return;
		}

		if (hasQueuedAutoAdvanceRef.current) {
			return;
		}
		hasQueuedAutoAdvanceRef.current = true;

		const nextIndex =
			currentStepIndex < customSchedule.length - 1 ? currentStepIndex + 1 : 0;

		autoStartNextRef.current = true;

		const timeoutId = window.setTimeout(() => {
			setCurrentStepIndex(nextIndex);
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [
		isFinished,
		currentStepIndex,
		customSchedule.length,
		setCurrentStepIndex,
	]);

	useEffect(() => {
		if (!isActive && currentStepIndex < customSchedule.length) {
			const newDuration = customSchedule[currentStepIndex].duration * 60 * 1000;
			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
		}
		if (currentStepIndex >= customSchedule.length) {
			setCurrentStepIndex(0);
		}
	}, [
		customSchedule,
		currentStepIndex,
		isActive,
		setCurrentStepIndex,
		setTimeLeft,
	]);

	const start = useCallback(() => {
		requestPermission();
		setIsActive(true);
	}, [requestPermission]);

	const pause = useCallback(() => {
		setIsActive(false);
	}, []);

	const reset = useCallback(() => {
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
	}, [customSchedule, setCurrentStepIndex, setTimeLeft]);

	const goToNext = useCallback(() => {
		setCurrentStepIndex((prev) =>
			prev < customSchedule.length - 1 ? prev + 1 : 0,
		);
	}, [customSchedule.length, setCurrentStepIndex]);

	const skipToNext = useCallback(() => {
		setIsActive(false);
		setIsFinished(false);
		goToNext();
	}, [goToNext]);

	const updateSchedule = useCallback(
		(index: number, updates: Partial<ScheduleStep>) => {
			setCustomSchedule((prev) => {
				const newSchedule = [...prev];
				newSchedule[index] = { ...newSchedule[index], ...updates };
				return newSchedule;
			});
		},
		[setCustomSchedule],
	);

	const addStep = useCallback(
		(id: number) => {
			const newStep: ScheduleStep = {
				id,
				type: "focus",
				duration: 25,
				label: "New Step",
				desc: "",
			};
			setCustomSchedule((prev) => [...prev, newStep]);
		},
		[setCustomSchedule],
	);

	const removeStep = useCallback(
		(index: number) => {
			setCustomSchedule((prev) => prev.filter((_, i) => i !== index));
		},
		[setCustomSchedule],
	);

	return {
		settings,
		setSettings,
		stats,
		setStats,
		sessions,
		setSessions,
		currentStepIndex,
		setCurrentStepIndex,
		customSchedule,
		setCustomSchedule,
		timeLeft,
		setTimeLeft,
		isActive,
		setIsActive,
		isFinished,
		currentStep,
		totalDuration,
		start,
		pause,
		reset,
		goToNext,
		skipToNext,
		updateSchedule,
		addStep,
		removeStep,
	};
}
