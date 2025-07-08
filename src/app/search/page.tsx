'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X, ExternalLink } from 'lucide-react';
import { searchContent } from '@/lib/search';
import { SearchResult, ContentType } from '@/types/content';
import { GridLayout, GridContainer } from '@/components/GridSystem';

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

function SearchPageContent() {
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
  }, [performSearch, searchParams]);

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
    <GridLayout background={false} className="bg-gray">
      {/* Navigation */}
      <nav className="border-foreground/20 border-b p-4">
        <GridContainer>
          <Link
            href="/"
            className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
          >
            ← Home
          </Link>
        </GridContainer>
      </nav>

      {/* Hero Header */}
      <header className="px-4 py-16 text-center">
        <h1 className="neue-haas-grotesk-display text-primary mb-6 text-6xl md:text-8xl">Search</h1>
        <GridContainer>
          <p className="noto-sans-jp text-foreground/80 mb-8 text-xl leading-relaxed md:text-2xl">
            サイト内のコンテンツを検索
            <br />
            キーワード、タグ、カテゴリで絞り込み可能
          </p>
        </GridContainer>
        <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        <GridContainer>
          {/* Search Form */}
          <section className="mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Main Search Input */}
              <div className="relative">
                <Search
                  size={20}
                  className="text-foreground/50 absolute top-1/2 left-4 -translate-y-1/2 transform"
                />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="キーワードを入力して検索..."
                  className="border-foreground/20 bg-gray text-foreground focus:border-primary w-full border-2 py-4 pr-12 pl-12 text-lg focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-foreground/50 hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transform"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-foreground/70 text-sm">タイプ:</label>
                  <select
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value as ContentType | '')}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary border px-3 py-2 text-sm focus:outline-none"
                  >
                    {contentTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-foreground/70 text-sm">カテゴリ:</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="border-foreground/20 bg-gray text-foreground focus:border-primary border px-3 py-2 text-sm focus:outline-none"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="border-foreground/20 text-foreground/70 hover:border-primary hover:text-primary flex items-center space-x-1 border px-3 py-2 text-sm transition-colors"
                >
                  <Filter size={16} />
                  <span>詳細検索</span>
                </button>
              </div>

              {/* Advanced Search Options */}
              {showAdvanced && (
                <div className="border-foreground/20 bg-gray/50 border p-4">
                  <h3 className="text-foreground mb-3 text-lg font-medium">詳細検索オプション</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-foreground/70 text-sm">
                        コンテンツ内容も検索対象に含める
                      </span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-foreground/70 text-sm">完全一致のみ</span>
                    </label>
                  </div>
                </div>
              )}
            </form>
          </section>

          {/* Search History */}
          {searchHistory.length > 0 && !query && (
            <section className="mb-8">
              <h2 className="text-foreground mb-3 text-lg font-medium">検索履歴</h2>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyQuery, index) => (
                  <button
                    key={index}
                    onClick={() => selectHistoryItem(historyQuery)}
                    className="bg-foreground/10 text-foreground/70 hover:bg-foreground/20 rounded px-3 py-1 text-sm transition-colors"
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
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-foreground text-lg font-medium">
                  &ldquo;{query}&rdquo; の検索結果
                </h2>
                <div className="text-foreground/60 text-sm">
                  {isLoading ? '検索中...' : `${results.length} 件`}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="py-12 text-center">
                <div className="loading mx-auto"></div>
                <p className="text-foreground/60 mt-4">検索中...</p>
              </div>
            )}

            {!isLoading && query && results.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-foreground/60 mb-4">検索結果が見つかりませんでした</p>
                <p className="text-foreground/50 text-sm">
                  • キーワードを変更して再度検索してください
                  <br />
                  • より一般的な用語を使用してください
                  <br />• フィルターを解除してください
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-6">
                {results.map(result => (
                  <div
                    key={result.id}
                    className="border-foreground/20 bg-gray/50 border p-6 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className={`text-sm font-medium ${getTypeColor(result.type)}`}>
                          {getTypeLabel(result.type)}
                        </span>
                        <span className="text-foreground/50 text-sm">
                          スコア: {(1 - result.score).toFixed(2)}
                        </span>
                      </div>
                      <Link
                        href={result.url}
                        className="text-primary flex items-center space-x-1 text-sm hover:underline"
                      >
                        <span>開く</span>
                        <ExternalLink size={14} />
                      </Link>
                    </div>

                    <h3 className="text-foreground mb-2 text-xl font-medium">
                      <Link href={result.url} className="hover:text-primary transition-colors">
                        {result.title}
                      </Link>
                    </h3>

                    <p className="text-foreground/70 mb-3 line-clamp-3">{result.description}</p>

                    {result.highlights.length > 0 && (
                      <div className="text-foreground/60 text-sm">
                        <strong>一致箇所:</strong> {result.highlights.slice(0, 3).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </GridContainer>
      </main>

      {/* Footer */}
      <footer className="border-foreground/20 border-t py-8 text-center">
        <GridContainer>
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
        </GridContainer>
      </footer>
    </GridLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
