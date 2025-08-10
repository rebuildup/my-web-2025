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
  sortBy: "createdAt" | "updatedAt" | "title" | "priority";
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

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter.category && item.category !== filter.category) return false;
      if (filter.technology && !item.tags?.includes(filter.technology))
        return false;
      if (filter.year) {
        const itemYear = new Date(item.createdAt).getFullYear().toString();
        if (itemYear !== filter.year) return false;
      }
      return true;
    });
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

      {/* Filters */}
      <div className="mb-6 md:mb-8">
        <div className="bg-base border border-foreground p-4">
          <h2 className="zen-kaku-gothic-new text-lg text-primary mb-4">
            Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
                Category
              </label>
              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
              >
                <option value="">All Categories</option>
                <option value="develop">Development</option>
                <option value="video">Video</option>
                <option value="design">Design</option>
              </select>
            </div>
            <div>
              <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
                Technology
              </label>
              <select
                value={filter.technology}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    technology: e.target.value,
                  }))
                }
                className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
              >
                <option value="">All Technologies</option>
                <option value="React">React</option>
                <option value="TypeScript">TypeScript</option>
                <option value="After Effects">After Effects</option>
              </select>
            </div>
            <div>
              <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
                Year
              </label>
              <select
                value={filter.year}
                onChange={(e) =>
                  setFilter((prev) => ({ ...prev, year: e.target.value }))
                }
                className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
              >
                <option value="">All Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="mt-2 md:mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/portfolio/${item.id}`}
              className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors"
              data-testid="portfolio-item"
              data-category={item.category}
            >
              <div className="relative aspect-video bg-background border border-foreground overflow-hidden">
                {item.thumbnail ? (
                  <SafeImage
                    src={item.thumbnail}
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
                )}
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
        {filteredItems.length === 0 && (
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
