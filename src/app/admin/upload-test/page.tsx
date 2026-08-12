"use client";

import { UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/admin/layout";
import { adminColor } from "@/components/admin/ui/tokens";

export default function UploadTestPage() {
	return (
		<div style={{ display: "grid", gap: 32 }}>
			<PageHeader
				title="アップロードテスト"
				description="ファイルアップロード機能の動作確認を行います."
				breadcrumbs={[
					{ label: "Admin", href: "/admin" },
					{ label: "アップロードテスト", href: "/admin/upload-test" },
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
					<UploadCloud size={48} />
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
