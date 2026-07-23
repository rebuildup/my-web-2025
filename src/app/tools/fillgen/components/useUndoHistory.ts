"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Dispatch, SetStateAction } from "react";

export type UndoApi = {
	history: string[][];
	historyIndex: number;
	pushHistory: (pages: string[]) => void;
};

export function useUndoHistory(
	textareaRef: RefObject<HTMLTextAreaElement | null>,
	setPages: Dispatch<SetStateAction<string[]>>,
	initial: string[],
): UndoApi {
	const [history, setHistory] = useState<string[][]>([initial]);
	const [historyIndex, setHistoryIndex] = useState(0);

	const pushHistory = useCallback(
		(pages: string[]) => {
			setHistory((prev) => {
				const next = prev.slice(0, historyIndex + 1);
				return [...next, pages];
			});
			setHistoryIndex((prev) => prev + 1);
		},
		[historyIndex],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				const ta = textareaRef.current;
				if (!ta || document.activeElement !== ta) return;
				e.preventDefault();
				if (historyIndex > 0) {
					const prevIndex = historyIndex - 1;
					setHistoryIndex(prevIndex);
					setPages([...history[prevIndex]]);
					requestAnimationFrame(() => {
						if (textareaRef.current) {
							textareaRef.current.focus();
						}
					});
				}
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [history, historyIndex, textareaRef, setPages]);

	return { history, historyIndex, pushHistory };
}
