'use client';

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, X, ExternalLink } from "lucide-react";
import { searchContent, advancedSearch } from "@/lib/search";
import { SearchResult, ContentType } from "@/types/content";

const contentTypes: { value: ContentType | ''; label: string }[] = [
  { value: '', label: '全て' },
  { value: 'portfolio', label: 'ポートフォリオ' },
  { value: 'tool', label: 'ツール' },
  { value: 'blog', label: 'ブログ' },
  { value: 'plugin', label: 'プラグイン' },
  { value: 'profile', label: 'プロフィール' },
];

const categories = [
  { value: '', label: '全カテゴリ' },
  { value: 'develop', label: '開発' },
  { value: 'video', label: '映像' },
  { value: 'design', label: 'デザイン' },
  { value: 'productivity', label: '生産性' },
  { value: 'utility', label: 'ユーティリティ' },
  { value: 'game', label: 'ゲーム' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedType, setSelectedType] = useState<ContentType | ''>(
    (searchParams.get('type') as ContentType) || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem('search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, []);

  // Perform search when query or filters change
  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await searchContent(query, {
        type: selectedType || undefined,
        category: selectedCategory || undefined,
        limit: 20,
        includeContent: true,
      });

      setResults(searchResults);

      // Update search history
      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      
      // Track search analytics (would integrate with actual analytics)
      console.log('Search performed:', { query, type: selectedType, category: selectedCategory });
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, selectedType, selectedCategory, searchHistory]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Initialize search from URL parameters
  useEffect(() => {
    if (searchParams.get('q')) {
      performSearch();
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const clearSearch = () => {
    setQuery('');
    setSelectedType('');
    setSelectedCategory('');
    setResults([]);
  };

  const selectHistoryItem = (historyQuery: string) => {
    setQuery(historyQuery);
  };

  const getTypeColor = (type: ContentType) => {
    const colors = {
      portfolio: 'text-blue-500',
      tool: 'text-green-500',
      blog: 'text-purple-500',
      plugin: 'text-yellow-500',
      profile: 'text-pink-500',
      page: 'text-gray-500',
      asset: 'text-orange-500',
      download: 'text-red-500',
    };
    return colors[type] || 'text-gray-500';
  };

  const getTypeLabel = (type: ContentType) => {
    const labels = {
      portfolio: 'ポートフォリオ',
      tool: 'ツール',
      blog: 'ブログ',
      plugin: 'プラグイン',
      profile: 'プロフィール',
      page: 'ページ',
      asset: 'アセット',
      download: 'ダウンロード',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray">
      {/* Navigation */}
      <nav className="border-b border-foreground/20 p-4">
        <div className="max-w-7xl mx-auto">
          <Link 
            href="/" 
            className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
          >
            ← Home
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="text-center py-16 px-4">
        <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-6">
          Search
        </h1>
        <div className="max-w-4xl mx-auto">
          <p className="noto-sans-jp text-xl md:text-2xl text-foreground/80 leading-relaxed mb-8">
            サイト内のコンテンツを検索<br />
            キーワード、タグ、カテゴリで絞り込み可能
          </p>
        </div>
        <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Search Form */}
        <section className="mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Search Input */}
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="キーワードを入力して検索..."
                className="w-full pl-12 pr-12 py-4 text-lg border-2 border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-foreground/70">タイプ:</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as ContentType | '')}
                  className="px-3 py-2 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none text-sm"
                >
                  {contentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-foreground/70">カテゴリ:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-foreground/20 bg-gray text-foreground focus:border-primary focus:outline-none text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-1 px-3 py-2 border border-foreground/20 text-foreground/70 hover:border-primary hover:text-primary transition-colors text-sm"
              >
                <Filter size={16} />
                <span>詳細検索</span>
              </button>
            </div>

            {/* Advanced Search Options */}
            {showAdvanced && (
              <div className="p-4 border border-foreground/20 bg-gray/50">
                <h3 className="text-lg font-medium text-foreground mb-3">詳細検索オプション</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-foreground/70">コンテンツ内容も検索対象に含める</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-foreground/70">完全一致のみ</span>
                  </label>
                </div>
              </div>
            )}
          </form>
        </section>

        {/* Search History */}
        {searchHistory.length > 0 && !query && (
          <section className="mb-8">
            <h2 className="text-lg font-medium text-foreground mb-3">検索履歴</h2>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((historyQuery, index) => (
                <button
                  key={index}
                  onClick={() => selectHistoryItem(historyQuery)}
                  className="px-3 py-1 bg-foreground/10 text-foreground/70 hover:bg-foreground/20 transition-colors text-sm rounded"
                >
                  {historyQuery}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search Results */}
        <section>
          {query && (
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">
                "{query}" の検索結果
              </h2>
              <div className="text-sm text-foreground/60">
                {isLoading ? '検索中...' : `${results.length} 件`}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="loading mx-auto"></div>
              <p className="mt-4 text-foreground/60">検索中...</p>
            </div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60 mb-4">検索結果が見つかりませんでした</p>
              <p className="text-sm text-foreground/50">
                • キーワードを変更して再度検索してください<br />
                • より一般的な用語を使用してください<br />
                • フィルターを解除してください
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-6">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border border-foreground/20 bg-gray/50 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                      <span className="text-sm text-foreground/50">
                        スコア: {(1 - result.score).toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href={result.url}
                      className="flex items-center space-x-1 text-primary hover:underline text-sm"
                    >
                      <span>開く</span>
                      <ExternalLink size={14} />
                    </Link>
                  </div>

                  <h3 className="text-xl font-medium text-foreground mb-2">
                    <Link href={result.url} className="hover:text-primary transition-colors">
                      {result.title}
                    </Link>
                  </h3>

                  <p className="text-foreground/70 mb-3 line-clamp-3">
                    {result.description}
                  </p>

                  {result.highlights.length > 0 && (
                    <div className="text-sm text-foreground/60">
                      <strong>一致箇所:</strong> {result.highlights.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-foreground/20 py-8 text-center">
        <p className="noto-sans-jp text-foreground/60 text-sm">
          © 2025 samuido (木村友亮). All rights reserved.
        </p>
        <div className="mt-4 flex justify-center space-x-6">
          <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
            Contact
          </Link>
          <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}