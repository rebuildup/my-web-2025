"use client";

/**
 * Portfolio Card Component
 * Task 3.1: 統一されたカードレイアウトの実装
 */

import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import Image from "next/image";
import { useState } from "react";

interface PortfolioCardProps {
  item: PortfolioContentItem;
  onClick: () => void;
}

export function PortfolioCard({ item, onClick }: PortfolioCardProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(item.thumbnail);

  const handleImageError = () => {
    if (currentImageSrc) {
      // Try different image formats as fallback
      const basePath = currentImageSrc
        .replace(/\.(webp|png|jpg|jpeg)$/, "")
        .replace(/-optimized$/, "");
      const fallbackFormats = [".webp", ".png", ".jpg", "-optimized.jpg"];

      const currentFormat =
        currentImageSrc.match(/\.(webp|png|jpg|jpeg)$/)?.[0] || "";
      const isOptimized = currentImageSrc.includes("-optimized");

      const currentIndex = fallbackFormats.findIndex(
        (format) => format === currentFormat,
      );

      // If current is optimized version, try non-optimized first
      if (isOptimized && currentFormat) {
        setCurrentImageSrc(basePath + currentFormat);
        return;
      }

      if (currentIndex < fallbackFormats.length - 1) {
        const nextFormat = fallbackFormats[currentIndex + 1];
        setCurrentImageSrc(basePath + nextFormat);
        return;
      }
    }

    console.warn(`Failed to load image: ${item.thumbnail}`);
    setImageError(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

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
      <div className="aspect-video bg-background border-b border-foreground overflow-hidden">
        {currentImageSrc && !imageError ? (
          <Image
            src={currentImageSrc}
            alt={item.title}
            width={400}
            height={225}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
            loading="lazy"
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-background">
            <span className="noto-sans-jp-light text-xs text-foreground/60">
              {item.title}
            </span>
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

        {/* Description */}
        <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
          {item.description}
        </p>

        {/* Technologies/Tags */}
        <div className="flex flex-wrap gap-1">
          {(item.technologies || item.tags || [])
            .slice(0, 3)
            .map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                className="noto-sans-jp-light text-xs text-foreground/80 border border-foreground/30 px-2 py-1 bg-background/50"
              >
                {tech}
              </span>
            ))}
          {(item.technologies || item.tags || []).length > 3 && (
            <span className="noto-sans-jp-light text-xs text-foreground/60 px-2 py-1">
              +{(item.technologies || item.tags || []).length - 3}
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
