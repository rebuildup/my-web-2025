"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface RelatedArticle {
	title: string;
	href: string;
	thumbnail: string | null;
	tags: string[];
}

interface RelatedArticlesProps {
	articleSlug: string;
	tags: string[];
}

export function RelatedArticles({ articleSlug, tags }: RelatedArticlesProps) {
	const [articles, setArticles] = useState<RelatedArticle[]>([]);
	const [loading, setLoading] = useState(true);

	// Memoize topTags to prevent infinite re-renders
	const topTags = useMemo(() => tags.slice(0, 2), [tags]);
	// Memoize tags string for comparison
	const tagsString = useMemo(() => tags.join(","), [tags]);

	useEffect(() => {
		if (topTags.length === 0) {
			setLoading(false);
			return;
		}

		const fetchRelatedArticles = async () => {
			try {
				const tagsParam = topTags.join(",");
				const res = await fetch(
					`/api/workshop/related?slug=${encodeURIComponent(articleSlug)}&tags=${encodeURIComponent(tagsParam)}&limit=6`,
					{ cache: "no-store" },
				);
				if (res.ok) {
					const data = await res.json();
					setArticles(data.articles || []);
				}
			} catch (error) {
				console.error("Failed to fetch related articles:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchRelatedArticles();
	}, [articleSlug, tagsString]);

	if (loading || articles.length === 0) {
		return null;
	}

	return (
		<section className="mt-16 pt-8 border-t border-[#333333]">
			<h2 className="text-xl font-bold text-white mb-6">
				関連記事
				{topTags.length > 0 && (
					<span className="ml-2 text-sm font-normal text-[#888888]">
						{topTags.map((tag) => `#${tag}`).join(" ")}
					</span>
				)}
			</h2>

			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
				{articles.map((article) => (
					<Link key={article.href} href={article.href} className="group block">
						<div className="space-y-3">
							{/* Thumbnail */}
							<div className="relative aspect-video overflow-hidden bg-[#1a1a1f] rounded">
								{article.thumbnail ? (
									<Image
										src={article.thumbnail}
										alt={article.title}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
										sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-[#2a2a2f]">
										<svg
											className="w-16 h-16 text-[#444444]"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={1}
												d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
								)}
								<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
							</div>

							{/* Title */}
							<h3 className="text-base font-semibold text-white line-clamp-2 leading-relaxed">
								{article.title}
							</h3>

							{/* Tags */}
							{article.tags.length > 0 && (
								<div className="flex gap-1 flex-wrap">
									{article.tags.slice(0, 2).map((tag) => (
										<span
											key={tag}
											className="px-2 py-0.5 text-xs font-medium text-[#f2f2f2] bg-[#1a1a1f] rounded"
										>
											#{tag}
										</span>
									))}
								</div>
							)}
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
