"use client";

import {
	AppBar,
	Box,
	Tab,
	Tabs,
	Toolbar,
	Typography,
	useMediaQuery,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const _DRAWER_WIDTH = 248;
const NAV_TABS = [
	{ label: "コンテンツ一覧", href: "/admin/content" },
	{ label: "ブロックエディタ", href: "/admin/content/page-editor" },
	{ label: "Markdownページ", href: "/admin/content/markdown" },
	{ label: "メディアライブラリ", href: "/admin/content/media" },
	{ label: "データベース", href: "/admin/content/databases" },
];

export interface AdminShellProps {
	children: React.ReactNode;
}

function getTabIndex(pathname: string): number {
	// 1) exact match first
	const exact = NAV_TABS.findIndex((t) => pathname === t.href);
	if (exact !== -1) return exact;
	// 2) longest prefix match (to avoid '/admin/content/page-editor' being treated as '/admin/content')
	let best = -1;
	let bestLen = -1;
	NAV_TABS.forEach((t, i) => {
		const prefix = `${t.href}/`;
		if (pathname.startsWith(prefix) && t.href.length > bestLen) {
			best = i;
			bestLen = t.href.length;
		}
	});
	return best !== -1 ? best : 0;
}

export function AdminShell({ children }: AdminShellProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [_mobileOpen, _setMobileOpen] = useState(false);
	// useMediaQueryはSSRとCSRで異なる値を返す可能性があるため、noSsrオプションを使用
	const _isDesktop = useMediaQuery("(min-width:900px)", { noSsr: true });
	const isFullWidthPage = pathname.startsWith("/admin/content/page-editor");
	const tabIndex = getTabIndex(pathname);

	const onTabChange = (_: unknown, value: number) => {
		const target = NAV_TABS[value];
		if (target) router.push(target.href);
	};

	// /admin 直下に来た場合はコンテンツ一覧へリダイレクト
	useEffect(() => {
		if (pathname === "/admin") {
			router.replace("/admin/content");
		}
	}, [pathname, router]);

	return (
		<Box
			sx={{
				display: "flex",
				height: "100%",
				minHeight: "100%",
				bgcolor: "background.default",
			}}
		>
			<AppBar
				position="fixed"
				elevation={0}
				color="default"
				sx={{
					borderBottom: 1,
					borderColor: "divider",
					bgcolor: "background.paper",
					width: "100%",
					ml: 0,
				}}
			>
				<Toolbar
					disableGutters
					sx={{
						px: 0,
						minHeight: 64,
						display: "flex",
						gap: 2,
						flexWrap: "wrap",
					}}
				>
					<Typography
						variant="subtitle1"
						fontWeight={600}
						noWrap
						sx={{ pl: 2 }}
					>
						Content Management
					</Typography>
					<Box sx={{ flex: 1 }} />
					<Tabs
						value={tabIndex}
						onChange={onTabChange}
						variant="scrollable"
						scrollButtons="auto"
						sx={{ minHeight: 40 }}
					>
						{NAV_TABS.map((t) => (
							<Tab key={t.href} label={t.label} sx={{ minHeight: 40 }} />
						))}
					</Tabs>
				</Toolbar>
			</AppBar>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: "100%",
					pt: isFullWidthPage ? 8 : { xs: 8, md: 8 },
					pb: isFullWidthPage ? 0 : { xs: 4, md: 6 },
					px: 0,
				}}
			>
				<Toolbar sx={{ display: { xs: "block", md: "none" }, minHeight: 16 }} />
				{isFullWidthPage ? (
					children
				) : (
					<Box
						sx={{
							mx: "auto",
							width: "100%",
							maxWidth: { sm: 640, md: 768, lg: 1024, xl: 1280 },
							px: { xs: 2, sm: 3, md: 4 },
						}}
					>
						{children}
					</Box>
				)}
			</Box>
		</Box>
	);
}
