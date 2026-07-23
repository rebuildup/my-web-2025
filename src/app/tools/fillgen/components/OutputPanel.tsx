"use client";

import type { Dispatch, SetStateAction, RefObject } from "react";
import type { Doc, StyleSettings } from "./types";
import { PreviewView } from "./PreviewView";
import { StyleSettingsPanel } from "./StyleSettingsPanel";
import { copyText, downloadFile, sanitizeFilename } from "./utils";

type Tab = "preview" | "html" | "react";

type Props = {
	docs: Doc[];
	settings: StyleSettings;
	setSettings: Dispatch<SetStateAction<StyleSettings>>;
	tab: Tab;
	setTab: (tab: Tab) => void;
	htmlCode: string;
	reactCode: string;
	currentStyle: string;
	activePage: number;
	setActivePage: (i: number) => void;
	containerRef: RefObject<HTMLDivElement | null>;
};

const TABS: { key: Tab; label: string }[] = [
	{ key: "preview", label: "プレビュー" },
	{ key: "html", label: "HTML" },
	{ key: "react", label: "React" },
];

export function OutputPanel({
	docs,
	settings,
	setSettings,
	tab,
	setTab,
	htmlCode,
	reactCode,
	currentStyle,
	activePage,
	setActivePage,
	containerRef,
}: Props) {
	return (
		<fieldset style={{ border: "1px solid #ccc", padding: 16 }}>
			<legend>出力</legend>
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
					<div
						style={{
							display: "flex",
							gap: 0,
							borderBottom: "1px solid #ccc",
						}}
					>
						{TABS.map(({ key, label }) => (
							<button
								key={key}
								type="button"
								onClick={() => setTab(key)}
								style={{
									padding: "8px 16px",
									border: "none",
									borderBottom:
										tab === key ? "2px solid #000" : "2px solid transparent",
									background: "none",
									cursor: "pointer",
									fontSize: "14px",
								}}
							>
								{label}
							</button>
						))}
					</div>
					<div style={{ flexGrow: 1 }} />
					{tab !== "preview" && (
						<div style={{ display: "flex", gap: 8 }}>
							<button
								type="button"
								onClick={() => {
									const content = tab === "html" ? htmlCode : reactCode;
									const title = docs[0]?.title ?? "quiz";
									const sanitizedTitle = sanitizeFilename(title);
									const filename =
										tab === "html"
											? `${sanitizedTitle}.html`
											: `${sanitizedTitle}.tsx`;
									downloadFile(content, filename);
								}}
								style={{
									padding: "8px 16px",
									fontSize: 14,
									cursor: "pointer",
								}}
							>
								ダウンロード
							</button>
							<button
								type="button"
								onClick={async () => {
									const ok = await copyText(
										tab === "html" ? htmlCode : reactCode,
									);
									alert(ok ? "コピーしました" : "コピー失敗");
								}}
								style={{
									padding: "8px 16px",
									fontSize: 14,
									cursor: "pointer",
								}}
							>
								コピー
							</button>
						</div>
					)}
				</div>

				{tab === "preview" && (
					<>
						<PreviewView
							docs={docs}
							currentStyle={currentStyle}
							activePage={activePage}
							setActivePage={setActivePage}
							containerRef={containerRef}
						/>
						<StyleSettingsPanel settings={settings} setSettings={setSettings} />
					</>
				)}

				{tab === "html" && (
					<pre className="whitespace-pre-wrap break-words bg-[#0b1021] text-[#e6e6e6] p-4 rounded-lg border border-[#333] max-h-[80vh] overflow-auto text-[13px]">
						{htmlCode}
					</pre>
				)}

				{tab === "react" && (
					<pre className="whitespace-pre-wrap break-words bg-[#0b1021] text-[#e6e6e6] p-4 rounded-lg border border-[#333] max-h-[80vh] overflow-auto text-[13px]">
						{reactCode}
					</pre>
				)}
			</div>
		</fieldset>
	);
}
