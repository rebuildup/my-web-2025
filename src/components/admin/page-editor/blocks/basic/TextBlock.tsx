"use client";

import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import type { BlockComponentProps } from "../types";

export function TextBlock({
	block,
	readOnly,
	onContentChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	return (
		<EditableText
			value={block.content}
			onChange={onContentChange}
			readOnly={readOnly}
			autoFocus={autoFocus}
			onKeyDown={onKeyDown}
			placeholder="Write text"
			sx={{
				backgroundColor: "transparent",
				border: "none",
				paddingLeft: 0,
				paddingRight: 0,
				paddingTop: 0.5,
				paddingBottom: 0.5,
			}}
		/>
	);
}
