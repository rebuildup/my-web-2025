"use client";

import { usePathname, useRouter } from "next/navigation";
import { type CSSProperties, useEffect } from "react";
import { adminColor } from "@/components/admin/ui/tokens";

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
	const exact = NAV_TABS.findIndex((t) => pathname === t.href);
	if (exact !== -1) return exact;
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

const rootStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	height: "100%",
	minHeight: "100%",
	backgroundColor: adminColor.bgPage,
};

const headerStyle: CSSProperties = {
	position: "fixed",
	top: 0,
	left: 0,
	right: 0,
	zIndex: 50,
	display: "flex",
	alignItems: "center",
	gap: 16,
	padding: "0 16px",
	minHeight: 64,
	backgroundColor: adminColor.bgPanel,
	borderBottom: `1px solid ${adminColor.border}`,
	flexWrap: "wrap",
};

const titleStyle: CSSProperties = {
	fontWeight: 600,
	fontSize: 14,
	paddingLeft: 8,
	color: adminColor.textPrimary,
	whiteSpace: "nowrap",
};

const tabsStyle: CSSProperties = {
	display: "flex",
	gap: 4,
	flex: 1,
	overflowX: "auto",
	minHeight: 40,
};

const tabStyle = (active: boolean): CSSProperties => ({
	padding: "8px 12px",
	fontSize: 13,
	fontWeight: 600,
	color: active ? adminColor.accent : adminColor.textSecondary,
	background: "transparent",
	border: "none",
	borderBottom: `2px solid ${active ? adminColor.accent : "transparent"}`,
	cursor: "pointer",
	whiteSpace: "nowrap",
	transition: "color 120ms ease, border-color 120ms ease",
});

const mainStyle = (fullWidth: boolean): CSSProperties => ({
	flexGrow: 1,
	width: "100%",
	paddingTop: 64,
	paddingBottom: fullWidth ? 0 : 32,
});

const containerStyle: CSSProperties = {
	margin: "0 auto",
	width: "100%",
	maxWidth: 1280,
	padding: "0 24px",
};

export function AdminShell({ children }: AdminShellProps) {
	const pathname = usePathname();
	const router = useRouter();
	const isFullWidthPage = pathname.startsWith("/admin/content/page-editor");
	const tabIndex = getTabIndex(pathname);

	useEffect(() => {
		if (pathname === "/admin") {
			router.replace("/admin/content");
		}
	}, [pathname, router]);

	return (
		<div style={rootStyle}>
			<header style={headerStyle}>
				<span style={titleStyle}>Content Management</span>
				<nav aria-label="Admin sections" role="tablist" style={tabsStyle}>
					{NAV_TABS.map((tab, i) => {
						const active = i === tabIndex;
						return (
							<button
								key={tab.href}
								type="button"
								role="tab"
								aria-selected={active}
								tabIndex={active ? 0 : -1}
								onClick={() => router.push(tab.href)}
								style={tabStyle(active)}
							>
								{tab.label}
							</button>
						);
					})}
				</nav>
			</header>

			<main style={mainStyle(isFullWidthPage)}>
				{isFullWidthPage ? (
					children
				) : (
					<div style={containerStyle}>{children}</div>
				)}
			</main>
		</div>
	);
}
