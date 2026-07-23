"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playNotificationSound } from "../utils/soundPlayer";
import type {
	PomodoroSession,
	PomodoroSessionType,
	PomodoroSettings,
	PomodoroStats,
} from "../types";
import type { ScheduleStep } from "../utils/pomodoro-constants";
import { getTotalDuration } from "../utils/pomodoro-constants";

type StatsUpdater = (updater: (prev: PomodoroStats) => PomodoroStats) => void;
type SessionsUpdater = (
	updater: (prev: PomodoroSession[]) => PomodoroSession[],
) => void;

export type TimerEngineOptions = {
	schedule: ScheduleStep[];
	settings: PomodoroSettings;
	showNotification: (options: { title: string; body: string }) => void;
	requestPermission: () => void;
	onStatsUpdate?: StatsUpdater;
	onSessionsUpdate?: SessionsUpdater;
};

export const useTimerEngine = ({
	schedule,
	settings,
	showNotification,
	requestPermission: _requestPermission,
	onStatsUpdate,
	onSessionsUpdate,
}: TimerEngineOptions) => {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [timeLeft, setTimeLeft] = useState(
		schedule[0]?.duration ? schedule[0].duration * 60 * 1000 : 0,
	);
	const [isActive, setIsActive] = useState(false);
	const [isFinished, setIsFinished] = useState(false);

	const startTimeRef = useRef<number | null>(null);
	const savedTimeRef = useRef(0);
	const requestRef = useRef<number | null>(null);

	const currentStep = schedule[currentStepIndex] ?? schedule[0];
	const totalDuration = getTotalDuration(schedule);

	const currentStepRef = useRef(currentStep);
	const settingsRef = useRef(settings);
	const showNotificationRef = useRef(showNotification);
	const setSessionsRef = useRef<SessionsUpdater | undefined>(onSessionsUpdate);
	const setStatsRef = useRef<StatsUpdater | undefined>(onStatsUpdate);
	const autoStartNextRef = useRef(false);
	const hasQueuedAutoAdvanceRef = useRef(false);

	useEffect(() => {
		currentStepRef.current = currentStep;
		settingsRef.current = settings;
		showNotificationRef.current = showNotification;
		setSessionsRef.current = onSessionsUpdate;
		setStatsRef.current = onStatsUpdate;
	}, [
		currentStep,
		settings,
		showNotification,
		onSessionsUpdate,
		onStatsUpdate,
	]);

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

					setStatsRef.current?.((prev) => {
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

					setSessionsRef.current?.((prev) => {
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
	}, [isActive, currentStep, isFinished, timeLeft]);

	const timeLeftRef = useRef(timeLeft);
	const prevStepIndexRef = useRef(currentStepIndex);

	useEffect(() => {
		timeLeftRef.current = timeLeft;
	}, [timeLeft]);

	useEffect(() => {
		if (prevStepIndexRef.current !== currentStepIndex) {
			const newDuration = schedule[currentStepIndex].duration * 60 * 1000;
			const shouldAutoStart = autoStartNextRef.current;
			autoStartNextRef.current = false;

			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
			startTimeRef.current = null;
			setIsFinished(false);

			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
				requestRef.current = null;
			}

			setIsActive(shouldAutoStart);
			prevStepIndexRef.current = currentStepIndex;
		}
	}, [currentStepIndex, schedule]);

	useEffect(() => {
		if (!isFinished || schedule.length === 0) {
			hasQueuedAutoAdvanceRef.current = false;
			return;
		}

		if (hasQueuedAutoAdvanceRef.current) {
			return;
		}
		hasQueuedAutoAdvanceRef.current = true;

		const nextIndex =
			currentStepIndex < schedule.length - 1 ? currentStepIndex + 1 : 0;

		autoStartNextRef.current = true;

		const timeoutId = window.setTimeout(() => {
			setCurrentStepIndex(nextIndex);
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [isFinished, currentStepIndex, schedule.length]);

	useEffect(() => {
		if (!isActive && currentStepIndex < schedule.length) {
			const newDuration = schedule[currentStepIndex].duration * 60 * 1000;
			setTimeLeft(newDuration);
			savedTimeRef.current = 0;
		}
		if (currentStepIndex >= schedule.length) {
			setCurrentStepIndex(0);
		}
	}, [schedule, currentStepIndex, isActive]);

	const start = useCallback(() => {
		setIsActive(true);
	}, []);

	const pause = useCallback(() => {
		setIsActive(false);
	}, []);

	const reset = useCallback(() => {
		setIsActive(false);
		setIsFinished(false);
		setCurrentStepIndex(0);
		setTimeLeft(schedule[0]?.duration ? schedule[0].duration * 60 * 1000 : 0);
		savedTimeRef.current = 0;
		startTimeRef.current = null;
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
			requestRef.current = null;
		}
	}, [schedule]);

	const goToNext = useCallback(() => {
		setCurrentStepIndex((prev) => (prev < schedule.length - 1 ? prev + 1 : 0));
	}, [schedule]);

	return {
		currentStepIndex,
		setCurrentStepIndex,
		currentStep,
		totalDuration,
		timeLeft,
		setTimeLeft,
		isActive,
		isFinished,
		start,
		pause,
		reset,
		goToNext,
	};
};
