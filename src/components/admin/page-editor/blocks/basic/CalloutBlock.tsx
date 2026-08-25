"use client";

import { type CSSProperties } from "react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import type { BlockComponentProps } from "../types";

const CALLOUT_STYLES: Record<
	string,
	{ border: string; bg: string; text: string }
> = {
	NOTE: { border: "#3b82f6", bg: "rgba(59,130,246,0.08)", text: "#cfe0ff" },
	WARNING: { border: "#f59e0b", bg: "rgba(245,158,11,0.1)", text: "#ffe2b0" },
	CALLOUT: { border: "#8b5cf6", bg: "rgba(139,92,246,0.1)", text: "#e0d4ff" },
	TIP: { border: "#22c55e", bg: "rgba(34,197,94,0.1)", text: "#c9f7d9" },
	CAUTION: { border: "#f97316", bg: "rgba(249,115,22,0.1)", text: "#ffd6bd" },
	IMPORTANT: { border: "#ef4444", bg: "rgba(239,68,68,0.1)", text: "#ffcccc" },
};

const textStyle: CSSProperties = {
	fontSize: 16,
	backgroundColor: "transparent",
	border: "none",
	padding: 0,
	paddingTop: 4,
	paddingBottom: 4,
	whiteSpace: "pre-wrap",
	outline: "none",
};

function buildWrapperStyle(tone: {
	border: string;
	bg: string;
	text: string;
}): CSSProperties {
	return {
		borderLeft: `4px solid ${tone.border}`,
		paddingLeft: 16,
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: tone.bg,
		color: tone.text,
	};
}

export function CalloutBlock({
	block,
	readOnly,
	onContentChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	const rawFirstLine = (block.content ?? "").split(/\r?\n/)[0] ?? "";
	const match = rawFirstLine.match(
		/^\s*\[!(NOTE|WARNING|CALLOUT|TIP|CAUTION|IMPORTANT)\]/i,
	);
	const kind = match ? match[1].toUpperCase() : "NOTE";
	const tone = CALLOUT_STYLES[kind] ?? CALLOUT_STYLES.NOTE;
	const wrapperStyle = buildWrapperStyle(tone);

	return (
		<div style={wrapperStyle}>
			<EditableText
				value={block.content}
				onChange={onContentChange}
				readOnly={readOnly}
				autoFocus={autoFocus}
				onKeyDown={onKeyDown}
				placeholder="> [!NOTE] Callout"
				sx={textStyle}
			/>
		</div>
	);
}
