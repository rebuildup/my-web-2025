"use client";

import type { RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { getCaretScreenPosition } from "./utils";

type MenuPos = { top: number; left: number };
type SelectionRange = { start: number; end: number };

export type SelectionMenuApi = {
	menuPos: MenuPos | null;
	selectionRange: SelectionRange | null;
	isWrapping: boolean;
	setSelectionRange: (range: SelectionRange | null) => void;
	setMenuPos: (pos: MenuPos | null) => void;
	openCaretMenu: (opts?: {
		start?: number;
		end?: number;
		suppressAlert?: boolean;
		anchor?: { left: number; top: number };
	}) => void;
	wrapSelectionAsBlank: () => void;
};

type WrapDeps = {
	pages: string[];
	activePage: number;
};

export function useSelectionMenu(
	textareaRef: RefObject<HTMLTextAreaElement | null>,
	menuRef: RefObject<HTMLDivElement | null>,
	setPages: (updater: (prev: string[]) => string[]) => void,
	pushHistory: (pages: string[]) => void,
	{ pages, activePage }: WrapDeps,
): SelectionMenuApi {
	const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
	const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(
		null,
	);
	const [isWrapping, setIsWrapping] = useState(false);

	const openCaretMenu = useCallback(
		(opts?: {
			start?: number;
			end?: number;
			suppressAlert?: boolean;
			anchor?: { left: number; top: number };
		}) => {
			if (isWrapping) return;
			const ta = textareaRef.current;
			if (!ta) return;
			const start = opts?.start ?? selectionRange?.start ?? ta.selectionStart;
			const end = opts?.end ?? selectionRange?.end ?? ta.selectionEnd;
			if (
				start === null ||
				end === null ||
				start === undefined ||
				end === undefined ||
				start === end
			) {
				if (!opts?.suppressAlert) {
					alert("先にテキストを選択してください");
				}
				return;
			}

			if (opts?.anchor) {
				setSelectionRange({ start, end });
				setMenuPos({
					left: Math.round(opts.anchor.left),
					top: Math.round(opts.anchor.top),
				});
				return;
			}

			const selection = window.getSelection();
			if (selection && selection.rangeCount > 0) {
				const range = selection.getRangeAt(0);
				const rect = range.getBoundingClientRect();
				if (rect.width || rect.height) {
					setSelectionRange({ start, end });
					setMenuPos({
						left: Math.round(rect.left + rect.width / 2),
						top: Math.round(rect.top + rect.height),
					});
					return;
				}
			}

			const caretPos = getCaretScreenPosition(ta);
			if (caretPos) {
				setSelectionRange({ start, end });
				setMenuPos({
					left: Math.round(caretPos.left),
					top: Math.round(caretPos.top),
				});
				return;
			}

			const rect = ta.getBoundingClientRect();
			setSelectionRange({ start, end });
			setMenuPos({
				left: Math.round(rect.left + rect.width / 2),
				top: Math.round(rect.top + rect.height / 2),
			});
		},
		[isWrapping, selectionRange, textareaRef],
	);

	const wrapSelectionAsBlank = useCallback(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		const fallbackStart = ta.selectionStart;
		const fallbackEnd = ta.selectionEnd;
		const start = selectionRange?.start ?? fallbackStart;
		const end = selectionRange?.end ?? fallbackEnd;
		if (
			start === null ||
			end === null ||
			start === undefined ||
			end === undefined ||
			start === end
		) {
			alert("先にテキストを選択してください");
			return;
		}
		const { value } = ta;
		const selected = value.slice(start, end);
		const before = value.slice(0, start);
		const after = value.slice(end);
		const wrapped = `${before}{{${selected}}}${after}`;

		setIsWrapping(true);
		setMenuPos(null);
		setSelectionRange(null);
		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
		}
		const collapsePos = before.length + selected.length + 4;
		ta.setSelectionRange(collapsePos, collapsePos);

		setPages((prev) => {
			const next = [...prev];
			next[activePage] = wrapped;
			return next;
		});
		pushHistory(
			(() => {
				const next = [...pages];
				next[activePage] = wrapped;
				return next;
			})(),
		);

		requestAnimationFrame(() => {
			if (!textareaRef.current) return;
			setMenuPos(null);
			const ta2 = textareaRef.current;
			const selection2 = window.getSelection();
			if (selection2) {
				selection2.removeAllRanges();
			}
			ta2.focus({ preventScroll: true });
			ta2.setSelectionRange(collapsePos, collapsePos);
			requestAnimationFrame(() => {
				if (!textareaRef.current) return;
				setMenuPos(null);
				const ta3 = textareaRef.current;
				const selection3 = window.getSelection();
				if (selection3) {
					selection3.removeAllRanges();
				}
				ta3.setSelectionRange(collapsePos, collapsePos);
				setTimeout(() => {
					if (!textareaRef.current) return;
					setMenuPos(null);
					const ta4 = textareaRef.current;
					const selection4 = window.getSelection();
					if (selection4) {
						selection4.removeAllRanges();
					}
					ta4.setSelectionRange(collapsePos, collapsePos);
					setIsWrapping(false);
				}, 0);
			});
		});
	}, [activePage, selectionRange, pages, textareaRef, setPages, pushHistory]);

	useEffect(() => {
		if (isWrapping && !selectionRange) {
			const ta = textareaRef.current;
			if (!ta) return;
			setMenuPos(null);
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
			}
			const currentPos = ta.selectionStart ?? 0;
			requestAnimationFrame(() => {
				if (!textareaRef.current) return;
				setMenuPos(null);
				const ta2 = textareaRef.current;
				const selection2 = window.getSelection();
				if (selection2) {
					selection2.removeAllRanges();
				}
				ta2.setSelectionRange(currentPos, currentPos);
			});
		}
	}, [pages, selectionRange, isWrapping, textareaRef]);

	useEffect(() => {
		if (!menuPos || !selectionRange) return;
		if (isWrapping) return;
		const ta = textareaRef.current;
		if (!ta) return;
		if (document.activeElement === ta || menuPos) {
			if (selectionRange.start !== null && selectionRange.end !== null) {
				ta.focus({ preventScroll: true });
				ta.setSelectionRange(selectionRange.start, selectionRange.end);
			}
		}
	}, [menuPos, selectionRange, isWrapping, textareaRef]);

	useEffect(() => {
		if (!menuPos) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (menuRef.current && menuRef.current.contains(e.target as Node)) {
				return;
			}
			setMenuPos(null);
		};
		document.addEventListener("pointerdown", handlePointerDown, true);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown, true);
		};
	}, [menuPos, menuRef]);

	useEffect(() => {
		const ta = textareaRef.current;
		if (!ta) return;
		const handlePointerDown = () => {
			setMenuPos(null);
		};
		const handlePointerUp = (e: PointerEvent) => {
			if (isWrapping) return;
			const { selectionStart, selectionEnd } = ta;
			if (
				selectionStart === null ||
				selectionEnd === null ||
				selectionStart === selectionEnd
			) {
				return;
			}
			setSelectionRange({ start: selectionStart, end: selectionEnd });
			requestAnimationFrame(() => {
				openCaretMenu({
					start: selectionStart,
					end: selectionEnd,
					suppressAlert: true,
					anchor: { left: e.clientX, top: e.clientY },
				});
			});
		};
		ta.addEventListener("pointerdown", handlePointerDown);
		ta.addEventListener("pointerup", handlePointerUp);
		return () => {
			ta.removeEventListener("pointerdown", handlePointerDown);
			ta.removeEventListener("pointerup", handlePointerUp);
		};
	}, [openCaretMenu, isWrapping, textareaRef]);

	useEffect(() => {
		const handler = () => {
			if (isWrapping) return;
			const ta = textareaRef.current;
			if (!ta) return;
			if (document.activeElement !== ta) return;
			const { selectionStart, selectionEnd } = ta;
			if (
				selectionStart === null ||
				selectionEnd === null ||
				selectionStart === selectionEnd
			) {
				return;
			}
			setSelectionRange({ start: selectionStart, end: selectionEnd });
			requestAnimationFrame(() => {
				openCaretMenu({
					start: selectionStart,
					end: selectionEnd,
					suppressAlert: true,
				});
			});
		};
		document.addEventListener("mouseup", handler);
		document.addEventListener("keyup", handler);
		return () => {
			document.removeEventListener("mouseup", handler);
			document.removeEventListener("keyup", handler);
		};
	}, [openCaretMenu, isWrapping, textareaRef]);

	return {
		menuPos,
		selectionRange,
		isWrapping,
		setSelectionRange,
		setMenuPos,
		openCaretMenu,
		wrapSelectionAsBlank,
	};
}
