"use client";

import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/admin/layout";
import { adminColor } from "@/components/admin/ui/tokens";

export default function AnalyticsPage() {
	return (
		<div style={{ display: "grid", gap: 32 }}>
			<PageHeader
				title="アクセス解析"
				description="コンテンツのパフォーマンスと利用状況を可視化します."
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "アクセス解析", href: "/admin/analytics" },
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
					<BarChart3 size={48} />
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
