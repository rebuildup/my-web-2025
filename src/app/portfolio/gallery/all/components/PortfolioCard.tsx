"use client";

/**
 * Portfolio Card Component
 * Task 3.1: 統一されたカードレイアウトの実装
 * Task 4.1: Gallery cards never display markdown content (Requirements 6.1, 6.2, 6.3, 6.4, 6.5)
 *
 * Gallery Card Content Rules:
 * - NEVER display markdown content or legacy content field
 * - ONLY show: title, description, thumbnail, category, tags, metadata
 * - Show subtle indicator for items with markdown content
 * - Maintain consistent layout regardless of content type
 */

import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { EnhancedContentItem } from "@/types";
import { isEnhancedContentItem } from "@/types/enhanced-content";
import { FileText } from "lucide-react";
import Image from "next/image";

interface PortfolioCardProps {
  item: PortfolioContentItem | EnhancedContentItem;
  onClick: () => void;
  // Gallery cards should NEVER display markdown content (Requirement 6.1)
  // Only display: title, description, thumbnail, category, tags (Requirement 6.2)
  showMarkdownIndicator?: boolean; // Default: true
  hideMarkdownContent?: boolean; // Always true for gallery cards (Requirement 6.1)
}

export function PortfolioCard({
  item,
  onClick,
  showMarkdownIndicator = true,
}: PortfolioCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  // Check if item has detailed markdown content (Requirements 6.5)
  // Only check for markdown content, not legacy content field
  const hasDetailedContent = isEnhancedContentItem(item) && item.markdownPath;

  return (
    <article
      className="bg-base border border-foreground hover:border-accent transition-colors cursor-pointer group"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${item.title}`}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-background border-b border-foreground overflow-hidden relative">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => {
              console.error(
                "Image failed to load:",
                item.thumbnail,
                "for item:",
                item.title,
              );
            }}
            onLoad={() => {
              console.log("Image loaded successfully:", item.thumbnail);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-background">
            <span className="noto-sans-jp-light text-xs text-foreground/60">
              {item.title}
            </span>
          </div>
        )}

        {/* Subtle indicator for items with detailed markdown content (Requirement 6.5) */}
        {hasDetailedContent && showMarkdownIndicator && (
          <div
            className="absolute top-2 right-2 bg-primary/80 text-white p-1.5 rounded-full shadow-sm backdrop-blur-sm"
            title="View detailed content"
            aria-label="This item has detailed content available"
          >
            <FileText className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title and Category */}
        <div className="space-y-1">
          <h2 className="zen-kaku-gothic-new text-base text-primary group-hover:text-accent transition-colors line-clamp-2">
            {item.title}
          </h2>
          <p className="noto-sans-jp-light text-xs text-foreground/70">
            {item.category}
          </p>
        </div>

        {/* Description - ONLY from item.description, NEVER from markdown content (Requirement 6.2) */}
        <p className="noto-sans-jp-light text-sm text-foreground text-truncate-2-lines">
          {item.description}
        </p>

        {/* Technologies/Tags */}
        <div className="tags-container flex flex-wrap gap-1">
          {((item as PortfolioContentItem).technologies || item.tags || [])
            .slice(0, 3)
            .map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="noto-sans-jp-light text-xs text-foreground/80 border border-foreground/30 px-2 py-1 bg-background/50"
              >
                {tech}
              </span>
            ))}
          {((item as PortfolioContentItem).technologies || item.tags || [])
            .length > 3 && (
            <span className="noto-sans-jp-light text-xs tag-overflow-indicator">
              +
              {((item as PortfolioContentItem).technologies || item.tags || [])
                .length - 3}
            </span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-foreground/60">
          <time dateTime={item.createdAt}>
            {new Date(item.createdAt).toLocaleDateString("ja-JP")}
          </time>
          {item.priority && item.priority > 50 && (
            <span className="text-accent">Featured</span>
          )}
        </div>
      </div>
    </article>
  );
}
