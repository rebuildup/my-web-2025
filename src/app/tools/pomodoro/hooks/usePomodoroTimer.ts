"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
	PomodoroSession,
	PomodoroSessionType,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import {
	DEFAULT_SETTINGS,
	DEFAULT_STATS,
	getTotalDuration,
	SCHEDULE,
	type ScheduleStep,
} from "../utils/pomodoro-constants";
import { playNotificationSound } from "../utils/soundPlayer";
import { useLocalStorage } from "./useLocalStorage";
import { useNotifications } from "./useNotifications";
import { useSessionStorage } from "./useSessionStorage";

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
	const requestRef = useRef<number | null>(null);
	const { requestPermission, showNotification } = useNotifications();

	// Mutable holder for non-stable callbacks (setStats / setSessions are
	// recreated each render by useLocalStorage). We update the ref via
	// assignment on every render — this is *not* a useEffect, so it does not
	// violate the "react to value changes" anti-pattern. The RAF tick reads
	// from these refs to avoid recreating the animation loop when the
	// setters' identities change.
	const setSessionsRef = useRef(setSessions);
	const setStatsRef = useRef(setStats);
	setSessionsRef.current = setSessions;
	setStatsRef.current = setStats;

	// Latest timeLeft mirror, updated synchronously from the setter (not via
	// an effect) so non-React readers (the RAF cleanup branch, the
	// persistence interval) always observe the freshest value without
	// subscribing to per-frame re-renders.
	const timeLeftRef = useRef(timeLeft);
	const updateTimeLeft = useCallback(
		(value: number | ((prev: number) => number)) => {
			setTimeLeft((prev) => {
				const next =
					typeof value === "function"
						? (value as (prev: number) => number)(prev)
						: value;
				timeLeftRef.current = next;
				return next;
			});
		},
		[],
	);

	const currentStep = customSchedule[currentStepIndex];
	const totalDuration = getTotalDuration(customSchedule);

	// Canonical step-transition handler. Resets all per-step derived state
	// (timeLeft, startTimeRef, isFinished, pending RAF) and optionally
	// auto-starts the new step. All step changes (manual navigation, reset,
	// auto-advance on completion) flow through this helper, so no
	// value-reaction useEffect is needed.
	const transitionTo = useCallback(
		(index: number, options?: { autoStart?: boolean }) => {
			const length = customSchedule.length;
			const safeIndex = length === 0 ? 0 : ((index % length) + length) % length;
			const target = customSchedule[safeIndex] ?? SCHEDULE[0];
			const newDuration = target.duration * 60 * 1000;
			const shouldAutoStart = options?.autoStart ?? false;

			setCurrentStepIndex(safeIndex);
			updateTimeLeft(newDuration);
			startTimeRef.current = null;
			setIsFinished(false);
			setSavedTime(newDuration);

			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
				requestRef.current = null;
			}

			setIsActive(shouldAutoStart);
		},
		[customSchedule, setCurrentStepIndex, setSavedTime, updateTimeLeft],
	);

	// RAF tick: starts/re-covers the animation frame loop while the timer is
	// active, and cleans up on pause / unmount. Cleanup branch restores the
	// world to its pre-mount state (cancelled RAF, null startTime, saved
	// elapsed time). Re-runs when currentStep / settings / showNotification
	// change so the tick closure always reads fresh values without needing
	// a value-reaction mirror effect.
	useEffect(() => {
		if (isActive) {
			const tick = (time: number) => {
				if (!startTimeRef.current) startTimeRef.current = time;
				const elapsed = time - startTimeRef.current;
				const step = currentStep;
				const newTimeLeft = Math.max(step.duration * 60 * 1000 - elapsed, 0);

				updateTimeLeft(newTimeLeft);

				if (newTimeLeft <= 0) {
					setIsFinished(true);
					setIsActive(false);
					startTimeRef.current = null;

					if (settings.notificationSound) {
						const normalizedVolume = Math.min(
							1,
							Math.max(0, settings.notificationVolume / 100),
						);
						playNotificationSound(normalizedVolume);
					}

					if (settings.vibration && navigator.vibrate) {
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

					showNotification({
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
				requestRef.current = null;
			}
			startTimeRef.current = null;
			if (!isFinished) {
				timeLeftRef.current =
					currentStep.duration * 60 * 1000 - timeLeftRef.current;
				setSavedTime(timeLeftRef.current);
			}
		}
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
				requestRef.current = null;
			}
		};
	}, [isActive, currentStep, settings, showNotification, isFinished]);

	// Persist current timeLeft to sessionStorage so the timer can be
	// restored on reload. While inactive, write once on pause; while active,
	// poll once a second. Reads from timeLeftRef (synchronously updated by
	// updateTimeLeft) so it never re-subscribes per frame.
	useEffect(() => {
		if (!isActive) {
			setSavedTime(timeLeftRef.current);
			return;
		}

		const interval = setInterval(() => {
			setSavedTime(timeLeftRef.current);
		}, 1000);

		return () => clearInterval(interval);
	}, [isActive, setSavedTime]);

	// Auto-advance: when a step completes, schedule a transition to the
	// next step (with autoStart). Routed through transitionTo so all
	// per-step reset work happens in one place.
	const hasQueuedAutoAdvanceRef = useRef(false);
	useEffect(() => {
		if (!isFinished || customSchedule.length === 0) {
			hasQueuedAutoAdvanceRef.current = false;
			return;
		}
		if (hasQueuedAutoAdvanceRef.current) return;
		hasQueuedAutoAdvanceRef.current = true;

		const nextIndex =
			currentStepIndex < customSchedule.length - 1 ? currentStepIndex + 1 : 0;

		const timeoutId = window.setTimeout(() => {
			transitionTo(nextIndex, { autoStart: true });
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [isFinished, currentStepIndex, customSchedule.length, transitionTo]);

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
		if (customSchedule.length === 0) return;
		transitionTo(0);
	}, [customSchedule.length, transitionTo]);

	const goToNext = useCallback(() => {
		if (customSchedule.length === 0) return;
		transitionTo(currentStepIndex + 1);
	}, [currentStepIndex, customSchedule.length, transitionTo]);

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
		[],
	);

	const addStep = useCallback((id: number) => {
		const newStep: ScheduleStep = {
			id,
			type: "focus",
			duration: 25,
			label: "New Step",
			desc: "",
		};
		setCustomSchedule((prev) => [...prev, newStep]);
	}, []);

	const removeStep = useCallback(
		(index: number) => {
			setCustomSchedule((prev) => prev.filter((_, i) => i !== index));
			setCurrentStepIndex((prev) => {
				if (customSchedule.length <= 1) return 0;
				let next = prev;
				if (index === prev) next = 0;
				else if (index < prev) next = prev - 1;
				return Math.max(0, Math.min(customSchedule.length - 2, next));
			});
		},
		[customSchedule.length, setCurrentStepIndex],
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
		setTimeLeft: updateTimeLeft,
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
