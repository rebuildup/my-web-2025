"use client";

import { adminColor } from "@/components/admin/ui/tokens";
import type { BlockComponentProps } from "../types";

export function DividerBlock(_: BlockComponentProps) {
	return (
		<hr
			style={{
				border: 0,
				borderTop: `2px solid ${adminColor.border}`,
				margin: "12px 0",
			}}
		/>
	);
}
