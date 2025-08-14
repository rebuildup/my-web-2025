"use client";

/**
 * Develop Gallery Client Component
 * Development projects gallery with filtering and sorting
 * Task 4.2: Gallery performance optimization - never load markdown files
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files for gallery display
 * - Only display essential information (title, description, thumbnail, category, tags)
 * - Use enhanced gallery filter with caching for performance
 * - Maintain consistent performance with large datasets
 */

import { SafeImage } from "@/components/ui/SafeImage";
import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { enhancedGalleryFilter } from "@/lib/portfolio/enhanced-gallery-filter";
import { SearchFilter } from "@/lib/portfolio/search-index";
import { EnhancedContentItem } from "@/types";
import { Calendar, Code, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { DetailModal } from "../../all/components/DetailModal";
import { FilterBar } from "../../all/components/FilterBar";
import { Pagination } from "../../all/components/Pagination";
import { SortControls } from "../../all/components/SortControls";

export interface FilterOptions {
  category?: string;
  technologies?: string[];
  year?: string;
  tags?: string[];
  search?: string;
}

export interface SortOptions {
  sortBy: "createdAt" | "updatedAt" | "title" | "priority" | "effectiveDate";
  sortOrder: "asc" | "desc";
}

interface DevelopGalleryClientProps {
  initialItems: PortfolioContentItem[];
  searchFilters: SearchFilter[];
}

const ITEMS_PER_PAGE = 12;

export function DevelopGalleryClient({
  initialItems,
  searchFilters,
}: DevelopGalleryClientProps) {
  // State management
  const [selectedItem, setSelectedItem] = useState<PortfolioContentItem | null>(
    null,
  );
  const [filters, setFilters] = useState<FilterOptions>({});
  const [sort, setSort] = useState<SortOptions>({
    sortBy: "effectiveDate",
    sortOrder: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort items - only show develop category items
  const filteredAndSortedItems = useMemo(() => {
    // Use enhanced gallery filter for develop category
    let items = enhancedGalleryFilter.filterItemsForGallery(
      initialItems,
      "develop",
      {
        // Apply additional filters
        tags: filters.tags,
        year: filters.year ? parseInt(filters.year) : undefined,
        search: filters.search,
      },
    );

    // Apply technology filter (not handled by enhanced filter yet)
    if (filters.technologies && filters.technologies.length > 0) {
      items = items.filter((item: EnhancedContentItem) =>
        filters.technologies!.some((tech: string) =>
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

  const handleModalClose = useCallback(() => {
    setSelectedItem(null);
  }, []);

  // Transform portfolio item to development project format
  const transformToDevelopProject = useCallback(
    (item: PortfolioContentItem | EnhancedContentItem) => {
      // Extract technologies from tags or use default
      const technologies =
        (item as unknown as PortfolioContentItem).technologies &&
        (item as unknown as PortfolioContentItem).technologies.length > 0
          ? (item as unknown as PortfolioContentItem).technologies
          : item.tags.length > 0
            ? item.tags
            : ["Web Development"];

      // Get GitHub repository link
      const githubUrl = item.externalLinks?.find(
        (link) => link.type === "github" || link.url.includes("github.com"),
      )?.url;

      // Get live demo link
      const liveUrl = item.externalLinks?.find(
        (link) => link.type === "demo" || link.type === "website",
      )?.url;

      // Format date
      const date = new Date(
        item.updatedAt || item.createdAt,
      ).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
      });

      // Determine status
      const status = item.status === "published" ? "completed" : "ongoing";

      // Get the best available thumbnail
      const thumbnail =
        item.thumbnail ||
        (item.images && item.images.length > 0 ? item.images[0] : null) ||
        (item.videos && item.videos.length > 0 && item.videos[0].thumbnail
          ? item.videos[0].thumbnail
          : null) ||
        "/images/default-project.png";

      return {
        id: item.id,
        title: item.title,
        description: item.description || "Development project",
        technologies,
        githubUrl,
        liveUrl,
        date,
        status,
        featured: item.priority >= 50,
        thumbnail,
        hasVideo: item.videos && item.videos.length > 0,
        videoUrl: item.videos?.[0]?.url,
      };
    },
    [],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "accent";
      case "ongoing":
        return "primary";
      default:
        return "foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "完成";
      case "ongoing":
        return "進行中";
      default:
        return "未定";
    }
  };

  // Transform paginated items to development project format
  const developProjects = useMemo(() => {
    return paginatedItems.map(transformToDevelopProject);
  }, [paginatedItems, transformToDevelopProject]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-8">
        <div className="space-y-4">
          <h1 className="neue-haas-grotesk-display text-6xl text-primary">
            Development Projects
          </h1>
          <p className="noto-sans-jp-light text-sm max-w leading-loose">
            Web開発・ゲーム開発・技術実装に重点を置いた作品集です。
            <br />
            技術スタック、GitHubリンク、実装の詳細を含めて紹介しています。
          </p>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-accent">
              {filteredAndSortedItems.length} development projects
            </span>
            <span className="text-foreground">
              Updated {new Date().toLocaleDateString("ja-JP")}
            </span>
          </div>
        </div>
      </header>

      {/* Controls */}
      <section className="space-y-6 mb-6 md:mb-8">
        <FilterBar
          filters={filters}
          searchFilters={searchFilters}
          onFilterChange={handleFilterChange}
        />
        <SortControls sort={sort} onSortChange={handleSortChange} />
      </section>

      {/* Gallery Content - Alternating Layout */}
      <section id="gallery-content" className="mt-2 md:mt-4">
        {initialItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="noto-sans-jp-light text-sm text-foreground">
              開発プロジェクトデータを読み込めませんでした。
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
        ) : developProjects.length > 0 ? (
          <div className="space-y-8">
            {/* All Projects - Single Row Alternating Layout */}
            <div className="space-y-12">
              {developProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="flex flex-col lg:flex-row lg:items-center gap-8"
                >
                  {/* Project Thumbnail - Left on even, Right on odd */}
                  <div
                    className={`lg:w-1/2 ${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
                  >
                    <Link href={`/portfolio/${project.id}`}>
                      <div className="aspect-video bg-base border border-foreground overflow-hidden hover:border-accent transition-colors group">
                        {project.thumbnail &&
                        project.thumbnail !== "/images/default-project.png" ? (
                          <SafeImage
                            src={project.thumbnail}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            showDebug={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-base">
                            <div className="text-center">
                              <Code className="w-12 h-12 text-accent mx-auto mb-2" />
                              <span className="noto-sans-jp-light text-sm text-foreground">
                                {project.title}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Project Info - Right on even, Left on odd */}
                  <div
                    className={`lg:w-1/2 space-y-4 ${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="w-5 h-5 text-accent mr-2" />
                        <span
                          className={`noto-sans-jp-light text-xs text-${getStatusColor(project.status)} border border-${getStatusColor(project.status)} px-2 py-1`}
                        >
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-foreground mr-2" />
                        <span className="noto-sans-jp-light text-sm text-foreground">
                          {project.date}
                        </span>
                      </div>
                    </div>

                    <Link href={`/portfolio/${project.id}`}>
                      <h3 className="zen-kaku-gothic-new text-2xl text-primary hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                    </Link>

                    <p className="noto-sans-jp-light text-base text-foreground leading-relaxed">
                      {project.description}
                    </p>

                    {/* Technology Stack Emphasis */}
                    <div className="space-y-2">
                      <h4 className="noto-sans-jp-light text-sm text-accent font-medium">
                        Technology Stack:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech: string) => (
                          <span
                            key={tech}
                            className="noto-sans-jp-light text-sm text-accent border border-accent px-3 py-1 bg-base hover:bg-accent hover:text-background transition-colors"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Repository and Live Links */}
                    <div className="flex items-center gap-6 pt-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-foreground hover:text-accent transition-colors"
                        >
                          <Github className="w-5 h-5 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            Repository
                          </span>
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-foreground hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          <span className="noto-sans-jp-light text-sm">
                            Live Demo
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
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
              フィルター条件に一致する開発プロジェクトが見つかりませんでした。
            </p>
            <p className="noto-sans-jp-light text-xs text-foreground/60 mt-2">
              開発プロジェクト数: {filteredAndSortedItems.length}
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

      {/* Navigation Links */}
      <nav aria-label="Development gallery functions">
        <h3 className="sr-only">Development Gallery機能</h3>
        <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
          <Link
            href="/portfolio/gallery/all"
            className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="noto-sans-jp-regular text-base leading-snug">
              All Projects
            </span>
          </Link>

          <Link
            href="/portfolio/gallery/video"
            className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="noto-sans-jp-regular text-base leading-snug">
              Video Projects
            </span>
          </Link>

          <Link
            href="/about/commission/develop"
            className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="noto-sans-jp-regular text-base leading-snug">
              Commission
            </span>
          </Link>
        </div>
      </nav>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal item={selectedItem} onClose={handleModalClose} />
      )}
    </div>
  );
}
