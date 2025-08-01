"use client";

/**
 * Detail Modal Component
 * Task 3.1: 詳細パネル表示機能（モーダル）の実装
 */

import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { Calendar, ExternalLink, Tag, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

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

          {/* Metadata - 日付とカテゴリーを横並び */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-accent" />
              <span className="text-foreground/70">Created:</span>
              <time dateTime={item.createdAt}>
                {new Date(item.createdAt).toLocaleDateString("ja-JP")}
              </time>
            </div>

            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-accent" />
                <span className="text-foreground/70">Updated:</span>
                <time dateTime={item.updatedAt}>
                  {new Date(item.updatedAt).toLocaleDateString("ja-JP")}
                </time>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-accent" />
              <span className="text-foreground/70">Category:</span>
              <span>{item.category}</span>
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
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-foreground">
          <Link
            href={`/portfolio/${item.id}`}
            className="flex items-center space-x-2 text-accent hover:text-primary transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">View Full Page</span>
          </Link>
        </footer>
      </div>
    </div>
  );
}
