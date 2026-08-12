"use client";

import { CalendarCheck } from "lucide-react";
import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function CalendarBlock({ block }: BlockComponentProps) {
	return (
		<section
			style={{
				border: `1px solid ${adminColor.border}`,
				borderRadius: 12,
				padding: 20,
				backgroundColor: "rgba(255,255,255,0.02)",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: 12,
					}}
				>
					<CalendarCheck size={20} color={adminColor.accent} />
					<span
						style={{
							fontSize: 14,
							fontWeight: 600,
							color: adminColor.textPrimary,
						}}
					>
						Calendar block
					</span>
				</div>
				<p
					style={{
						fontSize: 14,
						color: adminColor.textSecondary,
						margin: 0,
					}}
				>
					{block.content || "Calendar view placeholder."}
				</p>
			</div>
		</section>
	);
}
