/**
 * Touch gesture handling hook for playground components
 * Task 2.1: プレイグラウンドのレスポンシブ対応 - スワイプジェスチャー対応
 */

import { useCallback, useRef, useState } from "react";

export interface TouchPoint {
	x: number;
	y: number;
	timestamp: number;
}

export interface SwipeGesture {
	direction: "left" | "right" | "up" | "down";
	distance: number;
	velocity: number;
	duration: number;
}

export interface PinchGesture {
	scale: number;
	center: { x: number; y: number };
}

export interface TouchGestureState {
	isActive: boolean;
	startPoint: TouchPoint | null;
	currentPoint: TouchPoint | null;
	swipe: SwipeGesture | null;
	pinch: PinchGesture | null;
}

export interface TouchGestureCallbacks {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onSwipeUp?: () => void;
	onSwipeDown?: () => void;
	onPinch?: (scale: number) => void;
	onTap?: (point: TouchPoint) => void;
	onLongPress?: (point: TouchPoint) => void;
}

const SWIPE_THRESHOLD = 50; // Minimum distance for swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for swipe
const LONG_PRESS_DURATION = 500; // Long press duration in ms

export const useTouchGestures = (callbacks: TouchGestureCallbacks = {}) => {
	const [gestureState, setGestureState] = useState<TouchGestureState>({
		isActive: false,
		startPoint: null,
		currentPoint: null,
		swipe: null,
		pinch: null,
	});

	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const initialDistance = useRef<number>(0);

	const createTouchPoint = (touch: React.Touch): TouchPoint => ({
		x: touch.clientX,
		y: touch.clientY,
		timestamp: Date.now(),
	});

	const calculateDistance = (
		point1: TouchPoint,
		point2: TouchPoint,
	): number => {
		const dx = point2.x - point1.x;
		const dy = point2.y - point1.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	const calculateSwipeDirection = (
		start: TouchPoint,
		end: TouchPoint,
	): "left" | "right" | "up" | "down" => {
		const dx = end.x - start.x;
		const dy = end.y - start.y;

		if (Math.abs(dx) > Math.abs(dy)) {
			return dx > 0 ? "right" : "left";
		} else {
			return dy > 0 ? "down" : "up";
		}
	};

	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			e.preventDefault();

			if (e.touches.length === 1) {
				// Single touch - potential swipe or tap
				const startPoint = createTouchPoint(e.touches[0]);

				setGestureState({
					isActive: true,
					startPoint,
					currentPoint: startPoint,
					swipe: null,
					pinch: null,
				});

				// Start long press timer
				longPressTimer.current = setTimeout(() => {
					callbacks.onLongPress?.(startPoint);
				}, LONG_PRESS_DURATION);
			} else if (e.touches.length === 2) {
				// Two touches - potential pinch
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const distance = Math.sqrt(
					(touch2.clientX - touch1.clientX) ** 2 +
						(touch2.clientY - touch1.clientY) ** 2,
				);

				initialDistance.current = distance;

				const center = {
					x: (touch1.clientX + touch2.clientX) / 2,
					y: (touch1.clientY + touch2.clientY) / 2,
				};

				setGestureState((prev) => ({
					...prev,
					isActive: true,
					pinch: { scale: 1, center },
				}));

				// Clear long press timer
				if (longPressTimer.current) {
					clearTimeout(longPressTimer.current);
					longPressTimer.current = null;
				}
			}
		},
		[callbacks, createTouchPoint],
	);

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			e.preventDefault();

			if (!gestureState.isActive) return;

			if (e.touches.length === 1 && gestureState.startPoint) {
				// Single touch movement
				const currentPoint = createTouchPoint(e.touches[0]);

				setGestureState((prev) => ({
					...prev,
					currentPoint,
				}));

				// Clear long press timer on movement
				if (longPressTimer.current) {
					clearTimeout(longPressTimer.current);
					longPressTimer.current = null;
				}
			} else if (e.touches.length === 2 && initialDistance.current > 0) {
				// Two touch movement - pinch
				const touch1 = e.touches[0];
				const touch2 = e.touches[1];
				const distance = Math.sqrt(
					(touch2.clientX - touch1.clientX) ** 2 +
						(touch2.clientY - touch1.clientY) ** 2,
				);

				const scale = distance / initialDistance.current;
				const center = {
					x: (touch1.clientX + touch2.clientX) / 2,
					y: (touch1.clientY + touch2.clientY) / 2,
				};

				setGestureState((prev) => ({
					...prev,
					pinch: { scale, center },
				}));

				callbacks.onPinch?.(scale);
			}
		},
		[
			gestureState.isActive,
			gestureState.startPoint,
			callbacks,
			createTouchPoint,
		],
	);

	const handleTouchEnd = useCallback(
		(e: React.TouchEvent) => {
			e.preventDefault();

			// Clear long press timer
			if (longPressTimer.current) {
				clearTimeout(longPressTimer.current);
				longPressTimer.current = null;
			}

			if (
				gestureState.startPoint &&
				gestureState.currentPoint &&
				e.touches.length === 0
			) {
				const distance = calculateDistance(
					gestureState.startPoint,
					gestureState.currentPoint,
				);
				const duration =
					gestureState.currentPoint.timestamp -
					gestureState.startPoint.timestamp;
				const velocity = distance / duration;

				if (distance < 10 && duration < 300) {
					// Tap gesture
					callbacks.onTap?.(gestureState.currentPoint);
				} else if (
					distance > SWIPE_THRESHOLD &&
					velocity > SWIPE_VELOCITY_THRESHOLD
				) {
					// Swipe gesture
					const direction = calculateSwipeDirection(
						gestureState.startPoint,
						gestureState.currentPoint,
					);

					const swipe: SwipeGesture = {
						direction,
						distance,
						velocity,
						duration,
					};

					setGestureState((prev) => ({
						...prev,
						swipe,
					}));

					// Call appropriate swipe callback
					switch (direction) {
						case "left":
							callbacks.onSwipeLeft?.();
							break;
						case "right":
							callbacks.onSwipeRight?.();
							break;
						case "up":
							callbacks.onSwipeUp?.();
							break;
						case "down":
							callbacks.onSwipeDown?.();
							break;
					}
				}
			}

			// Reset gesture state
			setGestureState({
				isActive: false,
				startPoint: null,
				currentPoint: null,
				swipe: null,
				pinch: null,
			});

			initialDistance.current = 0;
		},
		[
			gestureState.startPoint,
			gestureState.currentPoint,
			callbacks,
			calculateDistance,
			calculateSwipeDirection,
		],
	);

	const touchHandlers = {
		onTouchStart: (e: React.TouchEvent) => handleTouchStart(e),
		onTouchMove: (e: React.TouchEvent) => handleTouchMove(e),
		onTouchEnd: (e: React.TouchEvent) => handleTouchEnd(e),
	};

	return {
		gestureState,
		touchHandlers,
	};
};

// Utility hook for experiment switching with swipe gestures
export const useExperimentSwipe = (
	experiments: string[],
	currentIndex: number,
	onExperimentChange: (index: number) => void,
) => {
	const { touchHandlers } = useTouchGestures({
		onSwipeLeft: () => {
			const nextIndex = (currentIndex + 1) % experiments.length;
			onExperimentChange(nextIndex);
		},
		onSwipeRight: () => {
			const prevIndex =
				currentIndex === 0 ? experiments.length - 1 : currentIndex - 1;
			onExperimentChange(prevIndex);
		},
	});

	return touchHandlers;
};
