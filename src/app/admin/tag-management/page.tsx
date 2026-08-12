"use client";

import { Tags } from "lucide-react";
import { PageHeader } from "@/components/admin/layout";
import { adminColor } from "@/components/admin/ui/tokens";

export default function TagManagementPage() {
	return (
		<div style={{ display: "grid", gap: 32 }}>
			<PageHeader
				title="タグ管理"
				description="タグの一括編集と整理で分類精度を向上させます."
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "タグ管理", href: "/admin/tag-management" },
				]}
			/>
			<section
				style={{
					padding: 64,
					textAlign: "center",
					border: `2px dashed ${adminColor.border}`,
					borderRadius: 8,
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						marginBottom: 16,
						color: adminColor.textSecondary,
					}}
				>
					<Tags size={48} />
				</div>
				<h2
					style={{
						fontSize: 20,
						fontWeight: 600,
						color: adminColor.textSecondary,
						margin: 0,
						marginBottom: 8,
					}}
				>
					Under Construction
				</h2>
				<p style={{ color: adminColor.textSecondary, margin: 0 }}>
					この機能は現在開発中です.
				</p>
			</section>
		</div>
	);
}
