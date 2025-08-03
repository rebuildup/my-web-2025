"use client";

/**
 * All Gallery Client Component
 * Task 3.1: 全作品ギャラリーのクライアントサイド実装
 */

import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { enhancedGalleryFilter } from "@/lib/portfolio/enhanced-gallery-filter";
import { SearchFilter } from "@/lib/portfolio/search-index";
import type { EnhancedCategoryType } from "@/types/enhanced-content";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { DetailModal } from "./DetailModal";
import { FilterBar } from "./FilterBar";
import { Pagination } from "./Pagination";
import { PortfolioCard } from "./PortfolioCard";
import { SortControls } from "./SortControls";

export interface FilterOptions {
  category?: string;
  technologies?: string[];
  year?: string;
  tags?: string[];
  search?: string;
}

export interface SortOptions {
  sortBy: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder: "asc" | "desc";
}

interface AllGalleryClientProps {
  initialItems: PortfolioContentItem[];
  searchFilters: SearchFilter[];
}

const ITEMS_PER_PAGE = 24;

export function AllGalleryClient({
  initialItems,
  searchFilters,
}: AllGalleryClientProps) {
  // State management
  const [selectedItem, setSelectedItem] = useState<PortfolioContentItem | null>(
    null,
  );
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    // Use enhanced gallery filter for all items
    let items = enhancedGalleryFilter.filterItemsForGallery(
      initialItems,
      "all",
      {
        // Apply filters
        categories:
          filters.category && filters.category !== "all"
            ? [filters.category as EnhancedCategoryType]
            : undefined,
        tags: filters.tags,
        year: filters.year ? parseInt(filters.year) : undefined,
        search: filters.search,
      },
    );

    // Apply technology filter (not handled by enhanced filter yet)
    if (filters.technologies && filters.technologies.length > 0) {
      items = items.filter((item) =>
        filters.technologies!.some((tech) =>
          ((item as unknown as PortfolioContentItem).technologies || []).some(
            (itemTech: string) =>
              itemTech.toLowerCase().includes(tech.toLowerCase()),
          ),
        ),
      );
    }

    // Apply sorting using enhanced gallery filter
    items = enhancedGalleryFilter.sortItems(items, {
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
    });

    return items;
  }, [initialItems, filters, sort]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedItems.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE,
    );
  }, [filteredAndSortedItems, currentPage]);

  // Event handlers
  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleSortChange = useCallback((newSort: SortOptions) => {
    setSort(newSort);
    setCurrentPage(1); // Reset to first page when sort changes
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of gallery
    const element = document.getElementById("gallery-content");
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, []);

  const handleCardClick = useCallback((item: PortfolioContentItem) => {
    setSelectedItem(item);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      data-testid="all-gallery-client"
    >
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Header */}
            <header className="space-y-8">
              <nav aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  <li>
                    <Link
                      href="/"
                      className="text-foreground hover:text-accent"
                    >
                      Home
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li>
                    <Link
                      href="/portfolio"
                      className="text-foreground hover:text-accent"
                    >
                      Portfolio
                    </Link>
                  </li>
                  <li className="text-foreground">/</li>
                  <li className="text-accent">All Projects</li>
                </ol>
              </nav>

              <div className="space-y-4">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  All Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  全ての作品を時系列・カテゴリ・技術で絞り込み表示。
                  フィルターとソート機能で効率的に作品を探索できます。
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-accent">
                    {filteredAndSortedItems.length} / {initialItems.length}{" "}
                    projects
                  </span>
                  <span className="text-foreground">
                    Updated {new Date().toLocaleDateString("ja-JP")}
                  </span>
                </div>
              </div>
            </header>

            {/* Controls */}
            <section className="space-y-6">
              <FilterBar
                filters={filters}
                searchFilters={searchFilters}
                onFilterChange={handleFilterChange}
              />
              <SortControls sort={sort} onSortChange={handleSortChange} />
            </section>

            {/* Gallery Content */}
            <section id="gallery-content">
              {initialItems.length === 0 ? (
                <div className="text-center py-16">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    ポートフォリオデータを読み込めませんでした。
                  </p>
                  <p className="noto-sans-jp-light text-xs text-foreground/60 mt-2">
                    初期アイテム数: {initialItems.length}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 text-accent hover:text-primary transition-colors"
                  >
                    ページを再読み込み
                  </button>
                </div>
              ) : paginatedItems.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedItems.map((item) => (
                      <PortfolioCard
                        key={item.id}
                        item={item as unknown as PortfolioContentItem}
                        onClick={() =>
                          handleCardClick(
                            item as unknown as PortfolioContentItem,
                          )
                        }
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    フィルター条件に一致する作品が見つかりませんでした。
                  </p>
                  <p className="noto-sans-jp-light text-xs text-foreground/60 mt-2">
                    初期アイテム数: {initialItems.length}, フィルター後:{" "}
                    {filteredAndSortedItems.length}
                  </p>
                  <button
                    onClick={() => {
                      setFilters({});
                      setCurrentPage(1);
                    }}
                    className="mt-4 text-accent hover:text-primary transition-colors"
                  >
                    フィルターをリセット
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={handleModalClose} />
      )}
    </div>
  );
}
