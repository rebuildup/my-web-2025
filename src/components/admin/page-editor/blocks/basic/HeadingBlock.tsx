"use client";

import { type CSSProperties, useMemo } from "react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

const HEADING_FONT_SIZE: Record<number, number> = {
	1: 32,
	2: 24,
	3: 20,
	4: 18,
	5: 16,
	6: 14,
};

export function HeadingBlock({
	block,
	readOnly,
	onContentChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	const level = useMemo(() => {
		const match = /^#{1,6}\s/.exec(block.content ?? "");
		if (!match) return 2;
		const hashes = match[0].trim().split(" ")[0].length;
		return Math.min(Math.max(hashes, 1), 6);
	}, [block.content]);

	const fontSize = HEADING_FONT_SIZE[level] ?? 20;
	const containerStyle: CSSProperties = {
		padding: 0,
		border: "none",
		background: "transparent",
		fontSize,
		fontWeight: 700,
		color: adminColor.textPrimary,
		outline: "none",
	};

	return (
		<div>
			<EditableText
				value={block.content}
				onChange={onContentChange}
				readOnly={readOnly}
				autoFocus={autoFocus}
				onKeyDown={onKeyDown}
				placeholder="Heading"
				sx={containerStyle}
			/>
		</div>
	);
}
