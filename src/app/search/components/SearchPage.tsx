"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
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

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, type?: ContentType, category?: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const endpoint = searchMode === "simple" ? "simple" : "detailed";
        const params = new URLSearchParams({
          q: searchQuery,
          mode: endpoint,
        });

        if (type) params.append("type", type);
        if (category && category !== "すべて")
          params.append("category", category);

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchMode]
  );

  // Get search suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setQuery(value);

    // Update URL
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    router.replace(`/search?${params.toString()}`, { scroll: false });

    // Get suggestions
    getSuggestions(value);
    setShowSuggestions(true);

    // Debounced search
    const timeoutId = setTimeout(() => {
      performSearch(value, selectedType || undefined, selectedCategory);
    }, 300);

    return () => clearTimeout(timeoutId);
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
    performSearch(suggestion, selectedType || undefined, selectedCategory);
  };

  // Initial search on mount
  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [searchParams, performSearch]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container-system py-ratio-lg">
        {/* Page Header */}
        <header className="mb-ratio-lg">
          <h1 className="neue-haas-grotesk-display text-ratio-xl text-primary mb-ratio-sm">
            Search
          </h1>
          <p className="noto-sans-jp-light text-ratio-base opacity-80">
            サイト内のコンテンツを検索できます
          </p>
        </header>

        {/* Search Form */}
        <div className="mb-ratio-lg">
          <div className="relative mb-ratio-sm">
            <div className="relative">
              <Search className="absolute left-ratio-xs top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground opacity-60" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="検索キーワードを入力..."
                className="w-full pl-12 pr-4 py-ratio-xs bg-base border border-foreground text-foreground placeholder-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="検索キーワード"
              />
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-base border border-foreground border-t-0 z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-ratio-xs text-left hover:bg-primary hover:text-background transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Mode Toggle */}
          <div className="flex items-center gap-ratio-sm mb-ratio-sm">
            <span className="noto-sans-jp-regular text-ratio-sm">
              検索モード:
            </span>
            <button
              onClick={() => setSearchMode("simple")}
              className={`px-ratio-xs py-1 text-ratio-sm border transition-colors ${
                searchMode === "simple"
                  ? "bg-primary text-background border-primary"
                  : "bg-base text-foreground border-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              シンプル
            </button>
            <button
              onClick={() => setSearchMode("detailed")}
              className={`px-ratio-xs py-1 text-ratio-sm border transition-colors ${
                searchMode === "detailed"
                  ? "bg-primary text-background border-primary"
                  : "bg-base text-foreground border-foreground hover:bg-foreground hover:text-background"
              }`}
            >
              詳細
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-ratio-xs py-1 border border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="noto-sans-jp-regular text-ratio-sm">
              フィルター
            </span>
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="mt-ratio-sm p-ratio-sm border border-foreground bg-base">
              <div className="grid grid-1 sm:grid-2 gap-ratio-sm">
                {/* Content Type Filter */}
                <div>
                  <label className="block noto-sans-jp-regular text-ratio-sm mb-2">
                    コンテンツタイプ:
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) =>
                      handleTypeChange(e.target.value as ContentType)
                    }
                    className="w-full px-ratio-xs py-1 bg-background border border-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">すべて</option>
                    {Object.entries(CONTENT_TYPE_LABELS).map(
                      ([type, label]) => (
                        <option key={type} value={type}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block noto-sans-jp-regular text-ratio-sm mb-2">
                    カテゴリー:
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full px-ratio-xs py-1 bg-background border border-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                  onClick={() => {
                    setSelectedType("");
                    setSelectedCategory("");
                    performSearch(query);
                  }}
                  className="mt-ratio-sm flex items-center gap-2 px-ratio-xs py-1 text-ratio-sm text-foreground hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4" />
                  フィルターをクリア
                </button>
              )}
            </div>
          )}
        </div>

        {/* Search Results */}
        <div>
          {loading && (
            <div className="text-center py-ratio-lg">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-ratio-sm noto-sans-jp-light text-ratio-sm">
                検索中...
              </p>
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-ratio-lg">
              <p className="noto-sans-jp-light text-ratio-base opacity-80">
                「{query}」に一致する結果が見つかりませんでした
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <p className="noto-sans-jp-light text-ratio-sm opacity-80 mb-ratio-base">
                {results.length}件の結果が見つかりました
              </p>

              <div className="space-y-ratio-base">
                {results.map((result) => (
                  <article
                    key={result.id}
                    className="border border-foreground p-ratio-sm hover:bg-base transition-colors"
                  >
                    <div className="flex items-start justify-between mb-ratio-xs">
                      <Link
                        href={result.url}
                        className="neue-haas-grotesk-display text-ratio-base text-primary hover:underline"
                      >
                        {result.title}
                      </Link>
                      <span className="noto-sans-jp-light text-ratio-xs opacity-60 ml-ratio-sm">
                        {CONTENT_TYPE_LABELS[result.type]}
                      </span>
                    </div>

                    <p className="noto-sans-jp-light text-ratio-sm opacity-80 mb-ratio-xs">
                      {result.description}
                    </p>

                    {result.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.highlights
                          .slice(0, 3)
                          .map((highlight, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary text-background text-ratio-xs"
                            >
                              {highlight}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-ratio-xs">
                      <Link
                        href={result.url}
                        className="noto-sans-jp-light text-ratio-xs text-primary hover:underline"
                      >
                        {result.url}
                      </Link>
                      <span className="noto-sans-jp-light text-ratio-xs opacity-60">
                        関連度: {Math.round(result.score * 100)}%
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {!query && (
            <div className="text-center py-ratio-lg">
              <p className="noto-sans-jp-light text-ratio-base opacity-80">
                検索キーワードを入力してください
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
          }),
        }}
      />
    </div>
  );
}
