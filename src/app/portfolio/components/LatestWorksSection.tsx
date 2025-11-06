"use client";

/**
 * Latest works highlight section (client component)
 */

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PortfolioCard } from "@/app/portfolio/gallery/all/components/PortfolioCard";
import type { PortfolioContentItem } from "@/types/portfolio";

export function LatestWorksSection({
	items,
}: {
	items: PortfolioContentItem[];
}) {
	const latestItems = [...items]
		.sort(
			(a, b) =>
				new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
				new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime(),
		)
		.slice(0, 6);

	if (latestItems.length === 0) {
		return null;
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="neue-haas-grotesk-display text-3xl text-main">
					Latest Works
				</h2>
				<Link
					href="/portfolio/gallery/all"
					className="noto-sans-jp-light text-sm text-main/70 hover:text-accent transition-colors flex items-center gap-2"
				>
					すべて見る
					<ArrowRight className="w-4 h-4" />
				</Link>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{latestItems.map((item) => (
					<Link
						key={item.id}
						href={`/portfolio/${item.id}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<PortfolioCard
							item={item}
							showMarkdownIndicator={true}
							variant="glow"
						/>
					</Link>
				))}
			</div>
		</section>
	);
}
