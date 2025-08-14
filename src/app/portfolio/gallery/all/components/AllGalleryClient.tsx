/**
 * All Gallery Client Component
 * Client-side component for the all gallery page
 */

"use client";

import { SafeImage } from "@/components/ui/SafeImage";
import { SearchFilter } from "@/lib/portfolio/search-index";
import { ContentItem } from "@/types/content";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface FilterOptions {
  category?: string;
  technology?: string;
  year?: string;
  technologies?: string[];
  tags?: string[];
  search?: string;
}

export interface SortOptions {
  sortBy: "createdAt" | "updatedAt" | "title" | "priority" | "effectiveDate";
  sortOrder: "asc" | "desc";
}

interface AllGalleryClientProps {
  initialItems: ContentItem[];
  searchFilters?: SearchFilter[];
}

export function AllGalleryClient({ initialItems }: AllGalleryClientProps) {
  const [items] = useState(initialItems);
  const [filter, setFilter] = useState({
    category: "",
    technology: "",
    year: "",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [, setSortOptions] = useState<SortOptions>({
    sortBy: "effectiveDate",
    sortOrder: "desc",
  });

  const filteredAndSortedItems = useMemo(() => {
    // Simple fallback filtering for tests
    let filtered = [...items];

    // Apply category filter
    if (filter.category && filter.category !== "") {
      filtered = filtered.filter((item) => item.category === filter.category);
    }

    // Apply technology filter (check tags)
    if (filter.technology && filter.technology !== "") {
      filtered = filtered.filter(
        (item) => item.tags && item.tags.includes(filter.technology),
      );
    }

    // Apply year filter
    if (filter.year && filter.year !== "") {
      const year = parseInt(filter.year);
      filtered = filtered.filter((item) => {
        const itemYear = new Date(item.createdAt).getFullYear();
        return itemYear === year;
      });
    }

    // Sort by effective date (manual date if set, otherwise createdAt) in descending order
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [items, filter]);

  return (
    <div data-testid="all-gallery-client">
      {/* Header */}
      <div>
        <header className="space-y-12">
          <h1 className="neue-haas-grotesk-display text-6xl text-primary">
            All Projects
          </h1>
          <p className="noto-sans-jp-light text-sm max-w leading-loose">
            全ての作品を時系列・カテゴリ・技術で絞り込み表示します。
          </p>
        </header>
      </div>

      {/* Filters and Sort */}
      <div className="mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={filter.category || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Categories</option>
              <option value="develop">Develop</option>
              <option value="video">Video</option>
              <option value="design">Design</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Technology</label>
            <select
              value={filter.technology || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  technology: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Technologies</option>
              <option value="React">React</option>
              <option value="TypeScript">TypeScript</option>
              <option value="After Effects">After Effects</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={filter.year || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  year: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="mt-2 md:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedItems.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.id}`}
              className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors"
              data-testid="portfolio-item"
              data-category={item.category}
            >
              <div className="relative aspect-video bg-background border border-foreground overflow-hidden">
                {(() => {
                  const thumbnailSrc =
                    item.thumbnail ||
                    (item.images && item.images.length > 0
                      ? item.images[0]
                      : null);

                  return thumbnailSrc ? (
                    <SafeImage
                      src={thumbnailSrc}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                      showDebug={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="noto-sans-jp-light text-xs text-foreground">
                        {item.title}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <h3 className="zen-kaku-gothic-new text-base text-primary">
                  {item.title}
                </h3>
                <p className="noto-sans-jp-light text-sm text-foreground">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedItems.length === 0 && (
          <div className="text-center py-12">
            <p className="noto-sans-jp-light text-sm text-foreground">
              No items match the current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
