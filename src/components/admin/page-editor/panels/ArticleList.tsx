"use client";

import { useMemo, useState } from "react";
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

export function ArticleList({
	articles,
	selectedId,
	isLoading = false,
	onSelect,
	onEditMeta,
	onCreate,
}: ArticleListProps) {
	const [query, setQuery] = useState("");

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
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					alignItems: "center",
					paddingTop: 12,
					paddingBottom: 12,
				}}
			>
				<h3
					style={{
						margin: 0,
						fontSize: 16,
						fontWeight: 600,
						color: adminColor.textPrimary,
					}}
				>
					Pages
				</h3>
				<button
					type="button"
					onClick={onCreate}
					style={{
						fontSize: 13,
						padding: "4px 12px",
						border: `1px solid ${adminColor.borderInput}`,
						borderRadius: 4,
						backgroundColor: adminColor.bgPanel,
						color: adminColor.textPrimary,
						cursor: "pointer",
					}}
				>
					New page
				</button>
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: 12,
				}}
			>
				<input
					placeholder="Filter by title or slug"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					style={{
						fontSize: 14,
						padding: "8px 10px",
						border: `1px solid ${adminColor.borderInput}`,
						borderRadius: 4,
						backgroundColor: adminColor.bgPanel,
						color: adminColor.textPrimary,
						outline: "none",
					}}
				/>
				{isLoading ? (
					<span
						style={{
							fontSize: 14,
							color: adminColor.textSecondary,
						}}
					>
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
					<ul
						style={{
							listStyle: "none",
							padding: 0,
							margin: 0,
							display: "flex",
							flexDirection: "column",
							maxHeight: 320,
							overflowY: "auto",
						}}
					>
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
									}}
								>
									<div
										role="button"
										tabIndex={0}
										onClick={() => onSelect(page)}
										onKeyDown={(event) => {
											if (event.key === "Enter" || event.key === " ") {
												event.preventDefault();
												onSelect(page);
											}
										}}
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: 8,
											padding: "10px 12px",
											cursor: "pointer",
										}}
									>
										<div style={{ flex: 1, minWidth: 0 }}>
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
											>
												{new Date(page.updatedAt).toLocaleString()}
											</div>
										</div>
										<button
											type="button"
											onClick={(event) => {
												event.stopPropagation();
												onEditMeta(page);
											}}
											style={{
												fontSize: 13,
												padding: "4px 8px",
												background: "transparent",
												color: adminColor.accent,
												border: "none",
												borderRadius: 4,
												cursor: "pointer",
											}}
										>
											Edit
										</button>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
