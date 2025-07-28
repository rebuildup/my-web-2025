"use client";

/**
 * Detail Modal Component
 * Task 3.1: 詳細パネル表示機能（モーダル）の実装
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ExternalLink, Calendar, Tag, Code } from "lucide-react";
import { PortfolioContentItem } from "@/lib/portfolio/data-processor";

interface DetailModalProps {
  item: PortfolioContentItem;
  onClose: () => void;
}

export function DetailModal({ item, onClose }: DetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    // Focus the close button when modal opens
    closeButtonRef.current?.focus();

    // Trap focus within modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-background border border-foreground max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-foreground">
          <h1
            id="modal-title"
            className="zen-kaku-gothic-new text-xl text-primary"
          >
            {item.title}
          </h1>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 hover:bg-foreground/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Main Image */}
          {item.thumbnail && (
            <div className="aspect-video bg-background border border-foreground overflow-hidden">
              <Image
                src={item.thumbnail}
                alt={item.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
                priority
                unoptimized={true}
              />
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-foreground/70">Created:</span>
                <time dateTime={item.createdAt}>
                  {new Date(item.createdAt).toLocaleDateString("ja-JP")}
                </time>
              </div>

              {item.updatedAt && item.updatedAt !== item.createdAt && (
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-accent" />
                  <span className="text-foreground/70">Updated:</span>
                  <time dateTime={item.updatedAt}>
                    {new Date(item.updatedAt).toLocaleDateString("ja-JP")}
                  </time>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm">
                <Tag className="w-4 h-4 text-accent" />
                <span className="text-foreground/70">Category:</span>
                <span>{item.category}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Technologies */}
              {item.technologies && item.technologies.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <Code className="w-4 h-4 text-accent" />
                    <span className="text-foreground/70">Technologies:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.technologies.map((tech, index) => (
                      <span
                        key={`${tech}-${index}`}
                        className="noto-sans-jp-light text-xs text-foreground border border-foreground/30 px-2 py-1 bg-background/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-sm mb-2">
                    <Tag className="w-4 h-4 text-accent" />
                    <span className="text-foreground/70">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, index) => (
                      <span
                        key={`${tag}-${index}`}
                        className="noto-sans-jp-light text-xs text-foreground border border-foreground/30 px-2 py-1 bg-background/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="zen-kaku-gothic-new text-lg text-primary">
              Description
            </h2>
            <p className="noto-sans-jp-light text-sm text-foreground leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Content */}
          {item.content && (
            <div className="space-y-2">
              <h2 className="zen-kaku-gothic-new text-lg text-primary">
                Details
              </h2>
              <div className="noto-sans-jp-light text-sm text-foreground leading-relaxed prose prose-sm max-w-none">
                {/* Simple markdown-like rendering */}
                {item.content.split("\n").map((line, index) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h3
                        key={index}
                        className="text-lg font-medium text-primary mt-4 mb-2"
                      >
                        {line.slice(2)}
                      </h3>
                    );
                  } else if (line.startsWith("## ")) {
                    return (
                      <h4
                        key={index}
                        className="text-base font-medium text-primary mt-3 mb-2"
                      >
                        {line.slice(3)}
                      </h4>
                    );
                  } else if (line.trim() === "") {
                    return <br key={index} />;
                  } else {
                    return (
                      <p key={index} className="mb-2">
                        {line}
                      </p>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {/* Videos */}
          {item.videos && item.videos.length > 0 && (
            <div className="space-y-4">
              <h2 className="zen-kaku-gothic-new text-lg text-primary">
                Videos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {item.videos.map((video, index) => (
                  <div key={index} className="space-y-2">
                    <div className="aspect-video bg-background border border-foreground">
                      {video.type === "youtube" && video.url && (
                        <iframe
                          src={video.url
                            .replace("youtu.be/", "youtube.com/embed/")
                            .replace("watch?v=", "embed/")}
                          title={video.title || `Video ${index + 1}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      )}
                    </div>
                    {video.title && (
                      <h3 className="text-sm font-medium text-primary">
                        {video.title}
                      </h3>
                    )}
                    {video.description && (
                      <p className="text-xs text-foreground/70">
                        {video.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Images */}
          {item.images && item.images.length > 1 && (
            <div className="space-y-4">
              <h2 className="zen-kaku-gothic-new text-lg text-primary">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.images.slice(1).map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-background border border-foreground overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${item.title} - Image ${index + 2}`}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      unoptimized={true}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-foreground flex items-center justify-between">
          <Link
            href={`/portfolio/${item.id}`}
            className="flex items-center space-x-2 text-accent hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">View Full Page</span>
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
