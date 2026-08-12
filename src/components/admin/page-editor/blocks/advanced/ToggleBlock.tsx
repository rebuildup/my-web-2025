"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { EditableText } from "@/components/admin/page-editor/editor/EditableText";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function ToggleBlock({
	block,
	readOnly,
	onContentChange,
	onAttributesChange,
}: BlockComponentProps) {
	const summary = (block.attributes.summary as string | undefined) ?? "Details";
	const [expanded, setExpanded] = useState(true);

	const toggle = () => setExpanded((v) => !v);

	return (
		<section
			style={{
				borderRadius: 12,
				border: `1px solid ${adminColor.border}`,
				backgroundColor: "rgba(255,255,255,0.02)",
				overflow: "hidden",
			}}
		>
			<div
				role="button"
				tabIndex={0}
				aria-expanded={expanded}
				onClick={toggle}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						toggle();
					}
				}}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					padding: "12px 16px",
					cursor: "pointer",
				}}
			>
				<ChevronDown
					size={18}
					style={{
						transition: "transform 120ms ease",
						transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
						flexShrink: 0,
						color: adminColor.textSecondary,
					}}
				/>
				<div style={{ flex: 1, minWidth: 0 }}>
					<EditableText
						value={summary}
						onChange={(value) => onAttributesChange({ summary: value })}
						readOnly={readOnly}
						placeholder="Toggle summary"
						sx={{
							fontWeight: 600,
							backgroundColor: "transparent",
							border: "none",
							paddingLeft: 0,
							paddingRight: 0,
						}}
					/>
				</div>
			</div>
			{expanded && (
				<div
					style={{
						padding: "0 16px 16px 16px",
						display: "flex",
						flexDirection: "column",
						gap: 12,
					}}
				>
					<EditableText
						value={block.content}
						onChange={onContentChange}
						readOnly={readOnly}
						placeholder="Toggle content"
						sx={{ minHeight: "64px" }}
					/>
					<span
						style={{
							fontSize: 12,
							color: adminColor.textSecondary,
						}}
					>
						Toggle blocks collapse long explanations or FAQs.
					</span>
				</div>
			)}
		</section>
	);
}
