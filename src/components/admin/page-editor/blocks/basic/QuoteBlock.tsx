"use client";

import { type CSSProperties } from "react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

const wrapperStyle: CSSProperties = {
	borderLeft: `4px solid ${adminColor.border}`,
	paddingLeft: 16,
	paddingTop: 8,
	paddingBottom: 8,
	color: adminColor.textSecondary,
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

export function QuoteBlock({
	block,
	readOnly,
	onContentChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	return (
		<div style={wrapperStyle}>
			<EditableText
				value={block.content}
				onChange={onContentChange}
				readOnly={readOnly}
				autoFocus={autoFocus}
				onKeyDown={onKeyDown}
				placeholder="> Quote"
				sx={textStyle}
			/>
		</div>
	);
}
