/**
 * All Gallery Client Component
 * Client-side component for the all gallery page
 */

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import type { SearchFilter } from "@/lib/portfolio/search-index";
import type { EnhancedContentItem } from "@/types";
import type { ContentItem } from "@/types/content";
import { PortfolioCard } from "./PortfolioCard";

export interface FilterOptions {
	category?: string;
	technology?: string;
	year?: string;
	technologies?: string[];
	tags?: string[];
	search?: string;
}

export interface SortOptions {
	sortBy: "createdAt" | "updatedAt" | "title" | "priority" | "effectiveDate";
	sortOrder: "asc" | "desc";
}

interface AllGalleryClientProps {
	initialItems: ContentItem[];
	searchFilters?: SearchFilter[];
}

export function AllGalleryClient({ initialItems }: AllGalleryClientProps) {
	const [items] = useState(initialItems);

	const filteredAndSortedItems = useMemo(() => {
		// publishedAt を最優先に降順ソート（無ければ updatedAt → createdAt）
		const sorted = [...items].sort((a: any, b: any) => {
			const aTime = new Date(
				a.publishedAt || a.updatedAt || a.createdAt,
			).getTime();
			const bTime = new Date(
				b.publishedAt || b.updatedAt || b.createdAt,
			).getTime();
			return bTime - aTime;
		});
		if (process.env.NODE_ENV !== "production") {
			console.log(
				"[AllGalleryClient] top5 by publishedAt:",
				sorted.slice(0, 5).map((i: any) => ({
					id: i.id,
					publishedAt: i.publishedAt,
					updatedAt: i.updatedAt,
					createdAt: i.createdAt,
				})),
			);
		}
		return sorted;
	}, [items]);

	return (
		<div data-testid="all-gallery-client">
			{/* Header */}
			<div>
				<header className="space-y-4">
					<h1 className="neue-haas-grotesk-display text-6xl text-main">
						All Projects
					</h1>
					<p className="noto-sans-jp-light text-sm max-w leading-loose">
						全ての制作物をまとめたギャラリーです
					</p>
				</header>
			</div>

			{/* Items Grid */}
			<div className="mt-2 md:mt-4">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredAndSortedItems.map((item) => (
						<Link
							key={item.id}
							href={`/portfolio/${item.id}`}
							target="_blank"
							rel="noopener noreferrer"
							data-testid="portfolio-item"
							data-category={item.category}
							className=""
						>
							<PortfolioCard
								item={item as PortfolioContentItem | EnhancedContentItem}
								showMarkdownIndicator={true}
								variant="glow"
							/>
						</Link>
					))}
				</div>

				{/* Empty State */}
				{filteredAndSortedItems.length === 0 && (
					<div className="text-center py-12">
						<p className="noto-sans-jp-light text-sm text-main">
							No items match the current filters.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
