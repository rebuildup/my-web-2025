"use client";

import type { RefObject, Dispatch, SetStateAction } from "react";

type Props = {
	pages: string[];
	activePage: number;
	textareaRef: RefObject<HTMLTextAreaElement | null>;
	isWrapping: boolean;
	setActivePage: (i: number) => void;
	setPages: Dispatch<SetStateAction<string[]>>;
	setSelectionRange: (range: { start: number; end: number } | null) => void;
	openCaretMenu: (opts?: {
		start?: number;
		end?: number;
		suppressAlert?: boolean;
		anchor?: { left: number; top: number };
	}) => void;
	addPage: () => void;
	removePage: () => void;
};

export function EditorPanel({
	pages,
	activePage,
	textareaRef,
	isWrapping,
	setActivePage,
	setPages,
	setSelectionRange,
	openCaretMenu,
	addPage,
	removePage,
}: Props) {
	return (
		<fieldset
			style={{
				border: "1px solid #ccc",
				padding: 16,
				marginBottom: 24,
			}}
		>
			<legend>エディタ</legend>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						gap: 8,
						alignItems: "center",
					}}
				>
					<div
						style={{
							display: "flex",
							gap: 0,
							borderBottom: "1px solid #ccc",
							flexGrow: 1,
							minWidth: 0,
							overflow: "auto",
						}}
					>
						{pages.map((page, i) => (
							<button
								key={page}
								type="button"
								onClick={() => setActivePage(i)}
								style={{
									padding: "8px 16px",
									border: "none",
									borderBottom:
										activePage === i
											? "2px solid #000"
											: "2px solid transparent",
									background: "none",
									cursor: "pointer",
									fontSize: "14px",
									whiteSpace: "nowrap",
								}}
							>
								ページ {i + 1}
							</button>
						))}
					</div>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							type="button"
							onClick={addPage}
							style={{
								padding: "8px 16px",
								fontSize: 14,
								cursor: "pointer",
							}}
						>
							+ ページ追加
						</button>
						<button
							type="button"
							onClick={removePage}
							disabled={pages.length === 1}
							style={{
								padding: "8px 16px",
								fontSize: 14,
								cursor: pages.length === 1 ? "not-allowed" : "pointer",
								opacity: pages.length === 1 ? 0.5 : 1,
							}}
						>
							ページ削除
						</button>
					</div>
				</div>

				<textarea
					ref={textareaRef}
					value={pages[activePage]}
					onChange={(e) =>
						setPages((prev) => {
							const next = [...prev];
							next[activePage] = e.target.value;
							return next;
						})
					}
					onSelect={(e) => {
						// 穴埋め化処理中は選択範囲を更新しない
						if (isWrapping) return;
						const textarea = textareaRef.current;
						if (
							textarea &&
							textarea.selectionStart !== null &&
							textarea.selectionEnd !== null
						) {
							setSelectionRange({
								start: textarea.selectionStart,
								end: textarea.selectionEnd,
							});
						}
					}}
					onMouseUp={(e) => {
						// 穴埋め化処理中は選択範囲を更新しない
						if (isWrapping) return;
						const textarea = textareaRef.current;
						if (
							textarea &&
							textarea.selectionStart !== null &&
							textarea.selectionEnd !== null
						) {
							const start = textarea.selectionStart;
							const end = textarea.selectionEnd;
							setSelectionRange({
								start,
								end,
							});
							if (start !== end) {
								const mouseLeft = e.clientX;
								const mouseTop = e.clientY;
								requestAnimationFrame(() => {
									if (mouseLeft || mouseTop) {
										openCaretMenu({
											start,
											end,
											suppressAlert: true,
											anchor: { left: mouseLeft, top: mouseTop },
										});
										return;
									}
									openCaretMenu({
										start,
										end,
										suppressAlert: true,
									});
								});
							}
						}
					}}
					onKeyUp={(e) => {
						// 穴埋め化処理中は選択範囲を更新しない
						if (isWrapping) return;
						const textarea = textareaRef.current;
						if (
							textarea &&
							textarea.selectionStart !== null &&
							textarea.selectionEnd !== null
						) {
							const start = textarea.selectionStart;
							const end = textarea.selectionEnd;
							setSelectionRange({
								start,
								end,
							});
							if (start !== end) {
								requestAnimationFrame(() => {
									openCaretMenu({
										start,
										end,
										suppressAlert: true,
									});
								});
							}
						}
					}}
					rows={14}
					placeholder="# タイトル&#10;## 見出し&#10;### セクション&#10;本文を入力"
					className="w-full font-mono text-sm p-2 border border-gray-300 rounded resize-y box-border"
				/>
				<p style={{ color: "#666", fontSize: 13 }}>
					記法: <code>#</code> タイトル, <code>##</code> メイン見出し,{" "}
					<code>###</code>
					セクション見出し, 空行で段落区切り.
				</p>
			</div>
		</fieldset>
	);
}
