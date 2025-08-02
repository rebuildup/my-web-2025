/**
 * Cache Invalidation Strategy System
 * Provides intelligent cache invalidation based on data changes
 */

import { enhancedDataCache } from "./EnhancedCacheManager";

export interface CacheInvalidationEvent {
  type:
    | "content_updated"
    | "content_deleted"
    | "markdown_updated"
    | "tag_updated"
    | "image_updated";
  itemId?: string;
  category?: string;
  filePath?: string;
  tags?: string[];
  timestamp: number;
}

export interface CacheInvalidationRule {
  eventType: CacheInvalidationEvent["type"];
  invalidationTargets: (
    | "markdown"
    | "tags"
    | "images"
    | "portfolio"
    | "content"
  )[];
  condition?: (event: CacheInvalidationEvent) => boolean;
  customHandler?: (event: CacheInvalidationEvent) => void;
}

export class CacheInvalidationStrategy {
  private rules: CacheInvalidationRule[] = [];
  private eventHistory: CacheInvalidationEvent[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.setupDefaultRules();
  }

  /**
   * Setup default invalidation rules
   */
  private setupDefaultRules(): void {
    // Content update rules
    this.addRule({
      eventType: "content_updated",
      invalidationTargets: ["portfolio", "content"],
      customHandler: (event) => {
        // Invalidate specific category cache if category is known
        if (event.category) {
          enhancedDataCache.invalidateContentCache(
            new RegExp(`^portfolio:${event.category}`),
          );
        }
        // Invalidate all portfolio cache
        enhancedDataCache.invalidatePortfolioCache();
      },
    });

    // Content deletion rules
    this.addRule({
      eventType: "content_deleted",
      invalidationTargets: ["portfolio", "content", "markdown"],
      customHandler: (event) => {
        // Invalidate all portfolio-related caches
        enhancedDataCache.invalidatePortfolioCache();
        enhancedDataCache.invalidateContentCache();

        // If markdown file was associated, invalidate markdown cache
        if (event.filePath) {
          enhancedDataCache.invalidateMarkdownCache(event.filePath);
        }
      },
    });

    // Markdown update rules
    this.addRule({
      eventType: "markdown_updated",
      invalidationTargets: ["markdown"],
      customHandler: (event) => {
        if (event.filePath) {
          enhancedDataCache.invalidateMarkdownCache(event.filePath);
        }
        // Also invalidate portfolio cache as content might have changed
        enhancedDataCache.invalidatePortfolioCache();
      },
    });

    // Tag update rules
    this.addRule({
      eventType: "tag_updated",
      invalidationTargets: ["tags"],
      customHandler: (event) => {
        enhancedDataCache.invalidateTagCache();
        // If specific tags were updated, might affect portfolio filtering
        if (event.tags && event.tags.length > 0) {
          enhancedDataCache.invalidatePortfolioCache();
        }
      },
    });

    // Image update rules
    this.addRule({
      eventType: "image_updated",
      invalidationTargets: ["images"],
      customHandler: (event) => {
        if (event.filePath) {
          enhancedDataCache.invalidateImageCache(event.filePath);
        }
        // Image updates might affect portfolio display
        enhancedDataCache.invalidatePortfolioCache();
      },
    });
  }

