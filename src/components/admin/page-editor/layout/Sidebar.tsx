"use client";

import type { ReactNode } from "react";
import { adminColor } from "@/components/admin/ui/tokens";

export interface SidebarProps {
	children: ReactNode;
	title?: string;
}

export function Sidebar({ children, title }: SidebarProps) {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 24,
			}}
		>
			{title && (
				<header
					style={{
						letterSpacing: 0.3,
						fontWeight: 600,
						fontSize: 18,
						color: adminColor.textPrimary,
					}}
				>
					{title}
				</header>
			)}
			<section
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 24,
				}}
			>
				{children}
			</section>
		</div>
	);
}
