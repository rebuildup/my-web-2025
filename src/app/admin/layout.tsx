import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

const NAV_TABS = [
	{ label: "コンテンツ一覧", href: "/admin/content" },
	{ label: "ブロックエディタ", href: "/admin/content/page-editor" },
	{ label: "Markdownページ", href: "/admin/content/markdown" },
	{ label: "メディアライブラリ", href: "/admin/content/media" },
	{ label: "データベース", href: "/admin/content/databases" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: 9999,
				backgroundColor: "#fff",
				color: "#000",
				colorScheme: "light",
				fontFamily: "sans-serif",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}
		>
			<header
				style={{
					borderBottom: "1px solid #ddd",
					padding: "0 16px",
					display: "flex",
					alignItems: "center",
					gap: 16,
					height: 48,
					flexShrink: 0,
				}}
			>
				<span style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap" }}>
					<a href="/admin" style={{ color: "#000", textDecoration: "none" }}>
						Admin
					</a>
				</span>
				<nav style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
					{NAV_TABS.map((tab) => (
						<a
							key={tab.href}
							href={tab.href}
							style={{
								fontSize: "0.8rem",
								padding: "4px 10px",
								borderRadius: 4,
								textDecoration: "none",
								color: "#333",
								background: "#f5f5f5",
								whiteSpace: "nowrap",
							}}
						>
							{tab.label}
						</a>
					))}
				</nav>
			</header>
			<main
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "24px",
				}}
			>
				{children}
			</main>
		</div>
	);
}
