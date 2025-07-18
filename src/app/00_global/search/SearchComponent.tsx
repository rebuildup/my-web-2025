'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon, X, Filter, Loader2 } from 'lucide-react';
import { SearchResult, ContentType } from '@/types/content';

interface SearchComponentProps {
  initialQuery?: string;
  initialResults?: SearchResult[];
  initialTotal?: number;
  initialSuggestedQueries?: string[];
}

const contentTypeLabels: Record<ContentType, string> = {
  portfolio: 'Portfolio',
  blog: 'Blog',
  plugin: 'Plugin',
  tool: 'Tool',
  profile: 'Profile',
  page: 'Page',
  asset: 'Asset',
  download: 'Download',
};

const contentTypeIcons: Record<ContentType, React.ReactNode> = {
  portfolio: <span className="text-blue-500">📁</span>,
  blog: <span className="text-green-500">📝</span>,
  plugin: <span className="text-purple-500">🔌</span>,
  tool: <span className="text-orange-500">🔧</span>,
  profile: <span className="text-yellow-500">👤</span>,
  page: <span className="text-gray-500">📄</span>,
  asset: <span className="text-red-500">📦</span>,
  download: <span className="text-indigo-500">⬇️</span>,
};

export default function SearchComponent({
  initialQuery = '',
  initialResults = [],
  initialTotal = 0,
  initialSuggestedQueries = [],
}: SearchComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [total, setTotal] = useState(initialTotal);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(initialSuggestedQueries);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const ITEMS_PER_PAGE = 10;

  const performSearch = useCallback(
    async (searchQuery: string, page = 1, append = false) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setSuggestedQueries([]);
        setHasMore(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();
        params.set('q', searchQuery);

        // Add filters
        selectedTypes.forEach(type => params.append('type', type));
        selectedCategories.forEach(category => params.append('category', category));

        // Add pagination
        params.set('limit', ITEMS_PER_PAGE.toString());
        params.set('offset', ((page - 1) * ITEMS_PER_PAGE).toString());

        // Perform search
        const response = await fetch(`/api/content/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Search failed');
        }

        // Update state
        if (append) {
          setResults(prev => [...prev, ...data.data]);
        } else {
          setResults(data.data);
        }

        setTotal(data.pagination.total);
        setHasMore(data.pagination.hasMore);
        setSuggestedQueries(data.suggestedQueries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedTypes, selectedCategories]
  );

  // Update query from URL when component mounts or URL changes
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== query) {
      setQuery(urlQuery);
      if (urlQuery) {
        performSearch(urlQuery);
      }
    }

    // Get filters from URL
    const types = searchParams.getAll('type') as ContentType[];
    const categories = searchParams.getAll('category');

    setSelectedTypes(types);
    setSelectedCategories(categories);
  }, [searchParams, query, performSearch]);

  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();

      if (!query.trim()) return;

      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);

      // Add filters to URL
      selectedTypes.forEach(type => params.append('type', type));
      selectedCategories.forEach(category => params.append('category', category));

      router.push(`/00_global/search?${params.toString()}`);

      // Reset pagination
      setPage(1);

      // Perform search
      performSearch(query);
    },
    [query, selectedTypes, selectedCategories, router, performSearch]
  );

  const handleLoadMore = useCallback(() => {
    if (isLoading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    performSearch(query, nextPage, true);
  }, [query, page, isLoading, hasMore, performSearch]);

  const handleFilterChange = useCallback(() => {
    // Reset pagination
    setPage(1);

    // Update URL and perform search
    handleSearch();
  }, [handleSearch]);

  const toggleContentType = useCallback((type: ContentType) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedCategories([]);
  }, []);

  // Extract all categories from results
  const availableCategories = React.useMemo(() => {
    const categories = new Set<string>();
    results.forEach(result => {
      if (result.category) {
        categories.add(result.category);
      }
    });
    return Array.from(categories);
  }, [results]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for content..."
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp w-full rounded-none border px-4 py-3 pr-12 focus:outline-none"
              aria-label="Search query"
            />
            <div className="absolute top-0 right-0 flex h-full items-center">
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-foreground/50 hover:text-foreground mr-1 p-2"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                className="text-foreground/70 hover:text-foreground mr-1 p-2"
                aria-label="Search"
              >
                <SearchIcon size={18} />
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`mr-2 p-2 ${
                  showFilters || selectedTypes.length > 0 || selectedCategories.length > 0
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
                aria-label="Toggle filters"
                aria-expanded={showFilters}
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-foreground/20 bg-gray mt-2 border p-4">
              <div className="mb-4">
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-sm font-medium">
                  Content Types
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(contentTypeLabels).map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleContentType(type as ContentType)}
                      className={`border px-3 py-1 text-xs ${
                        selectedTypes.includes(type as ContentType)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {availableCategories.length > 0 && (
                <div className="mb-4">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-sm font-medium">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`border px-3 py-1 text-xs ${
                          selectedCategories.includes(category)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-foreground/70 hover:text-foreground text-xs"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={handleFilterChange}
                  className="bg-primary hover:bg-primary/80 px-3 py-1 text-xs text-white"
                >
                  Apply filters
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Search results */}
      <div>
        {query && !isLoading && !error && (
          <div className="mb-4 text-sm">
            <span className="text-foreground/70">
              {total} result{total !== 1 ? 's' : ''} for &quot;{query}&quot;
            </span>
          </div>
        )}

        {isLoading && page === 1 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-none border border-red-300 bg-red-50 p-4 text-red-800">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && results.length === 0 && query && (
          <div className="border-foreground/20 bg-gray/50 mb-4 rounded-none border p-6 text-center">
            <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
              No results found
            </h3>
            <p className="text-foreground/70 mb-4">
              We couldn&apos;t find any content matching your search.
            </p>

            {suggestedQueries.length > 0 && (
              <div>
                <p className="text-foreground mb-2 text-sm font-medium">Did you mean:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestedQueries.map((suggested, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggested);
                        handleSearch();
                      }}
                      className="border-primary text-primary hover:bg-primary/10 border px-3 py-1 text-sm"
                    >
                      {suggested}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map(result => (
              <div key={result.id} className="border-foreground/20 border p-4">
                <div className="mb-1 flex items-center gap-2">
                  {contentTypeIcons[result.type]}
                  <span className="text-foreground/60 text-xs uppercase">
                    {contentTypeLabels[result.type]}
                    {result.category && ` • ${result.category}`}
                  </span>
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-1 text-lg font-medium">
                  <Link href={result.url} className="hover:text-primary">
                    {result.title}
                  </Link>
                </h3>
                <p className="text-foreground/70 mb-2 text-sm">{result.description}</p>

                {result.highlights && result.highlights.length > 0 && (
                  <div className="border-foreground/10 bg-gray/30 mt-2 border p-2 text-sm">
                    <p
                      className="text-foreground/80 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: result.highlights[0].replace(
                          new RegExp(`(${query})`, 'gi'),
                          '<mark class="bg-yellow-200 text-gray-900 px-0.5">$1</mark>'
                        ),
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            {hasMore && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="border-foreground/20 text-foreground hover:border-primary/50 flex items-center gap-2 border px-4 py-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Load more results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
