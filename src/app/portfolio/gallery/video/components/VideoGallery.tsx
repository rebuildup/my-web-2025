"use client";

/**
 * Video Gallery Component
 * Task 4.2: Gallery performance optimization - never load markdown files
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files for gallery display
 * - Only display essential information (title, description, thumbnail, category, tags)
 * - Maintain consistent performance with large datasets
 * - Use item.description or item.content (legacy) but never markdown content
 */

import { SafeImage } from "@/components/ui/SafeImage";
import { ContentItem } from "@/types";
import { Calendar, Play, Video as VideoIcon } from "lucide-react";
import { useState } from "react";
import VideoDetailPanel from "./VideoDetailPanel";
import YouTubeThumbnail from "./YouTubeThumbnail";

interface VideoGalleryProps {
  items: ContentItem[];
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoGallery({ items }: VideoGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedItem(null);
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="noto-sans-jp-light text-foreground">
          映像作品がありません。
        </p>
      </div>
    );
  }

  return (
    <>
      {/* foriio-like beautiful layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const youtubeVideo = item.videos?.find((v) => v.type === "youtube");
          const videoId = youtubeVideo
            ? getYouTubeVideoId(youtubeVideo.url)
            : null;

          return (
            <div
              key={item.id}
              className="group cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              {/* Video Thumbnail */}
              <div className="aspect-video border border-foreground relative overflow-hidden mb-4">
                {item.thumbnail ? (
                  <SafeImage
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    showDebug={false}
                  />
                ) : videoId ? (
                  <YouTubeThumbnail
                    videoId={videoId}
                    alt={item.title}
                    fallbackSrc={youtubeVideo?.thumbnail}
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="w-12 h-12 text-foreground opacity-50" />
                  </div>
                )}

                {/* Play Overlay */}
                <div
                  className="absolute inset-0 transition-all duration-300 flex items-center justify-center"
                  style={{
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="space-y-3">
                <h3 className="zen-kaku-gothic-new text-lg text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </h3>

                {/* Description - 2-line truncation (Requirement 5.1) */}
                <p className="noto-sans-jp-light text-sm text-foreground text-truncate-2-lines leading-relaxed">
                  {item.description}
                </p>

                {/* Tags - moved above date (Requirement 5.2) */}
                {item.tags && item.tags.length > 0 && (
                  <div className="tags-container">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="noto-sans-jp-light text-xs text-foreground tag-overflow-indicator">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Meta Info - date and category */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-foreground" />
                    <span className="noto-sans-jp-light text-foreground">
                      {new Date(
                        item.updatedAt || item.createdAt,
                      ).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                  <span className="noto-sans-jp-light text-accent border border-accent px-2 py-1">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Panel */}
      <VideoDetailPanel
        item={selectedItem}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
}