  /**
   * Add a custom invalidation rule
   */
  addRule(rule: CacheInvalidationRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove invalidation rules by event type
   */
  removeRules(eventType: CacheInvalidationEvent["type"]): void {
    this.rules = this.rules.filter((rule) => rule.eventType !== eventType);
  }

  /**
   * Process a cache invalidation event
   */
  processEvent(event: CacheInvalidationEvent): void {
    // Add to event history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Find matching rules
    const matchingRules = this.rules.filter((rule) => {
      if (rule.eventType !== event.type) {
        return false;
      }

      if (rule.condition && !rule.condition(event)) {
        return false;
      }

      return true;
    });

    // Execute invalidation for each matching rule
    matchingRules.forEach((rule) => {
      // Execute standard invalidation targets
      rule.invalidationTargets.forEach((target) => {
        switch (target) {
          case "markdown":
            enhancedDataCache.invalidateMarkdownCache();
            break;
          case "tags":
            enhancedDataCache.invalidateTagCache();
            break;
          case "images":
            enhancedDataCache.invalidateImageCache();
            break;
          case "portfolio":
            enhancedDataCache.invalidatePortfolioCache();
            break;
          case "content":
            enhancedDataCache.invalidateContentCache();
            break;
        }
      });

      // Execute custom handler if provided
      if (rule.customHandler) {
        try {
          rule.customHandler(event);
        } catch (error) {
          console.error("[CacheInvalidation] Custom handler error:", error);
        }
      }
    });

    console.log(`[CacheInvalidation] Processed event: ${event.type}`, {
      rulesMatched: matchingRules.length,
      itemId: event.itemId,
      category: event.category,
      filePath: event.filePath,
    });
  }

  /**
   * Batch process multiple events
   */
  processBatchEvents(events: CacheInvalidationEvent[]): void {
    // Group events by type for optimization
    const eventGroups = events.reduce(
      (groups, event) => {
        if (!groups[event.type]) {
          groups[event.type] = [];
        }
        groups[event.type].push(event);
        return groups;
      },
      {} as Record<string, CacheInvalidationEvent[]>,
    );

    // Process each group
    Object.entries(eventGroups).forEach(([eventType, groupEvents]) => {
      console.log(
        `[CacheInvalidation] Processing batch of ${groupEvents.length} ${eventType} events`,
      );

      // For efficiency, we might want to consolidate similar invalidations
      if (eventType === "content_updated" || eventType === "content_deleted") {
        // If multiple content items updated, just invalidate all portfolio cache once
        enhancedDataCache.invalidatePortfolioCache();
        enhancedDataCache.invalidateContentCache();

        // Process individual events for specific invalidations
        groupEvents.forEach((event) => this.processEvent(event));
      } else {
        // Process events individually for other types
        groupEvents.forEach((event) => this.processEvent(event));
      }
    });
  }

  /**
   * Get event history for debugging
   */
  getEventHistory(): CacheInvalidationEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Get current invalidation rules
   */
  getRules(): CacheInvalidationRule[] {
    return [...this.rules];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Smart invalidation based on data dependencies
   */
  smartInvalidate(changes: {
    contentItems?: string[];
    markdownFiles?: string[];
    tags?: string[];
    images?: string[];
    categories?: string[];
  }): void {
    const events: CacheInvalidationEvent[] = [];
    const timestamp = Date.now();

    // Generate events based on changes
    if (changes.contentItems) {
      changes.contentItems.forEach((itemId) => {
        events.push({
          type: "content_updated",
          itemId,
          timestamp,
        });
      });
    }

    if (changes.markdownFiles) {
      changes.markdownFiles.forEach((filePath) => {
        events.push({
          type: "markdown_updated",
          filePath,
          timestamp,
        });
      });
    }

    if (changes.tags) {
      events.push({
        type: "tag_updated",
        tags: changes.tags,
        timestamp,
      });
    }

    if (changes.images) {
      changes.images.forEach((filePath) => {
        events.push({
          type: "image_updated",
          filePath,
          timestamp,
        });
      });
    }

    // Process all events in batch
    this.processBatchEvents(events);
  }

  /**
   * Preemptive cache warming after invalidation
   */
  async warmCacheAfterInvalidation(
    event: CacheInvalidationEvent,
    warmingData?: {
      commonTags?: string[];
      frequentlyAccessedItems?: { id: string; markdownPath?: string }[];
    },
  ): Promise<void> {
    try {
      // Warm common data based on event type
      switch (event.type) {
        case "tag_updated":
          if (warmingData?.commonTags) {
            // Pre-cache common tag searches
            console.log("[CacheInvalidation] Warming tag cache...");
          }
          break;

        case "content_updated":
        case "markdown_updated":
          if (warmingData?.frequentlyAccessedItems) {
            await enhancedDataCache.warmCache(
              warmingData.frequentlyAccessedItems,
            );
            console.log("[CacheInvalidation] Warmed content cache");
          }
          break;
      }
    } catch (error) {
      console.warn("[CacheInvalidation] Cache warming failed:", error);
    }
  }
}

// Global cache invalidation strategy instance
export const cacheInvalidationStrategy = new CacheInvalidationStrategy();

// Convenience functions for common invalidation scenarios
export const invalidateOnContentUpdate = (
  itemId: string,
  category?: string,
) => {
  cacheInvalidationStrategy.processEvent({
    type: "content_updated",
    itemId,
    category,
    timestamp: Date.now(),
  });
};

export const invalidateOnContentDelete = (
  itemId: string,
  markdownPath?: string,
) => {
  cacheInvalidationStrategy.processEvent({
    type: "content_deleted",
    itemId,
    filePath: markdownPath,
    timestamp: Date.now(),
  });
};

export const invalidateOnMarkdownUpdate = (filePath: string) => {
  cacheInvalidationStrategy.processEvent({
    type: "markdown_updated",
    filePath,
    timestamp: Date.now(),
  });
};

export const invalidateOnTagUpdate = (tags: string[]) => {
  cacheInvalidationStrategy.processEvent({
    type: "tag_updated",
    tags,
    timestamp: Date.now(),
  });
};

export const invalidateOnImageUpdate = (filePath: string) => {
  cacheInvalidationStrategy.processEvent({
    type: "image_updated",
    filePath,
    timestamp: Date.now(),
  });
};
