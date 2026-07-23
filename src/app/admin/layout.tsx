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
		<div className="fixed inset-0 w-screen h-dvh z-[9999] font-sans flex flex-col overflow-hidden">
			<header
				style={{
					padding: "0 16px",
					display: "flex",
					alignItems: "center",
					gap: 16,
					height: 48,
					flexShrink: 0,
				}}
			>
				<span style={{ fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap" }}>
					<a href="/admin">Admin</a>
				</span>
				<nav style={{ display: "flex", gap: 4, overflowX: "auto", flex: 1 }}>
					{NAV_TABS.map((tab) => (
						<a
							key={tab.href}
							href={tab.href}
							style={{
								fontSize: "0.8rem",
								padding: "4px 10px",
								textDecoration: "none",
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
