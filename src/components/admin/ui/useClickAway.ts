"use client";

import { type RefObject, useEffect } from "react";

export function useClickAway(
	ref: RefObject<HTMLElement | null>,
	active: boolean,
	onAway: (event: MouseEvent | KeyboardEvent) => void,
): void {
	useEffect(() => {
		if (!active) return;
		const onDown = (event: MouseEvent) => {
			const node = ref.current;
			if (node && !node.contains(event.target as Node)) onAway(event);
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onAway(event);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [ref, active, onAway]);
}
