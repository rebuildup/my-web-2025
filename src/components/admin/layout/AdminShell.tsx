"use client";

import {
	AppBar,
	Box,
	Chip,
	Divider,
	Drawer,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	Toolbar,
	Tooltip,
	Typography,
	useMediaQuery,
} from "@mui/material";
import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	Database,
	FileText,
	FolderTree,
	Image,
	LayoutDashboard,
	Menu,
	PenSquare,
	ServerCog,
	Tags,
	UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { MUIThemeProvider } from "@/lib/theme";

const DRAWER_WIDTH = 248;

interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	exact?: boolean;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
	{
		title: "Overview",
		items: [
			{
				label: "ダッシュボード",
				href: "/admin",
				icon: LayoutDashboard,
				exact: true,
			},
		],
	},
	{
		title: "コンテンツ管理",
		items: [
			{
				label: "コンテンツ一覧",
				href: "/admin/content",
				icon: FolderTree,
			},
			{
				label: "Markdownページ",
				href: "/admin/content/markdown",
				icon: FileText,
			},
			{
				label: "メディアライブラリ",
				href: "/admin/content/media",
				icon: Image,
			},
			{
				label: "データベース",
				href: "/admin/content/databases",
				icon: Database,
			},
			{
				label: "ブロックエディタ",
				href: "/admin/content/page-editor",
				icon: PenSquare,
			},
			{
				label: "タグ管理",
				href: "/admin/tag-management",
				icon: Tags,
			},
		],
	},
	{
		title: "オペレーション",
		items: [
			{
				label: "データマネージャー",
				href: "/admin/data-manager",
				icon: ServerCog,
			},
			{
				label: "アクセス解析",
				href: "/admin/analytics",
				icon: BarChart3,
			},
			{
				label: "アップロードテスト",
				href: "/admin/upload-test",
				icon: UploadCloud,
			},
		],
	},
];

export interface AdminShellProps {
	children: React.ReactNode;
}

function DrawerContent({ pathname }: { pathname: string }) {
	const isActive = (href: string, exact?: boolean) => {
		if (exact) {
			return pathname === href;
		}
		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
			}}
		>
			<Toolbar
				sx={{
					px: 2,
					minHeight: 64,
					display: "flex",
					alignItems: "center",
					gap: 1.5,
				}}
			>
				<Typography variant="h6" fontWeight={700}>
					CMS Console
				</Typography>
				<Chip label="Dev only" size="small" color="secondary" />
			</Toolbar>
			<Divider />
			<Box sx={{ flex: 1, overflowY: "auto" }}>
				{NAV_SECTIONS.map((section) => (
					<List
						key={section.title}
						disablePadding
						subheader={
							<ListSubheader
								component="div"
								disableSticky
								sx={{
									bgcolor: "transparent",
									color: "text.secondary",
									typography: "overline",
									fontSize: 11,
									letterSpacing: 0.8,
									px: 2.5,
									pt: 3,
									pb: 1,
								}}
							>
								{section.title}
							</ListSubheader>
						}
					>
						{section.items.map((item) => {
							const Icon = item.icon;
							const active = isActive(item.href, item.exact);
							return (
								<ListItemButton
									key={item.href}
									component={Link}
									href={item.href}
									selected={active}
									sx={{
										mx: 1.25,
										borderRadius: 1.5,
										mb: 0.5,
										"&.Mui-selected": {
											bgcolor: "primary.main",
											color: "primary.contrastText",
											"& .MuiListItemIcon-root": {
												color: "primary.contrastText",
											},
										},
									}}
								>
									<ListItemIcon
										sx={{ color: active ? "inherit" : "text.secondary" }}
									>
										<Icon size={18} strokeWidth={2} />
									</ListItemIcon>
									<ListItemText
										primary={item.label}
										primaryTypographyProps={{
											variant: "body2",
											fontWeight: active ? 600 : 500,
										}}
									/>
								</ListItemButton>
							);
						})}
					</List>
				))}
			</Box>
			<Divider />
			<Box sx={{ p: 2, textAlign: "center" }}>
				<Tooltip title="管理コンソールはローカル開発モードでのみアクセス可能です">
					<Typography variant="caption" color="text.secondary">
						開発環境専用ツール
					</Typography>
				</Tooltip>
			</Box>
		</Box>
	);
}

export function AdminShell({ children }: AdminShellProps) {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = useState(false);
	const isDesktop = useMediaQuery("(min-width:900px)");

	const handleDrawerToggle = () => {
		setMobileOpen((prev) => !prev);
	};

	const drawer = useMemo(
		() => <DrawerContent pathname={pathname} />,
		[pathname],
	);

	return (
		<MUIThemeProvider>
			<Box
				sx={{
					display: "flex",
					minHeight: "100vh",
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
						width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
						ml: { md: `${DRAWER_WIDTH}px` },
					}}
				>
					<Toolbar sx={{ minHeight: 64, display: "flex", gap: 2 }}>
						<IconButton
							color="inherit"
							edge="start"
							onClick={handleDrawerToggle}
							sx={{ mr: 1.5, display: { md: "none" } }}
						>
							<Menu size={20} />
						</IconButton>
						<Typography variant="subtitle1" fontWeight={600} noWrap>
							Content Management
						</Typography>
						<Box sx={{ flex: 1 }} />
						<Typography
							variant="caption"
							color="text.secondary"
							sx={{ display: { xs: "none", sm: "block" } }}
						>
							UXを最適化した新管理体験
						</Typography>
					</Toolbar>
				</AppBar>

				<Box
					component="nav"
					sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
					aria-label="admin navigation"
				>
					<Drawer
						variant="temporary"
						open={!isDesktop && mobileOpen}
						onClose={handleDrawerToggle}
						ModalProps={{ keepMounted: true }}
						sx={{
							display: { xs: "block", md: "none" },
							"& .MuiDrawer-paper": {
								boxSizing: "border-box",
								width: DRAWER_WIDTH,
							},
						}}
					>
						{drawer}
					</Drawer>
					<Drawer
						variant="permanent"
						open={isDesktop}
						sx={{
							display: { xs: "none", md: "block" },
							"& .MuiDrawer-paper": {
								boxSizing: "border-box",
								width: DRAWER_WIDTH,
								borderRight: 1,
								borderColor: "divider",
							},
						}}
					>
						{drawer}
					</Drawer>
				</Box>

				<Box
					component="main"
					sx={{
						flexGrow: 1,
						width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
						pt: { xs: 8, md: 8 },
						pb: { xs: 4, md: 6 },
						px: { xs: 2, sm: 3, md: 4 },
					}}
				>
					<Toolbar
						sx={{ display: { xs: "block", md: "none" }, minHeight: 16 }}
					/>
					{children}
				</Box>
			</Box>
		</MUIThemeProvider>
	);
}
