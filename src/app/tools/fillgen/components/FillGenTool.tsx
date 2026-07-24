"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CaretMenu } from "./CaretMenu";
import { EditorPanel } from "./EditorPanel";
import { OutputPanel } from "./OutputPanel";
import { parseDoc } from "./parser";
import { defaultInput, presets } from "./presets";
import { renderHtml, renderReact } from "./renderers";
import { generateStyle } from "./style-generator";
import type { StyleSettings } from "./types";
import { usePreviewSync } from "./useQuizSectionHandlers";
import { useSelectionMenu } from "./useSelectionMenu";
import { useUndoHistory } from "./useUndoHistory";

const _baseStyle = generateStyle(presets.default);

export default function FillGenTool() {
	const [pages, setPages] = useState<string[]>([defaultInput]);
	const [activePage, setActivePage] = useState(0);
	const [tab, setTab] = useState<"preview" | "html" | "react">("preview");
	const [settings, setSettings] = useState<StyleSettings>(presets.default);
	const [mounted, setMounted] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const docs = useMemo(() => pages.map((p) => parseDoc(p)), [pages]);
	const currentStyle = useMemo(() => generateStyle(settings), [settings]);
	const htmlCode = useMemo(() => renderHtml(docs, settings), [docs, settings]);
	const reactCode = useMemo(
		() => renderReact(docs, settings),
		[docs, settings],
	);

	const { pushHistory } = useUndoHistory(textareaRef, setPages, [defaultInput]);
	const {
		menuPos,
		isWrapping,
		setSelectionRange,
		openCaretMenu,
		wrapSelectionAsBlank,
	} = useSelectionMenu(textareaRef, menuRef, setPages, pushHistory, {
		pages,
		activePage,
	});

	usePreviewSync(containerRef, docs, activePage, tab);

	useEffect(() => {
		setMounted(true);
	}, []);

	const addPage = useCallback(() => {
		setPages((prev) => [
			...prev,
			"# 新しいページタイトル\n## 見出し\n### セクション\n本文をここに.",
		]);
		setActivePage((prev) => prev + 1);
	}, []);

	const removePage = useCallback(() => {
		setPages((prev) => {
			if (prev.length === 1) return prev;
			const next = [...prev];
			next.splice(activePage, 1);
			return next;
		});
		setActivePage((prev) => Math.max(0, prev - 1));
	}, [activePage]);

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
