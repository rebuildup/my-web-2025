"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type PointerHandler = React.PointerEvent;

export type UseWidgetDragParams = {
	id: number;
	type: string;
	isSticky: boolean;
	bringToFront: () => void;
	updateWidget: (id: number, data: { x?: number; y?: number }) => void;
	removeWidget: (id: number) => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
};

export type UseWidgetDragResult = {
	widgetRef: React.RefObject<HTMLDivElement | null>;
	isDragging: boolean;
	isOverDeleteZone: boolean;
	handlePointerDown: (e: PointerHandler) => void;
	handleFocus: () => void;
};

/**
 * Drag handling for widgets. Manages drag state, pointer capture, delete-zone
 * detection, and visibility reset. The caller passes the widget id/type so the
 * hook can call back into the widget store.
 */
export function useWidgetDrag({
	id,
	type,
	isSticky,
	bringToFront,
	updateWidget,
	removeWidget,
	onDragStart,
	onDragEnd,
}: UseWidgetDragParams): UseWidgetDragResult {
	const [isDragging, setIsDragging] = useState(false);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);

	const widgetRef = useRef<HTMLDivElement>(null);
	const onDragStartRef = useRef<(() => void) | undefined>(undefined);
	const onDragEndRef = useRef<(() => void) | undefined>(undefined);
	const lastPointerId = useRef<number | null>(null);

	useEffect(() => {
		onDragStartRef.current = onDragStart;
		onDragEndRef.current = onDragEnd;
	}, [onDragStart, onDragEnd]);

	const startDrag = useCallback(
		(clientX: number, clientY: number) => {
			bringToFront();
			setIsDragging(true);
			if (isSticky) {
				onDragStartRef.current?.();
			}
			if (widgetRef.current) {
				const rect = widgetRef.current.getBoundingClientRect();
				setDragOffset({ x: clientX - rect.left, y: clientY - rect.top });
			}
		},
		[bringToFront, isSticky],
	);

	const handlePointerDown = useCallback(
		(e: PointerHandler) => {
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
		},
		[isSticky, startDrag],
	);

	const handleFocus = useCallback(() => {
		bringToFront();
	}, [bringToFront]);

	useEffect(() => {
		const handlePointerMove = (e: globalThis.PointerEvent) => {
			if (!isDragging) return;
			e.preventDefault();
			updateWidget(id, {
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
				removeWidget(id);
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
		id,
		type,
		updateWidget,
		isOverDeleteZone,
		removeWidget,
		isSticky,
	]);

	return {
		widgetRef,
		isDragging,
		isOverDeleteZone,
		handlePointerDown,
		handleFocus,
	};
}
