"use client";

import { useEffect, useMemo, useState } from "react";
import type { MarkdownPage } from "@/cms/types/markdown";
import { adminColor } from "@/components/admin/ui/tokens";

export interface ArticleListProps {
	articles: MarkdownPage[];
	selectedId?: string;
	isLoading?: boolean;
	onSelect: (page: MarkdownPage) => void;
	onEditMeta: (page: MarkdownPage) => void;
	onCreate: () => void;
}

const headerStyle: React.CSSProperties = {
	display: "flex",
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	paddingTop: 12,
	paddingBottom: 12,
};

const headerTitleStyle: React.CSSProperties = {
	margin: 0,
	fontSize: 16,
	fontWeight: 600,
	color: adminColor.textPrimary,
};

const newPageButtonStyle: React.CSSProperties = {
	fontSize: 13,
	padding: "4px 12px",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 4,
	backgroundColor: adminColor.bgPanel,
	color: adminColor.textPrimary,
	cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
	fontSize: 14,
	padding: "8px 10px",
	border: `1px solid ${adminColor.borderInput}`,
	borderRadius: 4,
	backgroundColor: adminColor.bgPanel,
	color: adminColor.textPrimary,
	outline: "none",
};

const listStyle: React.CSSProperties = {
	listStyle: "none",
	padding: 0,
	margin: 0,
	display: "flex",
	flexDirection: "column",
	maxHeight: 320,
	overflowY: "auto",
};

const rowStyle: React.CSSProperties = {
	display: "flex",
	alignItems: "flex-start",
	gap: 8,
	padding: "10px 12px",
	cursor: "pointer",
};

const metaStyle: React.CSSProperties = {
	flex: 1,
	minWidth: 0,
};

const editButtonStyle: React.CSSProperties = {
	fontSize: 13,
	padding: "4px 8px",
	background: "transparent",
	color: adminColor.accent,
	border: "none",
	borderRadius: 4,
	cursor: "pointer",
};

function formatDateTime(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
		date.getDate(),
	)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function ArticleList({
	articles,
	selectedId,
	isLoading = false,
	onSelect,
	onEditMeta,
	onCreate,
}: ArticleListProps) {
	const [query, setQuery] = useState("");
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const filtered = useMemo(() => {
		if (!query) {
			return articles;
		}
		const term = query.toLowerCase();
		return articles.filter((article) => {
			return (
				article.slug.toLowerCase().includes(term) ||
				(article.frontmatter.title ?? "").toLowerCase().includes(term) ||
				(article.frontmatter.description ?? "").toLowerCase().includes(term)
			);
		});
	}, [articles, query]);

	return (
		<div>
			<div style={headerStyle}>
				<h3 style={headerTitleStyle}>Pages</h3>
				<button type="button" onClick={onCreate} style={newPageButtonStyle}>
					New page
				</button>
			</div>
			<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
				<label
					htmlFor="article-list-filter"
					style={{
						position: "absolute",
						width: 1,
						height: 1,
						overflow: "hidden",
						clip: "rect(0 0 0 0)",
					}}
				>
					Filter articles
				</label>
				<input
					id="article-list-filter"
					placeholder="Filter by title or slug"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					style={inputStyle}
				/>
				{isLoading ? (
					<span style={{ fontSize: 14, color: adminColor.textSecondary }}>
						Loading pages...
					</span>
				) : filtered.length === 0 ? (
					<div
						role="status"
						style={{
							padding: "8px 12px",
							borderLeft: `4px solid ${adminColor.info}`,
							backgroundColor: "rgba(30, 64, 175, 0.1)",
							color: adminColor.info,
							fontSize: 14,
							borderRadius: 4,
						}}
					>
						No pages found.
					</div>
				) : (
					<ul style={listStyle}>
						{filtered.map((page, index) => {
							const isActive = page.id === selectedId;
							return (
								<li
									key={page.id}
									style={{
										backgroundColor: isActive
											? adminColor.accentHover
											: "transparent",
										borderBottom:
											index < filtered.length - 1
												? `1px solid ${adminColor.border}`
												: "none",
										display: "flex",
										alignItems: "stretch",
									}}
								>
									<button
										type="button"
										onClick={() => onSelect(page)}
										style={{
											...rowStyle,
											flex: 1,
											minWidth: 0,
											background: "transparent",
											border: "none",
											textAlign: "left",
											font: "inherit",
											color: "inherit",
										}}
									>
										<div style={metaStyle}>
											<div
												style={{
													fontSize: 14,
													fontWeight: 600,
													lineHeight: 1.4,
													color: adminColor.textPrimary,
												}}
											>
												{page.frontmatter.title || "Untitled page"}
											</div>
											<div
												style={{
													fontSize: 12,
													color: adminColor.textSecondary,
												}}
											>
												{page.slug}
											</div>
											<div
												style={{
													fontSize: 12,
													color: adminColor.textDisabled,
												}}
												suppressHydrationWarning
											>
												{isClient ? formatDateTime(page.updatedAt) : ""}
											</div>
										</div>
									</button>
									<button
										type="button"
										onClick={(event) => {
											event.stopPropagation();
											onEditMeta(page);
										}}
										style={editButtonStyle}
									>
										Edit
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
