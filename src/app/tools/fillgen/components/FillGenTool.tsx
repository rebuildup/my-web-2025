"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import type { StyleSettings } from "./types";
import { presets, defaultInput } from "./presets";
import { parseDoc } from "./parser";
import { generateStyle } from "./style-generator";
import { renderHtml, renderReact } from "./renderers";
import { getCaretScreenPosition } from "./utils";
import { EditorPanel } from "./EditorPanel";
import { OutputPanel } from "./OutputPanel";
import { CaretMenu } from "./CaretMenu";

const _baseStyle = generateStyle(presets.default);

export default function FillGenTool() {
	const [pages, setPages] = useState<string[]>([defaultInput]);
	const [activePage, setActivePage] = useState(0);
	const [tab, setTab] = useState<"preview" | "html" | "react">("preview");
	const [settings, setSettings] = useState<StyleSettings>(presets.default);
	const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
		null,
	);
	const [selectionRange, setSelectionRange] = useState<{
		start: number;
		end: number;
	} | null>(null);
	const [mounted, setMounted] = useState(false);
	const [history, setHistory] = useState<string[][]>([[defaultInput]]);
	const [historyIndex, setHistoryIndex] = useState(0);
	const menuRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [isWrapping, setIsWrapping] = useState(false);

	const resizeInputElement = (input: HTMLInputElement) => {
		const base = Number.parseInt(input.dataset.baseWidth ?? "0", 10) || 80;
		const dynamic = Math.min(
			500,
			Math.max(base, (input.value.length + 1) * 12),
		);
		input.style.width = `${dynamic}px`;
	};

	const docs = useMemo(() => pages.map((p) => parseDoc(p)), [pages]);
	const currentStyle = useMemo(() => generateStyle(settings), [settings]);
	const htmlCode = useMemo(() => renderHtml(docs, settings), [docs, settings]);
	const reactCode = useMemo(
		() => renderReact(docs, settings),
		[docs, settings],
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

		// 選択を即座にクリア（先に実行）
		setIsWrapping(true);
		setMenuPos(null);
		setSelectionRange(null);
		// グローバルな選択範囲も解除
		const selection = window.getSelection();
		if (selection) {
			selection.removeAllRanges();
		}
		// 直接テキストエリアの選択もクリア（カーソル位置に折りたたむ）
		const collapsePos = before.length + selected.length + 4;
		ta.setSelectionRange(collapsePos, collapsePos);

		// 履歴に追加
		setHistory((prev) => {
			const newHistory = prev.slice(0, historyIndex + 1);
			const newPages = [...pages];
			newPages[activePage] = wrapped;
			return [...newHistory, newPages];
		});
		setHistoryIndex((prev) => prev + 1);

		setPages((prev) => {
			const next = [...prev];
			next[activePage] = wrapped;
			return next;
		});

		// テキスト更新後にカーソル位置を設定（複数回実行して確実に選択を解除）
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
	}, [activePage, selectionRange, pages, historyIndex]);

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
		[isWrapping, selectionRange],
	);

	useEffect(() => {
		const root = containerRef.current;
		if (!root) return;
		root
			.querySelectorAll(".input-wrapper")
			.forEach((w) => w.replaceWith(...Array.from(w.childNodes)));
		root.querySelectorAll(".ans-tooltip").forEach((n) => n.remove());

		const inputs = root.querySelectorAll<HTMLInputElement>("input.blank");
		inputs.forEach((input) => {
			const wrapper = document.createElement("span");
			wrapper.className = "input-wrapper";
			input.parentNode?.insertBefore(wrapper, input);
			wrapper.appendChild(input);
			const tooltip = document.createElement("div");
			tooltip.className = "ans-tooltip";
			tooltip.innerText = (input.dataset.ans || "").split("|")[0];
			wrapper.appendChild(tooltip);
			resizeInputElement(input);
			input.onkeydown = (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					const sec = input.closest(".quiz-section");
					if (!sec) return;
					const arr = Array.from(
						sec.querySelectorAll<HTMLInputElement>("input.blank"),
					);
					const idx = arr.indexOf(input);
					if (idx >= 0 && idx < arr.length - 1) arr[idx + 1].focus();
				}
			};
			input.oninput = () => {
				input.classList.remove("correct", "incorrect");
				wrapper.classList.remove("show-ans");
				resizeInputElement(input);
			};
		});
	}, [docs, activePage, tab]);

	const checkSection = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		const inputs = section.querySelectorAll<HTMLInputElement>("input.blank");
		inputs.forEach((input) => {
			const val = input.value.trim().replace(/\s+/g, "");
			const answers = (input.dataset.ans || "").split("|");
			const ok = answers.some((a) => val === a || val === a.replace(/・/g, ""));
			if (ok) {
				input.classList.add("correct");
				input.classList.remove("incorrect");
				input.parentElement?.classList.remove("show-ans");
			} else {
				input.classList.add("incorrect");
				input.classList.remove("correct");
			}
		});
	};

	const showSectionAns = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		section
			.querySelectorAll<HTMLInputElement>("input.blank")
			.forEach((input) => {
				if (!input.classList.contains("correct")) {
					input.parentElement?.classList.add("show-ans");
					input.classList.add("incorrect");
				}
			});
	};

	const resetSection = (btn: HTMLButtonElement) => {
		const section = btn.closest(".quiz-section");
		if (!section) return;
		section
			.querySelectorAll<HTMLInputElement>("input.blank")
			.forEach((input) => {
				input.value = "";
				input.classList.remove("correct", "incorrect");
				input.parentElement?.classList.remove("show-ans");
				resizeInputElement(input);
			});
	};

	const addPage = () => {
		setPages((prev) => [
			...prev,
			"# 新しいページタイトル\n## 見出し\n### セクション\n本文をここに.",
		]);
		setActivePage((prev) => prev + 1);
	};

	const removePage = () => {
		setPages((prev) => {
			if (prev.length === 1) return prev;
			const next = [...prev];
			next.splice(activePage, 1);
			return next;
		});
		setActivePage((prev) => Math.max(0, prev - 1));
	};

	useEffect(() => {
		setMounted(true);
	}, []);

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
	}, [pages, selectionRange]);

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
	}, [menuPos, selectionRange]);

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
	}, [menuPos]);

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
	}, [openCaretMenu]);

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
	}, [openCaretMenu]);

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
	}, [history, historyIndex]);

	if (!mounted) {
		return null;
	}

	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				background: "#fff",
				colorScheme: "light",
				overflow: "auto",
				padding: "16px 24px",
			}}
		>
			<div style={{ maxWidth: 1180, margin: "0 auto" }}>
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Tools", href: "/tools" },
						{ label: "穴埋めプリントジェネレーター", isCurrent: true },
					]}
					className="mb-3"
				/>

				<h1
					style={{
						fontWeight: 700,
						marginBottom: 4,
						fontSize: 32,
					}}
				>
					穴埋めプリントジェネレーター
				</h1>
				<p style={{ color: "#666", marginBottom: 16 }}>
					テキストに <code>{"{{答え|幅}}"}</code> を挿入して、プレビュー / HTML
					/ React コードを即座に生成します.
				</p>

				<EditorPanel
					pages={pages}
					activePage={activePage}
					textareaRef={textareaRef}
					isWrapping={isWrapping}
					setActivePage={setActivePage}
					setPages={setPages}
					setSelectionRange={setSelectionRange}
					openCaretMenu={openCaretMenu}
					addPage={addPage}
					removePage={removePage}
				/>

				<OutputPanel
					docs={docs}
					settings={settings}
					setSettings={setSettings}
					tab={tab}
					setTab={setTab}
					htmlCode={htmlCode}
					reactCode={reactCode}
					currentStyle={currentStyle}
					activePage={activePage}
					setActivePage={setActivePage}
					containerRef={containerRef}
					checkSection={checkSection}
					showSectionAns={showSectionAns}
					resetSection={resetSection}
				/>

				{menuPos && !isWrapping && (
					<CaretMenu
						menuPos={menuPos}
						menuRef={menuRef}
						wrapSelectionAsBlank={wrapSelectionAsBlank}
					/>
				)}
			</div>
		</div>
	);
}
