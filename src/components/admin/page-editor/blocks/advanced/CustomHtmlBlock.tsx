"use client";

import { Code, Eye } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

type ViewMode = "edit" | "preview";

const containerStyle: React.CSSProperties = {
	borderRadius: 12,
	border: `1px solid ${adminColor.border}`,
	backgroundColor: "rgba(255,255,255,0.02)",
	overflow: "hidden",
};

const controlsStyle: React.CSSProperties = {
	position: "absolute",
	top: 6,
	right: 6,
	zIndex: 1,
	opacity: 0,
	pointerEvents: "none",
	transition: "opacity 120ms ease",
	backgroundColor: "rgba(15,23,42,0.5)",
	backdropFilter: "blur(4px)",
	borderRadius: 4,
};

const viewModeGroupStyle: React.CSSProperties = {
	display: "inline-flex",
	gap: 2,
};

const viewModeButtonStyle: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: 6,
	background: "transparent",
	color: "#fff",
	border: "none",
	borderRadius: 2,
	cursor: "pointer",
};

const viewModeButtonActiveStyle: React.CSSProperties = {
	...viewModeButtonStyle,
	background: adminColor.accent,
};

const previewWrapperStyle: React.CSSProperties = {
	borderRadius: 4,
	border: `1px dashed ${adminColor.border}`,
	backgroundColor: "rgba(255,255,255,0.04)",
	minHeight: 100,
	padding: 10,
	overflow: "auto",
};

const editorStyle: React.CSSProperties = {
	fontSize: 14,
	fontFamily:
		'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	backgroundColor: "rgba(15,23,42,0.4)",
	borderRadius: 4,
	minHeight: 140,
	border: `1px solid ${adminColor.border}`,
	whiteSpace: "pre-wrap",
	padding: 10,
};

export function CustomHtmlBlock({
	block,
	readOnly,
	onContentChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	const [mode, setMode] = useState<ViewMode>(() => {
		if (readOnly) {
			return "preview";
		}
		return block.content?.trim() ? "preview" : "edit";
	});

	const sanitizedHtml = useMemo(
		() => (block.content ?? "").trim(),
		[block.content],
	);
	const previewRef = useRef<HTMLDivElement | null>(null);
	const lastHtmlRef = useRef<string>("");

	const handleModeChange = useCallback((next: ViewMode) => {
		setMode(next);
	}, []);

	useEffect(() => {
		if (!previewRef.current || (mode !== "preview" && !readOnly)) {
			return;
		}

		if (lastHtmlRef.current === sanitizedHtml && sanitizedHtml !== "") {
			return;
		}

		previewRef.current.innerHTML = sanitizedHtml;
		lastHtmlRef.current = sanitizedHtml;

		const scripts = Array.from(
			previewRef.current.querySelectorAll("script"),
		) as HTMLScriptElement[];

		scripts.forEach((script) => {
			const replacement = document.createElement("script");
			Array.from(script.attributes).forEach((attr) => {
				replacement.setAttribute(attr.name, attr.value);
			});
			replacement.textContent = script.textContent;
			script.replaceWith(replacement);
		});
	}, [mode, readOnly, sanitizedHtml]);

	const effectiveMode: ViewMode = readOnly ? "preview" : mode;

	return (
		<section style={containerStyle}>
			<div
				className="block-custom-html"
				style={{ position: "relative", padding: 0 }}
			>
				{!readOnly && (
					<div className="custom-html-controls" style={controlsStyle}>
						<div role="group" aria-label="View mode" style={viewModeGroupStyle}>
							{(["edit", "preview"] as const).map((m) => {
								const active = mode === m;
								return (
									<button
										key={m}
										type="button"
										aria-pressed={active}
										aria-label={`${m} HTML`}
										onClick={() => handleModeChange(m)}
										style={
											active ? viewModeButtonActiveStyle : viewModeButtonStyle
										}
									>
										{m === "edit" ? <Code size={16} /> : <Eye size={16} />}
									</button>
								);
							})}
						</div>
					</div>
				)}
				{effectiveMode === "preview" ? (
					<div style={previewWrapperStyle}>
						{sanitizedHtml && <div ref={previewRef} />}
					</div>
				) : (
					<EditableText
						value={block.content}
						onChange={onContentChange}
						autoFocus={autoFocus}
						readOnly={readOnly}
						onKeyDown={onKeyDown}
						placeholder="<div>Hello world</div>"
						sx={editorStyle}
					/>
				)}
			</div>
		</section>
	);
}
