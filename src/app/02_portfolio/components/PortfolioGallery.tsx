'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Filter, Loader2, ExternalLink, Eye } from 'lucide-react';
import { ContentItem } from '@/types/content';
import { trackStat } from '@/lib/stats';

interface PortfolioGalleryProps {
  initialItems?: ContentItem[];
  initialCategory?: string;
}

// Portfolio categories
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'develop', label: 'Development' },
  { id: 'design', label: 'Design' },
  { id: 'video', label: 'Video' },
  { id: 'video&design', label: 'Video & Design' },
];

export default function PortfolioGallery({
  initialItems = [],
  initialCategory = 'all',
}: PortfolioGalleryProps) {
  const [items, setItems] = useState<ContentItem[]>(initialItems);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [isLoading, setIsLoading] = useState<boolean>(initialItems.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Filter items by category
  const filterItems = useCallback(
    (category: string, itemsToFilter = items) => {
      if (category === 'all') {
        setFilteredItems(itemsToFilter);
      } else {
        setFilteredItems(itemsToFilter.filter(item => item.category === category));
      }
    },
    [items]
  );

  // Load portfolio items from API
  const loadPortfolioItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/portfolio');

      if (!response.ok) {
        throw new Error('Failed to load portfolio items');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load portfolio items');
      }

      setItems(data.data);
      filterItems(selectedCategory, data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio items');
      console.error('Error loading portfolio items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterItems, selectedCategory]);

  // Load portfolio items if not provided
  useEffect(() => {
    if (initialItems.length === 0) {
      loadPortfolioItems();
    }
  }, [initialItems, loadPortfolioItems]);

  // Filter items when category changes
  useEffect(() => {
    filterItems(selectedCategory);
  }, [selectedCategory, items, filterItems]);

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    // Update URL query parameter without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url.toString());
  };

  // Track item view
  const trackItemView = async (id: string) => {
    try {
      await trackStat('view', id);
    } catch (err) {
      console.error('Failed to track view:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with filters and stats link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="mr-2 flex items-center">
            <Filter size={16} className="mr-1" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`border px-3 py-1 text-sm ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <Link
          href="/02_portfolio/stats"
          className="text-foreground/70 hover:text-primary flex items-center text-sm"
        >
          <Eye size={16} className="mr-1" />
          View Statistics
        </Link>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-none border border-red-300 bg-red-50 p-4 text-red-800">
          <p>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="border-foreground/20 bg-gray/50 rounded-none border p-6 text-center">
          <h3 className="text-foreground mb-2 text-lg font-medium">No items found</h3>
          <p className="text-foreground/70">No portfolio items found in the selected category.</p>
        </div>
      )}

      {/* Portfolio grid */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Link
              key={item.id}
              href={`/02_portfolio/${item.id}`}
              onClick={() => trackItemView(item.id)}
              className="group block"
            >
              <div className="border-foreground/20 overflow-hidden border">
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}

                  {/* Category badge */}
                  <div className="absolute right-2 bottom-2 bg-black/70 px-2 py-1 text-xs text-white">
                    {item.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-foreground group-hover:text-primary text-lg font-medium">
                    {item.title}
                  </h3>
                  <p className="text-foreground/70 mt-1 line-clamp-2 text-sm">{item.description}</p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="bg-gray/50 text-foreground/60 px-2 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="bg-gray/50 text-foreground/60 px-2 py-0.5 text-xs">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* External links */}
                  {item.externalLinks && item.externalLinks.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      {item.externalLinks.map(link => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-foreground/60 hover:text-primary flex items-center text-xs"
                        >
                          <ExternalLink size={12} className="mr-1" />
                          {link.type}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
