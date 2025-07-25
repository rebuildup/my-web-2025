"use client";

import { useEffect, useRef } from "react";

interface UsePortfolioTrackingOptions {
  contentId: string;
  contentType?: "portfolio" | "portfolio-gallery" | "portfolio-detail";
  trackViews?: boolean;
  trackDownloads?: boolean;
  debounceMs?: number;
}

/**
 * Hook for tracking portfolio analytics
 * Automatically tracks page views and provides download tracking
 */
export function usePortfolioTracking({
  contentId,
  contentType = "portfolio",
  trackViews = true,
  trackDownloads = false,
  debounceMs = 2000,
}: UsePortfolioTrackingOptions) {
  const hasTrackedView = useRef(false);
  const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track page view
  useEffect(() => {
    if (!trackViews || hasTrackedView.current || !contentId) {
      return;
    }

    // Debounce view tracking to avoid spam
    trackingTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/stats/view", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: `${contentType}-${contentId}`,
            type: contentType,
            timestamp: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          hasTrackedView.current = true;
          console.log(`Portfolio view tracked: ${contentType}-${contentId}`);
        } else {
          console.warn("Failed to track portfolio view:", response.statusText);
        }
      } catch (error) {
        console.warn("Error tracking portfolio view:", error);
      }
    }, debounceMs);

    return () => {
      if (trackingTimeoutRef.current) {
        clearTimeout(trackingTimeoutRef.current);
      }
    };
  }, [contentId, contentType, trackViews, debounceMs]);

  // Download tracking function
  const trackDownload = async (fileName?: string, fileType?: string) => {
    if (!trackDownloads || !contentId) {
      return false;
    }

    try {
      const response = await fetch("/api/stats/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: `${contentType}-${contentId}`,
          fileName,
          fileType,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `Portfolio download tracked: ${contentType}-${contentId}`,
          data
        );
        return true;
      } else {
        console.warn(
          "Failed to track portfolio download:",
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.warn("Error tracking portfolio download:", error);
      return false;
    }
  };

  return {
    trackDownload,
    hasTrackedView: hasTrackedView.current,
  };
}

/**
 * Hook specifically for portfolio gallery tracking
 */
export function usePortfolioGalleryTracking(galleryType: string) {
  return usePortfolioTracking({
    contentId: galleryType,
    contentType: "portfolio-gallery",
    trackViews: true,
    trackDownloads: false,
  });
}

/**
 * Hook specifically for portfolio detail tracking
 */
export function usePortfolioDetailTracking(itemId: string) {
  return usePortfolioTracking({
    contentId: itemId,
    contentType: "portfolio-detail",
    trackViews: true,
    trackDownloads: true,
  });
}

/**
 * Hook specifically for individual portfolio item tracking
 */
export function usePortfolioItemTracking(itemId: string) {
  return usePortfolioTracking({
    contentId: itemId,
    contentType: "portfolio",
    trackViews: true,
    trackDownloads: true,
  });
}
