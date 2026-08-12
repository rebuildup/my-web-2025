"use client";

import { Table } from "lucide-react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function TableBlock({
	block,
	readOnly,
	onContentChange,
}: BlockComponentProps) {
	return (
		<section
			style={{
				border: `1px solid ${adminColor.border}`,
				borderRadius: 12,
				padding: 20,
				backgroundColor: "rgba(255,255,255,0.02)",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 12,
					}}
				>
					<Table size={20} color={adminColor.accent} />
					<span
						style={{
							fontSize: 14,
							fontWeight: 600,
							color: adminColor.textPrimary,
						}}
					>
						Table (Markdown-compatible)
					</span>
				</div>
				<EditableText
					value={block.content}
					onChange={onContentChange}
					readOnly={readOnly}
					placeholder="Describe the table in Markdown"
					sx={{
						fontFamily: "monospace",
						minHeight: "120px",
					}}
				/>
			</div>
		</section>
	);
}
