"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Heading {
	id: string;
	text: string;
	level: number;
}

interface RandomArticle {
	title: string;
	href: string;
	thumbnail: string | null;
}

interface ArticleSidePanelProps {
	articleSlug?: string;
	tags?: string[];
}

export function ArticleSidePanel({
	articleSlug,
	tags = [],
}: ArticleSidePanelProps) {
	const [headings, setHeadings] = useState<Heading[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [randomArticles, setRandomArticles] = useState<RandomArticle[]>([]);
	const [headingsLoaded, setHeadingsLoaded] = useState(false);
	const observerRef = useRef<IntersectionObserver | null>(null);

	// Get top 2 tags for display
	const topTags = tags.slice(0, 2);

	// Extract headings from article content
	useEffect(() => {
		let mounted = true;
		let attempts = 0;
		const maxAttempts = 10;

		const extractHeadings = () => {
			// Try article tag first (most reliable)
			const articleElement = document.querySelector("article");
			if (!articleElement || !mounted) return null;

			// Get all h1-h6 in article
			const headingElements = articleElement.querySelectorAll(
				"h1, h2, h3, h4, h5, h6",
			);

			console.log("[ArticleSidePanel] Found headings:", headingElements.length);

			if (headingElements.length === 0) {
				return null;
			}

			const extractedHeadings: Heading[] = [];
			headingElements.forEach((heading, index) => {
				const text = heading.textContent?.trim();
				if (!text) return;

				const id = heading.id || `heading-${index}`;
				if (!heading.id) {
					heading.id = id;
				}
				const originalLevel = parseInt(heading.tagName.substring(1));
				// Map h1->0, h2->1, h3->2 for display indentation
				extractedHeadings.push({
					id,
					text,
					level: originalLevel - 1,
				});
			});

			console.log("[ArticleSidePanel] Extracted headings:", extractedHeadings);
			return extractedHeadings;
		};

		const tryExtract = () => {
			const extracted = extractHeadings();
			if (extracted && extracted.length > 0) {
				setHeadings(extracted);
				setHeadingsLoaded(true);
				return true;
			}

			attempts++;
			if (attempts >= maxAttempts) {
				console.log(
					"[ArticleSidePanel] Max attempts reached, no h2-h6 headings found",
				);
				setHeadingsLoaded(true);
				return true;
			}

			return false;
		};

		// Try immediately first
		if (tryExtract()) {
			return;
		}

		// Then try with increasing delays
		const timers: number[] = [];
		const delays = [100, 300, 500, 1000];

		delays.forEach((delay) => {
			const timer = window.setTimeout(() => {
				if (tryExtract()) {
					// Clear remaining timers
					timers.forEach((t) => clearTimeout(t));
				}
			}, delay);
			timers.push(timer);
		});

		return () => {
			mounted = false;
			timers.forEach((t) => clearTimeout(t));
		};
	}, [articleSlug]);

	// Set up intersection observer for active heading tracking
	useEffect(() => {
		if (headings.length === 0) return;

		observerRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-80px 0px -80% 0px",
				threshold: 0,
			},
		);

		headings.forEach((heading) => {
			const element = document.getElementById(heading.id);
			if (element) {
				observerRef.current?.observe(element);
			}
		});

		return () => {
			observerRef.current?.disconnect();
		};
	}, [headings]);

	// Fetch random articles for promo panel
	useEffect(() => {
		const fetchRandomArticles = async () => {
			try {
				const res = await fetch(
					`/api/workshop/random?exclude=${articleSlug || ""}`,
					{
						cache: "no-store",
					},
				);
				if (res.ok) {
					const data = await res.json();
					setRandomArticles(data.articles || []);
				}
			} catch (error) {
				console.error("Failed to fetch random articles:", error);
			}
		};

		fetchRandomArticles();
	}, [articleSlug]);

	// Always show panel when we have recommendations or content
	if (randomArticles.length === 0 && !headingsLoaded) {
		return null;
	}

	if (randomArticles.length === 0 && headings.length === 0 && headingsLoaded) {
		return null;
	}

	return (
		<aside className="w-80 hidden lg:block">
			<div className="sticky top-20 space-y-6">
				{/* Table of Contents */}
				<div className="p-4 bg-[#1a1a1f] border border-[#333333] rounded">
					<h3 className="text-sm font-semibold text-[#f2f2f2] mb-3">目次</h3>
					{!headingsLoaded ? (
						<p className="text-xs text-[#888888]">読み込み中...</p>
					) : headings.length > 0 ? (
						<nav>
							<ol className="space-y-2">
								{headings.map((heading) => (
									<li
										key={heading.id}
										style={{ paddingLeft: `${heading.level * 12}px` }}
									>
										<a
											href={`#${heading.id}`}
											className={`text-sm leading-tight transition-colors ${
												activeId === heading.id
													? "text-[#2b57ff] font-medium"
													: "text-[#888888] hover:text-[#f2f2f2]"
											}`}
											onClick={(e) => {
												e.preventDefault();
												document
													.getElementById(heading.id)
													?.scrollIntoView({ behavior: "smooth" });
											}}
										>
											{heading.text}
										</a>
									</li>
								))}
							</ol>
						</nav>
					) : (
						<p className="text-xs text-[#888888]">目次がありません</p>
					)}
				</div>

				{/* Tags */}
				{topTags.length > 0 && (
					<div className="p-4 bg-[#1a1a1f] border border-[#333333] rounded">
						<h3 className="text-sm font-semibold text-[#f2f2f2] mb-3">タグ</h3>
						<div className="flex flex-wrap gap-2">
							{topTags.map((tag) => (
								<span
									key={tag}
									className="px-2 py-1 text-xs font-medium text-[#f2f2f2] bg-[#2a2a2f] border border-[#444444] rounded"
								>
									#{tag}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Random Articles - Promo Style */}
				{randomArticles.length > 0 && (
					<div className="p-4 bg-[#1a1a1f] border border-[#333333] rounded">
						<h3 className="text-sm font-semibold text-[#f2f2f2] mb-3">
							おすすめ記事
						</h3>
						<div className="space-y-3">
							{randomArticles.map((article, index) => (
								<Link
									key={article.href}
									href={article.href}
									className="block group"
								>
									<div className="space-y-2">
										{article.thumbnail && (
											<div className="relative aspect-video overflow-hidden bg-[#2a2a2f] rounded">
												<Image
													src={article.thumbnail}
													alt={article.title}
													fill
													className="object-cover transition-transform duration-300 group-hover:scale-105"
													sizes="(max-width: 768px) 100vw, 320px"
												/>
											</div>
										)}
										<p className="text-xs text-[#f2f2f2] line-clamp-2 leading-relaxed">
											{article.title}
										</p>
									</div>
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
