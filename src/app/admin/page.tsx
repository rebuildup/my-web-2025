"use client";

import {
	BarChart3,
	Database,
	FileStack,
	FileText,
	Image,
	PenSquare,
	ServerCog,
	Tags,
	UploadCloud,
} from "lucide-react";

const QuickNav = [
	{
		title: "コンテンツ統合管理",
		description: "コンテンツの作成・編集・公開設定、関連機能へのショートカット.",
		href: "/admin/content",
		action: "コンテンツ一覧",
		icon: FileStack,
	},
	{
		title: "Markdownページ",
		description: "コンテンツに紐づくMarkdown本文を作成・編集します.",
		href: "/admin/content/markdown",
		action: "Markdown管理",
		icon: FileText,
	},
	{
		title: "メディアライブラリ",
		description: "コンテンツ毎の画像・動画・アセットを一括管理.",
		href: "/admin/content/media",
		action: "メディア管理",
		icon: Image,
	},
	{
		title: "コンテンツDB",
		description: "SQLiteベースのコンテンツDBを複製・切替・整理します.",
		href: "/admin/content/databases",
		action: "データベース管理",
		icon: Database,
	},
	{
		title: "ブロックエディタ",
		description: "リッチなブロックエディタで記事コンテンツを構築.",
		href: "/admin/content/page-editor",
		action: "エディタを開く",
		icon: PenSquare,
	},
	{
		title: "タグ管理",
		description: "タグの一括編集と整理で分類精度を向上.",
		href: "/admin/tag-management",
		action: "タグを整理",
		icon: Tags,
	},
];

const Operations = [
	{
		title: "データマネージャー",
		description: "バックアップ・インポート・エクスポート操作をまとめて実行.",
		href: "/admin/data-manager",
		action: "データを整理",
		icon: ServerCog,
	},
	{
		title: "アクセス解析",
		description: "計測データでコンテンツのパフォーマンスを可視化.",
		href: "/admin/analytics",
		action: "分析を見る",
		icon: BarChart3,
	},
	{
		title: "アップロードテスト",
		description: "ファイルアップロードの動作確認と検証.",
		href: "/admin/upload-test",
		action: "テストする",
		icon: UploadCloud,
	},
];

const CardStyle: React.CSSProperties = {
	border: "1px solid #ddd",
	borderRadius: 6,
	padding: 16,
	display: "flex",
	flexDirection: "column",
	gap: 8,
	height: "100%",
};

const BtnStyle: React.CSSProperties = {
	display: "inline-block",
	border: "1px solid #000",
	borderRadius: 4,
	padding: "6px 14px",
	fontSize: "0.8rem",
	background: "#000",
	color: "#fff",
	textDecoration: "none",
	cursor: "pointer",
	textAlign: "center",
};

export default function AdminPage() {
	return (
		<div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: 64 }}>
			<nav style={{ fontSize: "0.8rem", marginBottom: 12, color: "#666" }}>
				<a href="/" style={{ color: "#0066cc", textDecoration: "none" }}>Home</a>
				<span style={{ margin: "0 6px" }}>/</span>
				<span style={{ color: "#000" }}>Admin</span>
			</nav>

			<h1 style={{ fontSize: "1.4rem", fontWeight: "normal", borderBottom: "1px solid #ccc", paddingBottom: 8, marginBottom: 8 }}>
				管理ダッシュボード
			</h1>
			<p style={{ fontSize: "0.85rem", color: "#666", marginTop: 0, marginBottom: 32 }}>
				コンテンツ管理と運用を効率化するための管理コンソールです.
			</p>

			<section style={{ marginBottom: 32 }}>
				<h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 12, fontWeight: 600 }}>
					コンテンツワークフロー
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
					{QuickNav.map((item) => {
						const Icon = item.icon;
						return (
							<a key={item.href} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
								<div style={CardStyle}>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
										<Icon size={16} />
										<span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.title}</span>
									</div>
									<p style={{ fontSize: "0.8rem", color: "#555", margin: 0, lineHeight: 1.5 }}>
										{item.description}
									</p>
									<span style={BtnStyle}>{item.action}</span>
								</div>
							</a>
						);
					})}
				</div>
			</section>

			<section style={{ marginBottom: 32 }}>
				<h2 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 12, fontWeight: 600 }}>
					運用・メンテナンス
				</h2>
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
					{Operations.map((item) => {
						const Icon = item.icon;
						return (
							<a key={item.href} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
								<div style={CardStyle}>
									<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
										<Icon size={16} />
										<span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{item.title}</span>
									</div>
									<p style={{ fontSize: "0.8rem", color: "#555", margin: 0, lineHeight: 1.5 }}>
										{item.description}
									</p>
									<span style={{ ...BtnStyle, background: "#fff", color: "#000" }}>{item.action}</span>
								</div>
							</a>
						);
					})}
				</div>
			</section>

			<div style={{ border: "1px solid #ddd", borderRadius: 6, padding: 16, fontSize: "0.85rem", color: "#555" }}>
				<p style={{ margin: "0 0 6px", fontWeight: 600, color: "#000" }}>ガイド</p>
				<p style={{ margin: "0 0 4px" }}>- コンテンツ登録後はMarkdown本文とメディアを紐付けて公開準備を整えましょう.</p>
				<p style={{ margin: "0 0 4px" }}>- バックアップ/切り替え用データベースを活用することで、安全な運用が可能です.</p>
				<p style={{ margin: 0 }}>- サイドバーから各機能へ素早く遷移し、ワークフロー全体の一貫性を保てます.</p>
			</div>
		</div>
	);
}
