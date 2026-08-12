"use client";

import { List } from "lucide-react";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function TableOfContentsBlock(_: BlockComponentProps) {
	return (
		<section
			style={{
				border: `1px solid ${adminColor.border}`,
				borderRadius: 12,
				padding: 20,
				backgroundColor: "rgba(255,255,255,0.02)",
				display: "flex",
				flexDirection: "column",
				gap: 8,
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					gap: 12,
				}}
			>
				<List size={20} color={adminColor.accent} />
				<span
					style={{
						fontSize: 14,
						fontWeight: 600,
						color: adminColor.textPrimary,
					}}
				>
					Table of contents
				</span>
			</div>
			<p
				style={{
					fontSize: 14,
					color: adminColor.textSecondary,
					margin: 0,
				}}
			>
				Table of contents is generated automatically based on heading blocks.
			</p>
		</section>
	);
}
