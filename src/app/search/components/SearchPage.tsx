"use client";

import { Clock, Filter, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
	addToSearchHistory,
	clearSearchHistory,
	getSearchHistory,
	removeFromSearchHistory,
	type SearchHistoryItem,
} from "@/lib/search/history";
import type { ContentType, SearchResult } from "@/types";

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
	portfolio: "ポートフォリオ",
	blog: "ブログ",
	plugin: "プラグイン",
	download: "ダウンロード",
	tool: "ツール",
	profile: "プロフィール",
	page: "ページ",
	asset: "アセット",
	other: "その他",
};

const CATEGORIES = [
	"すべて",
	"開発",
	"映像",
	"デザイン",
	"ツール",
	"プロフィール",
	"その他",
];

export default function SearchPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [query, setQuery] = useState(searchParams.get("q") || "");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchMode, setSearchMode] = useState<"simple" | "detailed">("simple");
	const [selectedType, setSelectedType] = useState<ContentType | "">("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
	const [showHistory, setShowHistory] = useState(false);

	// Style variables matching root page
	const CardStyle =
		"bg-base border border-main block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base";
	const Card_title = "neue-haas-grotesk-display text-xl text-main leading-snug";
	const Card_description = "noto-sans-jp-light text-xs pb-2";
	const Global_title = "noto-sans-jp-regular text-base leading-snug";

	// Track search analytics
	const trackSearch = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim()) return;

		try {
			await fetch("/api/search/analytics", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ query: searchQuery }),
			});
		} catch (error) {
			console.error("Failed to track search:", error);
		}
	}, []);

	// Perform search
	const performSearch = useCallback(
		async (searchQuery: string, type?: ContentType, category?: string) => {
			if (!searchQuery.trim()) {
				setResults([]);
				return;
			}

			setLoading(true);
			const endpoint = searchMode === "simple" ? "simple" : "detailed";
			const params = new URLSearchParams({
				q: searchQuery,
				mode: endpoint,
			});

			if (type) params.append("type", type);
			if (category && category !== "すべて") {
				params.append("category", category);
			}

			let response: Response;
			try {
				response = await fetch(`/api/content/search?${params}`);
			} catch (error) {
				console.error("Search failed:", error);
				setResults([]);
				setLoading(false);
				return;
			}

			if (response.ok) {
				let data: { results?: SearchResult[] };
				try {
					data = await response.json();
				} catch (error) {
					console.error("Failed to parse response:", error);
					setResults([]);
					setLoading(false);
					return;
				}

				const results = data.results || [];
				const resultCount = data.results?.length || 0;

				setResults(results);

				// Track successful search
				trackSearch(searchQuery);

				// Add to search history
				addToSearchHistory(searchQuery, resultCount);
				setSearchHistory(getSearchHistory());
			} else {
				setResults([]);
			}
			setLoading(false);
		},
		[searchMode, trackSearch],
	);

	// Get search suggestions
	const getSuggestions = useCallback(async (searchQuery: string) => {
		if (!searchQuery.trim() || searchQuery.length < 2) {
			setSuggestions([]);
			return;
		}

		let response: Response;
		try {
			response = await fetch(
				`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`,
			);
		} catch (error) {
			console.error("Failed to get suggestions:", error);
			setSuggestions([]);
			return;
		}

		if (response.ok) {
			let data: { suggestions?: string[] };
			try {
				data = await response.json();
			} catch (error) {
				console.error("Failed to parse suggestions response:", error);
				setSuggestions([]);
				return;
			}

			const suggestions = data.suggestions || [];
			setSuggestions(suggestions);
		}
	}, []);

	// Handle search input change
	const handleSearchChange = (value: string) => {
		setQuery(value);

		// Update URL
		const params = new URLSearchParams();
		if (value) params.set("q", value);
		router.replace(`/search?${params.toString()}`, { scroll: false });

		if (value.trim()) {
			// Get suggestions
			getSuggestions(value);
			setShowSuggestions(true);
			setShowHistory(false);

			// Debounced search
			const timeoutId = setTimeout(() => {
				performSearch(value, selectedType || undefined, selectedCategory);
			}, 300);

			return () => clearTimeout(timeoutId);
		} else {
			// Show history when input is empty
			setShowSuggestions(false);
			setShowHistory(true);
			setResults([]);
		}
	};

	// Handle filter changes
	const handleTypeChange = (type: ContentType | "") => {
		setSelectedType(type);
		performSearch(query, type || undefined, selectedCategory);
	};

	const handleCategoryChange = (category: string) => {
		setSelectedCategory(category);
		performSearch(query, selectedType || undefined, category);
	};

	// Handle suggestion click
	const handleSuggestionClick = (suggestion: string) => {
		setQuery(suggestion);
		setShowSuggestions(false);
		setShowHistory(false);
		performSearch(suggestion, selectedType || undefined, selectedCategory);
	};

	// Handle history item click
	const handleHistoryClick = (historyItem: SearchHistoryItem) => {
		setQuery(historyItem.query);
		setShowHistory(false);
		setShowSuggestions(false);
		performSearch(
			historyItem.query,
			selectedType || undefined,
			selectedCategory,
		);
	};

	// Handle remove history item
	const handleRemoveHistoryItem = (query: string, event: React.MouseEvent) => {
		event.stopPropagation();
		removeFromSearchHistory(query);
		setSearchHistory(getSearchHistory());
	};

	// Handle clear all history
	const handleClearHistory = () => {
		clearSearchHistory();
		setSearchHistory([]);
		setShowHistory(false);
	};

	// Load search history on mount
	useEffect(() => {
		setSearchHistory(getSearchHistory());
	}, []);

	// Initial search on mount
	useEffect(() => {
		const initialQuery = searchParams.get("q");
		if (initialQuery) {
			setQuery(initialQuery);
			performSearch(initialQuery);
		}
	}, [searchParams, performSearch]);

	return (
		<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
			<main className="flex items-center py-10">
				<div className="container-system">
					<div className="space-y-10">
						{/* Breadcrumbs */}
						<div className="mb-6">
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Search", isCurrent: true },
								]}
							/>
						</div>
						{/* Page Header */}
						<header className="space-y-12">
							<h1 className="neue-haas-grotesk-display text-6xl text-main">
								Search
							</h1>
							<p className="noto-sans-jp-light text-sm max-w leading-loose">
								サイト内のコンテンツを検索できます。
								<br />
								ポートフォリオ、ブログ、ツールなど、必要な情報を素早く見つけることができます。
							</p>
						</header>

						{/* Search Form */}
						<section className="space-y-6">
							<div className="relative">
								<div className="relative">
									<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-main opacity-60" />
									<input
										type="text"
										value={query}
										onChange={(e) => handleSearchChange(e.target.value)}
										onFocus={() => {
											if (!query.trim()) {
												setShowHistory(true);
												setShowSuggestions(false);
											} else {
												setShowSuggestions(true);
												setShowHistory(false);
											}
										}}
										onBlur={() =>
											setTimeout(() => {
												setShowSuggestions(false);
												setShowHistory(false);
											}, 200)
										}
										placeholder="検索キーワードを入力..."
										className="w-full pl-12 pr-4 py-4 bg-base border border-main text-main placeholder-main/60 focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
										aria-label="検索キーワード"
										data-testid="search-input"
									/>
								</div>

								{/* Search Suggestions */}
								{showSuggestions && suggestions.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-base border border-main border-t-0 z-10">
										{suggestions.map((suggestion, index) => (
											<button
												type="button"
												key={index}
												onClick={() => handleSuggestionClick(suggestion)}
												className="w-full px-4 py-3 text-left hover:bg-main hover:text-base transition-colors noto-sans-jp-light text-sm flex items-center gap-2"
											>
												<Search className="w-4 h-4 opacity-60" />
												{suggestion}
											</button>
										))}
									</div>
								)}

								{/* Search History */}
								{showHistory && searchHistory.length > 0 && (
									<div className="absolute top-full left-0 right-0 bg-base border border-main border-t-0 z-10">
										<div className="px-4 py-2 border-b border-main bg-main text-base">
											<div className="flex items-center justify-between">
												<span className="noto-sans-jp-light text-xs">
													最近の検索
												</span>
												<button
													type="button"
													onClick={handleClearHistory}
													className="text-xs hover:underline flex items-center gap-1"
												>
													<Trash2 className="w-3 h-3" />
													クリア
												</button>
											</div>
										</div>
										{searchHistory.slice(0, 5).map((historyItem, index) => (
											<button
												type="button"
												key={index}
												onClick={() => handleHistoryClick(historyItem)}
												className="w-full px-4 py-3 text-left hover:bg-main hover:text-base transition-colors noto-sans-jp-light text-sm flex items-center justify-between group"
											>
												<div className="flex items-center gap-2">
													<Clock className="w-4 h-4 opacity-60" />
													<span>{historyItem.query}</span>
													<span className="text-xs opacity-60">
														({historyItem.resultCount}件)
													</span>
												</div>
												<button
													type="button"
													onClick={(e) =>
														handleRemoveHistoryItem(historyItem.query, e)
													}
													className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-main hover:text-base rounded"
												>
													<X className="w-3 h-3" />
												</button>
											</button>
										))}
									</div>
								)}
							</div>

							{/* Search Mode Toggle */}
							<div className="flex items-center gap-4">
								<span className={Global_title}>検索モード:</span>
								<button
									type="button"
									onClick={() => setSearchMode("simple")}
									className={`px-4 py-2 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base ${
										searchMode === "simple"
											? "bg-main text-base border-main"
											: "bg-base text-main border-main hover:bg-main hover:text-base"
									}`}
									data-testid="search-button"
								>
									シンプル
								</button>
								<button
									type="button"
									onClick={() => setSearchMode("detailed")}
									className={`px-4 py-2 text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base ${
										searchMode === "detailed"
											? "bg-main text-base border-main"
											: "bg-base text-main border-main hover:bg-main hover:text-base"
									}`}
								>
									詳細
								</button>
							</div>

							{/* Filter Toggle */}
							<button
								type="button"
								onClick={() => setShowFilters(!showFilters)}
								className="flex items-center gap-2 px-4 py-2 border border-main hover:bg-main hover:text-base transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
							>
								<Filter className="w-4 h-4" />
								<span className={Global_title}>フィルター</span>
							</button>

							{/* Filters */}
							{showFilters && (
								<section className="p-4 border border-main bg-base space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										{/* Content Type Filter */}
										<div>
											<label
												htmlFor="search-type"
												className={`block ${Global_title} mb-2`}
											>
												コンテンツタイプ:
											</label>
											<select
												id="search-type"
												value={selectedType}
												onChange={(e) =>
													handleTypeChange(e.target.value as ContentType)
												}
												className="w-full px-4 py-2 bg-base border border-main text-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
											>
												<option value="">すべて</option>
												{Object.entries(CONTENT_TYPE_LABELS).map(
													([type, label]) => (
														<option key={type} value={type}>
															{label}
														</option>
													),
												)}
											</select>
										</div>

										{/* Category Filter */}
										<div>
											<label
												htmlFor="search-category"
												className={`block ${Global_title} mb-2`}
											>
												カテゴリー:
											</label>
											<select
												id="search-category"
												value={selectedCategory}
												onChange={(e) => handleCategoryChange(e.target.value)}
												className="w-full px-4 py-2 bg-base border border-main text-main focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
											>
												{CATEGORIES.map((category) => (
													<option
														key={category}
														value={category === "すべて" ? "" : category}
													>
														{category}
													</option>
												))}
											</select>
										</div>
									</div>

									{/* Clear Filters */}
									{(selectedType || selectedCategory) && (
										<button
											type="button"
											onClick={() => {
												setSelectedType("");
												setSelectedCategory("");
												performSearch(query);
											}}
											className="flex items-center gap-2 px-4 py-2 text-sm text-main hover:text-main transition-colors focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
										>
											<X className="w-4 h-4" />
											フィルターをクリア
										</button>
									)}
								</section>
							)}
						</section>

						{/* Search Results */}
						<section>
							{loading && (
								<div className="text-center py-16">
									<div className="inline-block w-8 h-8 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
									<p className="mt-4 noto-sans-jp-light text-sm">検索中...</p>
								</div>
							)}

							{!loading && query && results.length === 0 && (
								<div className="text-center py-16" data-testid="no-results">
									<p className="noto-sans-jp-light text-base opacity-80">
										「{query}」に一致する結果が見つかりませんでした
									</p>
								</div>
							)}

							{!loading && results.length > 0 && (
								<div className="space-y-6">
									<p className="noto-sans-jp-light text-sm opacity-80">
										{results.length}件の結果が見つかりました
									</p>

									<div className="space-y-4" data-testid="search-results">
										{results.map((result) => (
											<article
												key={result.id}
												className={CardStyle}
												data-testid="search-result"
											>
												<div className="flex items-start justify-between mb-2">
													<Link href={result.url} className={Card_title}>
														{result.title}
													</Link>
													<span className="noto-sans-jp-light text-xs opacity-60 ml-4">
														{CONTENT_TYPE_LABELS[result.type]}
													</span>
												</div>

												<p className={`${Card_description} opacity-80`}>
													{result.description}
												</p>

												{result.highlights.length > 0 && (
													<div className="flex flex-wrap gap-2 pb-2">
														{result.highlights
															.slice(0, 3)
															.map((highlight, index) => (
																<span
																	key={index}
																	className="px-2 py-1 bg-main text-base text-xs"
																>
																	{highlight}
																</span>
															))}
													</div>
												)}

												<div className="flex items-center justify-between text-xs">
													<Link
														href={result.url}
														className="noto-sans-jp-light text-main hover:underline"
													>
														{result.url}
													</Link>
													<span className="noto-sans-jp-light opacity-60">
														関連度: {Math.round(result.score * 100)}%
													</span>
												</div>
											</article>
										))}
									</div>
								</div>
							)}

							{!query && (
								<div className="text-center py-16">
									<p className="noto-sans-jp-light text-base opacity-80">
										検索キーワードを入力してください
									</p>
								</div>
							)}
						</section>

						<footer className="pt-4 border-t border-main">
							<div className="text-center">
								<p className="shippori-antique-b1-regular text-sm inline-block">
									© 2025 samuido - Creative Portfolio & Tools
								</p>
							</div>
						</footer>
					</div>
				</div>
			</main>

			{/* Structured Data */}
			<script type="application/ld+json">
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "samuido",
					description: "フロントエンドエンジニアsamuidoの個人サイト",
					url: "https://yusuke-kim.com/",
					potentialAction: {
						"@type": "SearchAction",
						target: "https://yusuke-kim.com/search?q={search_term_string}",
						"query-input": "required name=search_term_string",
					},
					author: {
						"@type": "Person",
						name: "木村友亮",
						alternateName: "samuido",
					},
				})}
			</script>
		</div>
	);
}
