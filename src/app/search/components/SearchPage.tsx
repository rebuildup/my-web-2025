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

function SearchPageHeader() {
	return (
		<>
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
				<h1 className="neue-haas-grotesk-display text-6xl ">Search</h1>
				<p className="noto-sans-jp-light text-sm max-w leading-loose">
					サイト内のコンテンツを検索できます.
					<br />
					ポートフォリオ、ブログ、ツールなど、必要な情報を素早く見つけることができます.
				</p>
			</header>
		</>
	);
}

type SearchInputFieldProps = {
	query: string;
	suggestions: string[];
	searchHistory: SearchHistoryItem[];
	showSuggestions: boolean;
	showHistory: boolean;
	onSearchChange: (value: string) => void;
	onInputFocus: () => void;
	onInputBlur: () => void;
	onSuggestionClick: (suggestion: string) => void;
	onHistoryClick: (item: SearchHistoryItem) => void;
	onRemoveHistoryItem: (query: string, event: React.MouseEvent) => void;
	onClearHistory: () => void;
};

function SearchInputField({
	query,
	suggestions,
	searchHistory,
	showSuggestions,
	showHistory,
	onSearchChange,
	onInputFocus,
	onInputBlur,
	onSuggestionClick,
	onHistoryClick,
	onRemoveHistoryItem,
	onClearHistory,
}: SearchInputFieldProps) {
	return (
		<div className="relative">
			<div className="relative">
				<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 " />
				<input
					type="text"
					value={query}
					onChange={(e) => onSearchChange(e.target.value)}
					onFocus={onInputFocus}
					onBlur={onInputBlur}
					placeholder="検索キーワードを入力..."
					className="w-full pl-12 pr-4 py-4 placeholder-main/60"
					aria-label="検索キーワード"
					data-testid="search-input"
				/>
			</div>

			{/* Search Suggestions */}
			{showSuggestions && suggestions.length > 0 && (
				<div className="absolute top-full left-0 right-0   z-10">
					{suggestions.map((suggestion) => (
						<button
							type="button"
							key={suggestion}
							onClick={() => onSuggestionClick(suggestion)}
							className="w-full px-4 py-3 text-left noto-sans-jp-light text-sm flex items-center gap-2"
						>
							<Search className="w-4 h-4 " />
							{suggestion}
						</button>
					))}
				</div>
			)}

			{/* Search History */}
			{showHistory && searchHistory.length > 0 && (
				<div className="absolute top-full left-0 right-0   z-10">
					<div className="px-4 py-2  ">
						<div className="flex items-center justify-between">
							<span className="noto-sans-jp-light text-xs">最近の検索</span>
							<button
								type="button"
								onClick={onClearHistory}
								className="text-xs flex items-center gap-1"
							>
								<Trash2 className="w-3 h-3" />
								クリア
							</button>
						</div>
					</div>
					{searchHistory.slice(0, 5).map((historyItem) => (
						<button
							type="button"
							key={`${historyItem.query}-${historyItem.timestamp}`}
							onClick={() => onHistoryClick(historyItem)}
							className="w-full px-4 py-3 text-left noto-sans-jp-light text-sm flex items-center justify-between group"
						>
							<div className="flex items-center gap-2">
								<Clock className="w-4 h-4 " />
								<span>{historyItem.query}</span>
								<span className="text-xs ">({historyItem.resultCount}件)</span>
							</div>
							<button
								type="button"
								onClick={(e) => onRemoveHistoryItem(historyItem.query, e)}
								className="p-1"
								aria-label={`履歴から「${historyItem.query}」を削除`}
							>
								<X className="w-3 h-3" />
							</button>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

function SearchModeToggle({
	searchMode,
	globalTitle,
	onModeChange,
}: {
	searchMode: "simple" | "detailed";
	globalTitle: string;
	onModeChange: (mode: "simple" | "detailed") => void;
}) {
	return (
		<div className="flex items-center gap-4">
			<span className={globalTitle}>検索モード:</span>
			<button
				type="button"
				onClick={() => onModeChange("simple")}
				className={`px-4 py-2 text-sm ${searchMode === "simple" ? " " : " "}`}
				data-testid="search-button"
			>
				シンプル
			</button>
			<button
				type="button"
				onClick={() => onModeChange("detailed")}
				className={`px-4 py-2 text-sm ${searchMode === "detailed" ? " " : " "}`}
			>
				詳細
			</button>
		</div>
	);
}

function SearchFilterToggle({
	globalTitle,
	onToggle,
}: {
	globalTitle: string;
	onToggle: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="flex items-center gap-2 px-4 py-2"
		>
			<Filter className="w-4 h-4" />
			<span className={globalTitle}>フィルター</span>
		</button>
	);
}

function SearchFiltersPanel({
	selectedType,
	selectedCategory,
	globalTitle,
	onTypeChange,
	onCategoryChange,
	onClearFilters,
}: {
	selectedType: ContentType | "";
	selectedCategory: string;
	globalTitle: string;
	onTypeChange: (type: ContentType | "") => void;
	onCategoryChange: (category: string) => void;
	onClearFilters: () => void;
}) {
	return (
		<section className="p-4  space-y-4">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				{/* Content Type Filter */}
				<div>
					<label htmlFor="search-type" className={`block ${globalTitle} mb-2`}>
						コンテンツタイプ:
					</label>
					<select
						id="search-type"
						value={selectedType}
						onChange={(e) => onTypeChange(e.target.value as ContentType)}
						className="w-full px-4 py-2"
					>
						<option value="">すべて</option>
						{Object.entries(CONTENT_TYPE_LABELS).map(([type, label]) => (
							<option key={type} value={type}>
								{label}
							</option>
						))}
					</select>
				</div>

				{/* Category Filter */}
				<div>
					<label
						htmlFor="search-category"
						className={`block ${globalTitle} mb-2`}
					>
						カテゴリー:
					</label>
					<select
						id="search-category"
						value={selectedCategory}
						onChange={(e) => onCategoryChange(e.target.value)}
						className="w-full px-4 py-2"
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
					onClick={onClearFilters}
					className="flex items-center gap-2 px-4 py-2 text-sm"
				>
					<X className="w-4 h-4" />
					フィルターをクリア
				</button>
			)}
		</section>
	);
}

type SearchResultsSectionProps = {
	loading: boolean;
	query: string;
	results: SearchResult[];
	cardStyle: string;
	cardTitle: string;
	cardDescription: string;
};

function SearchResultsSection({
	loading,
	query,
	results,
	cardStyle,
	cardTitle,
	cardDescription,
}: SearchResultsSectionProps) {
	return (
		<section>
			{loading && (
				<div className="text-center py-16">
					<div className="inline-block w-8 h-8  border-t-transparent rounded-full animate-spin"></div>
					<p className="mt-4 noto-sans-jp-light text-sm">検索中...</p>
				</div>
			)}

			{!loading && query && results.length === 0 && (
				<div className="text-center py-16" data-testid="no-results">
					<p className="noto-sans-jp-light ">
						「{query}」に一致する結果が見つかりませんでした
					</p>
				</div>
			)}

			{!loading && results.length > 0 && (
				<div className="space-y-6">
					<p className="noto-sans-jp-light text-sm ">
						{results.length}件の結果が見つかりました
					</p>

					<div className="space-y-4" data-testid="search-results">
						{results.map((result) => (
							<article
								key={result.id}
								className={cardStyle}
								data-testid="search-result"
							>
								<div className="flex items-start justify-between mb-2">
									<Link href={result.url} className={cardTitle}>
										{result.title}
									</Link>
									<span className="noto-sans-jp-light text-xs  ml-4">
										{CONTENT_TYPE_LABELS[result.type]}
									</span>
								</div>

								<p className={`${cardDescription} `}>{result.description}</p>

								{result.highlights.length > 0 && (
									<div className="flex flex-wrap gap-2 pb-2">
										{result.highlights.slice(0, 3).map((highlight) => (
											<span key={highlight} className="px-2 py-1 text-xs">
												{highlight}
											</span>
										))}
									</div>
								)}

								<div className="flex items-center justify-between text-xs">
									<Link
										href={result.url}
										className="noto-sans-jp-light hover:underline"
									>
										{result.url}
									</Link>
									<span className="noto-sans-jp-light ">
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
					<p className="noto-sans-jp-light ">
						検索キーワードを入力してください
					</p>
				</div>
			)}
		</section>
	);
}

function SearchPageFooter() {
	return (
		<footer className="pt-4  ">
			<div className="text-center">
				<p className="shippori-antique-b1-regular text-sm inline-block">
					© 2025 samuido - Creative Portfolio & Tools
				</p>
			</div>
		</footer>
	);
}

function SearchStructuredData() {
	return (
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
	);
}

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
		"  block p-4 space-y-4   focus: focus:ring-offset-2 focus:ring-offset-base";
	const Card_title = "neue-haas-grotesk-display text-xl leading-snug";
	const Card_description = "noto-sans-jp-light text-xs pb-2";
	const Global_title = "noto-sans-jp-regular leading-snug";
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
	// Handle input focus
	const handleInputFocus = () => {
		if (!query.trim()) {
			setShowHistory(true);
			setShowSuggestions(false);
		} else {
			setShowSuggestions(true);
			setShowHistory(false);
		}
	};
	// Handle input blur
	const handleInputBlur = () => {
		setTimeout(() => {
			setShowSuggestions(false);
			setShowHistory(false);
		}, 200);
	};
	// Handle clear filters
	const handleClearFilters = () => {
		setSelectedType("");
		setSelectedCategory("");
		performSearch(query);
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
		<div className="min-h-dvh scrollbar-auto-stable">
			<main className="flex items-center py-10">
				<div className="container-system">
					<div className="space-y-10">
						<SearchPageHeader />

						{/* Search Form */}
						<section className="space-y-6">
							<SearchInputField
								query={query}
								suggestions={suggestions}
								searchHistory={searchHistory}
								showSuggestions={showSuggestions}
								showHistory={showHistory}
								onSearchChange={handleSearchChange}
								onInputFocus={handleInputFocus}
								onInputBlur={handleInputBlur}
								onSuggestionClick={handleSuggestionClick}
								onHistoryClick={handleHistoryClick}
								onRemoveHistoryItem={handleRemoveHistoryItem}
								onClearHistory={handleClearHistory}
							/>
							<SearchModeToggle
								searchMode={searchMode}
								globalTitle={Global_title}
								onModeChange={setSearchMode}
							/>
							<SearchFilterToggle
								globalTitle={Global_title}
								onToggle={() => setShowFilters(!showFilters)}
							/>
							{/* Filters */}
							{showFilters && (
								<SearchFiltersPanel
									selectedType={selectedType}
									selectedCategory={selectedCategory}
									globalTitle={Global_title}
									onTypeChange={handleTypeChange}
									onCategoryChange={handleCategoryChange}
									onClearFilters={handleClearFilters}
								/>
							)}
						</section>

						{/* Search Results */}
						<SearchResultsSection
							loading={loading}
							query={query}
							results={results}
							cardStyle={CardStyle}
							cardTitle={Card_title}
							cardDescription={Card_description}
						/>

						<SearchPageFooter />
					</div>
				</div>
			</main>

			<SearchStructuredData />
		</div>
	);
}
