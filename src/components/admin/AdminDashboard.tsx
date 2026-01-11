"use client";

import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	Container,
	Divider,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { MUIThemeProvider } from "@/lib/theme";

export default function AdminDashboard() {
	const sections: Array<{
		title: string;
		description: string;
		href: string;
		action: string;
	}> = [
		{
			title: "Content",
			description: "コンテンツ一覧と各種操作（DB/Markdown/メディア/エディタ）",
			href: "/admin/content",
			action: "Open",
		},
		{
			title: "Page Editor",
			description: "ブロックエディタで記事を作成・編集",
			href: "/admin/content/page-editor",
			action: "Open",
		},
	];

	return (
		<MUIThemeProvider>
			<Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
				<Container maxWidth="lg" sx={{ py: 6 }}>
					<Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
						<Typography variant="h4" component="h1" fontWeight={700}>
							Admin Dashboard
						</Typography>
						<Chip label="MUI" color="primary" size="small" />
					</Box>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
						コンテンツデータ操作とページ編集に特化した管理パネルです.
					</Typography>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
							gap: 3,
							maxWidth: 800,
						}}
					>
						{sections.map((s) => (
							<Card
								key={s.href}
								variant="outlined"
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
								}}
							>
								<CardHeader title={s.title} sx={{ pb: 1 }} />
								<CardContent sx={{ flexGrow: 1, pt: 1 }}>
									<Typography variant="body2" color="text.secondary">
										{s.description}
									</Typography>
								</CardContent>
								<Divider />
								<CardActions sx={{ p: 2, pt: 1 }}>
									<Button
										component={Link}
										href={s.href}
										variant="contained"
										size="small"
									>
										{s.action}
									</Button>
								</CardActions>
							</Card>
						))}
					</Box>

					<Box
						sx={{
							mt: 6,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Button component={Link} href="/" variant="text">
							← Back to site
						</Button>
						<Typography variant="caption" color="text.secondary">
							© 2025 Admin
						</Typography>
					</Box>
				</Container>
			</Box>
		</MUIThemeProvider>
	);
}
