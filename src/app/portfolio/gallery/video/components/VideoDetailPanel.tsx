"use client";

import { ContentItem, EnhancedContentItem } from "@/types";
import { Calendar, ExternalLink, Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface VideoDetailPanelProps {
  item: ContentItem | EnhancedContentItem | null;
  isOpen: boolean;
  onClose: () => void;
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

export default function VideoDetailPanel({
  item,
  isOpen,
  onClose,
}: VideoDetailPanelProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  if (!isOpen || !item) return null;

  const youtubeVideo = item.videos?.find((v) => v.type === "youtube");
  const videoId = youtubeVideo ? getYouTubeVideoId(youtubeVideo.url) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="bg-background border border-foreground max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.9)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-foreground">
          <h2 className="zen-kaku-gothic-new text-xl text-primary">
            {item.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-base transition-colors focus:outline-none focus:ring-2 focus:ring-foreground"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Player */}
          {videoId && (
            <div className="space-y-4">
              <div className="aspect-video bg-background border border-foreground relative">
                {!isVideoLoaded ? (
                  <>
                    {/* Background Thumbnail */}
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <Image
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        }}
                      />
                    )}
                    {/* Play Button Overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
                    >
                      <button
                        onClick={() => setIsVideoLoaded(true)}
                        className="flex items-center gap-2 text-black px-6 py-3 rounded-lg transition-all duration-300 shadow-lg"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.9)";
                        }}
                      >
                        <Play className="w-6 h-6" />
                        <span className="noto-sans-jp-light text-sm font-medium">
                          動画を再生
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title={item.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          )}

          {/* Content Info - 縦並びレイアウト（3行） */}
          <div className="space-y-6">
            {/* 作品情報 */}
            <div>
              <h3 className="zen-kaku-gothic-new text-lg text-primary mb-2">
                作品情報
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-foreground" />
                  <span className="noto-sans-jp-light text-sm text-foreground">
                    {new Date(
                      item.updatedAt || item.createdAt,
                    ).toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>

            {/* 説明 */}
            {item.description && (
              <div>
                <h3 className="zen-kaku-gothic-new text-lg text-primary mb-2">
                  説明
                </h3>
                <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* 関連リンク */}
            {item.externalLinks && item.externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-4">
                {item.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-accent hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="noto-sans-jp-light text-sm">
                      {link.title}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-foreground">
            <Link
              href={`/portfolio/${item.id}`}
              className="bg-primary text-background px-4 py-2 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground"
            >
              <span className="noto-sans-jp-light text-sm">
                詳細ページを見る
              </span>
            </Link>
            {youtubeVideo && (
              <a
                href={youtubeVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground"
              >
                <span className="noto-sans-jp-light text-sm">
                  YouTubeで見る
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
