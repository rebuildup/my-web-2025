"use client";

import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function ListBlock({
	block,
	readOnly,
	onContentChange,
	onAttributesChange,
	autoFocus,
	onKeyDown,
}: BlockComponentProps) {
	const kind =
		(block.attributes.kind as string) ||
		(block.attributes.ordered ? "ordered" : "unordered");
	const order = (block.attributes.order as number) || 1;
	const checked = Boolean(block.attributes.checked);

	const renderMarker = () => {
		if (kind === "todo") {
			return (
				<input
					type="checkbox"
					checked={checked}
					disabled={readOnly}
					onChange={() => onAttributesChange?.({ checked: !checked })}
					style={{
						width: 18,
						height: 18,
						marginTop: 6,
						accentColor: adminColor.accent,
						cursor: readOnly ? "default" : "pointer",
					}}
				/>
			);
		}
		if (kind === "ordered") {
			return (
				<span
					style={{
						width: 24,
						textAlign: "right",
						paddingRight: 8,
						fontSize: 14,
						color: adminColor.textSecondary,
					}}
				>
					{order}.
				</span>
			);
		}
		return (
			<span
				style={{
					width: 24,
					textAlign: "center",
					fontSize: 14,
					color: adminColor.textSecondary,
				}}
			>
				•
			</span>
		);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				alignItems: "flex-start",
				gap: 8,
			}}
		>
			{renderMarker()}
			<div style={{ flex: 1 }}>
				<EditableText
					value={block.content}
					onChange={(v) => onContentChange?.(v)}
					readOnly={readOnly}
					autoFocus={autoFocus}
					onKeyDown={onKeyDown}
					placeholder="List item"
					sx={{
						flex: 1,
						fontSize: 16,
						backgroundColor: "transparent",
						border: "none",
						paddingLeft: 0,
						paddingRight: 0,
						paddingTop: 4,
						paddingBottom: 4,
					}}
				/>
			</div>
		</div>
	);
}
