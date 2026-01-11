"use client";

import Link from "next/link";
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Grid,
	Stack,
	Typography,
	Divider,
} from "@mui/material";
import {
	FileStack,
	FileText,
	Image,
	Database,
	PenSquare,
	Tags,
	ServerCog,
	BarChart3,
	UploadCloud,
} from "lucide-react";
import { PageHeader } from "@/components/admin/layout";

const QuickNav = [
	{
		title: "コンテンツ統合管理",
		description:
			"コンテンツの作成・編集・公開設定、関連機能へのショートカット.",
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

export default function AdminPage() {
	return (
		<Box sx={{ display: "grid", gap: 4 }}>
			<PageHeader
				title="管理ダッシュボード"
				description="コンテンツ管理と運用を効率化するための管理コンソールです.サイドバーから各機能に素早く移動できます."
				breadcrumbs={[{ label: "Admin", href: "/admin" }]}
				statusChip={{ label: "開発環境", color: "info" }}
				actions={
					<Button
						component={Link}
						href="/admin/content"
						variant="contained"
						size="large"
					>
						コンテンツを管理
					</Button>
				}
			/>

			<Box>
				<Typography
					variant="subtitle2"
					color="text.secondary"
					sx={{ letterSpacing: 0.6, textTransform: "uppercase", mb: 1.5 }}
				>
					コンテンツワークフロー
				</Typography>
				<Grid container spacing={2.5}>
					{QuickNav.map((item) => {
						const Icon = item.icon;
						return (
							<Grid item xs={12} md={6} key={item.href}>
								<Card
									variant="outlined"
									sx={{
										height: "100%",
										display: "flex",
										flexDirection: "column",
										borderColor: "divider",
									}}
								>
									<CardContent sx={{ flexGrow: 1, display: "grid", gap: 1.5 }}>
										<Stack direction="row" spacing={1} alignItems="center">
											<Box
												sx={{
													width: 36,
													height: 36,
													borderRadius: 1.5,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: "action.hover",
													color: "primary.main",
												}}
											>
												<Icon size={18} />
											</Box>
											<Typography variant="h6" fontWeight={600}>
												{item.title}
											</Typography>
										</Stack>
										<Typography variant="body2" color="text.secondary">
											{item.description}
										</Typography>
									</CardContent>
									<Divider />
									<CardActions sx={{ p: 2 }}>
										<Button
											component={Link}
											href={item.href}
											variant="contained"
											size="small"
										>
											{item.action}
										</Button>
									</CardActions>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>

			<Box>
				<Typography
					variant="subtitle2"
					color="text.secondary"
					sx={{ letterSpacing: 0.6, textTransform: "uppercase", mb: 1.5 }}
				>
					運用・メンテナンス
				</Typography>
				<Grid container spacing={2.5}>
					{Operations.map((item) => {
						const Icon = item.icon;
						return (
							<Grid item xs={12} md={4} key={item.href}>
								<Card
									variant="outlined"
									sx={{
										height: "100%",
										display: "flex",
										flexDirection: "column",
										borderColor: "divider",
									}}
								>
									<CardContent sx={{ flexGrow: 1, display: "grid", gap: 1.25 }}>
										<Stack direction="row" spacing={1} alignItems="center">
											<Box
												sx={{
													width: 32,
													height: 32,
													borderRadius: 1,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: "action.hover",
													color: "text.primary",
												}}
											>
												<Icon size={17} />
											</Box>
											<Typography variant="subtitle1" fontWeight={600}>
												{item.title}
											</Typography>
										</Stack>
										<Typography variant="body2" color="text.secondary">
											{item.description}
										</Typography>
									</CardContent>
									<Divider />
									<CardActions sx={{ p: 2 }}>
										<Button
											component={Link}
											href={item.href}
											size="small"
											variant="outlined"
										>
											{item.action}
										</Button>
									</CardActions>
								</Card>
							</Grid>
						);
					})}
				</Grid>
			</Box>

			<Card
				variant="outlined"
				sx={{
					borderColor: "divider",
					bgcolor: "background.paper",
				}}
			>
				<CardContent
					sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
				>
					<Stack
						direction={{ xs: "column", sm: "row" }}
						spacing={{ xs: 1.5, sm: 3 }}
						alignItems={{ xs: "flex-start", sm: "center" }}
					>
						<Chip label="ガイド" color="primary" size="small" />
						<Typography variant="subtitle1" fontWeight={600}>
							コンテンツ管理のポイント
						</Typography>
					</Stack>
					<Typography variant="body2" color="text.secondary">
						-
						コンテンツ登録後はMarkdown本文とメディアを紐付けて公開準備を整えましょう.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						-
						バックアップ/切り替え用データベースを活用することで、安全な運用が可能です.
					</Typography>
					<Typography variant="body2" color="text.secondary">
						-
						サイドバーから各機能へ素早く遷移し、ワークフロー全体の一貫性を保てます.
					</Typography>
				</CardContent>
			</Card>
		</Box>
	);
}
