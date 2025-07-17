import React from 'react';
import { Metadata } from 'next';
import { search } from '@/lib/search/search-engine';
import SearchComponent from './SearchComponent';
import { ContentType } from '@/types/content';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: 'Search | samuido',
  description: 'Search across all content on samuido',
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';

  // Get content types from query params
  const contentTypes = Array.isArray(searchParams.type)
    ? searchParams.type
    : searchParams.type
      ? [searchParams.type]
      : [];

  // Get categories from query params
  const categories = Array.isArray(searchParams.category)
    ? searchParams.category
    : searchParams.category
      ? [searchParams.category]
      : [];

  // Get pagination params
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 10;
  const offset = typeof searchParams.offset === 'string' ? parseInt(searchParams.offset) : 0;

  // Perform server-side search if query exists
  let initialResults = [];
  let initialTotal = 0;
  let initialSuggestedQueries: string[] = [];

  if (query) {
    try {
      const results = await search({
        query,
        contentTypes: contentTypes.length > 0 ? (contentTypes as ContentType[]) : undefined,
        categories: categories.length > 0 ? categories : undefined,
        limit,
        offset,
      });

      initialResults = results.results;
      initialTotal = results.total;
      initialSuggestedQueries = results.suggestedQueries || [];
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">
          Search
        </h1>
        <p className="text-foreground/70 noto-sans-jp">サイト内検索</p>
      </div>

      <SearchComponent
        initialQuery={query}
        initialResults={initialResults}
        initialTotal={initialTotal}
        initialSuggestedQueries={initialSuggestedQueries}
      />
    </div>
  );
}
