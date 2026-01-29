"use client";

import type { ArticleData } from "../types";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
	articles: ArticleData[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
	if (articles.length === 0) {
		return (
			<div className="p-8 text-center text-[#f2f2f270]">
				該当する記事が見つかりませんでした
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
			{articles.map((article) => (
				<ArticleCard
					key={article.page.slug}
					title={article.title}
					description={article.description}
					tags={article.tags}
					thumbnail={article.thumbnail}
					date={article.date}
					href={article.href}
					isExternal={article.isExternal}
					isNew={article.isNew}
				/>
			))}
		</div>
	);
}
