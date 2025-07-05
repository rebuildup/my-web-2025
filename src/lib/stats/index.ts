// Statistics data management
import { StatData } from '@/types/content';
import { AppErrorHandler } from '@/lib/utils/error-handling';

// Update statistics for downloads, views, or searches
export const updateStats = async (
  type: 'download' | 'view' | 'search',
  id: string
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/stats/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${type} stats: ${response.status}`);
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, `Update ${type} stats`);
    return false;
  }
};

// Get statistics for a specific item or all items
export const getStats = async (
  type: 'download' | 'view' | 'search',
  id?: string
): Promise<number | Record<string, number>> => {
  try {
    const url = id 
      ? `/api/stats/${type}?id=${encodeURIComponent(id)}`
      : `/api/stats/${type}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to get ${type} stats: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return data.data;
    }
    
    return id ? 0 : {};
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, `Get ${type} stats`);
    return id ? 0 : {};
  }
};

// Get all statistics for an item
export const getItemStats = async (id: string): Promise<{
  views: number;
  downloads: number;
  searches: number;
}> => {
  try {
    const [views, downloads, searches] = await Promise.all([
      getStats('view', id),
      getStats('download', id),
      getStats('search', id),
    ]);

    return {
      views: typeof views === 'number' ? views : 0,
      downloads: typeof downloads === 'number' ? downloads : 0,
      searches: typeof searches === 'number' ? searches : 0,
    };
  } catch (error) {
    console.error('Failed to get item stats:', error);
    return { views: 0, downloads: 0, searches: 0 };
  }
};

// Get top items by statistics
export const getTopItems = async (
  type: 'download' | 'view' | 'search',
  limit: number = 10
): Promise<Array<{ id: string; count: number }>> => {
  try {
    const stats = await getStats(type);
    
    if (typeof stats === 'object') {
      return Object.entries(stats)
        .map(([id, count]) => ({ id, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to get top ${type} items:`, error);
    return [];
  }
};

// Get statistics summary
export const getStatsSummary = async (): Promise<{
  totalViews: number;
  totalDownloads: number;
  totalSearches: number;
  topViewed: Array<{ id: string; count: number }>;
  topDownloaded: Array<{ id: string; count: number }>;
  topSearched: Array<{ id: string; count: number }>;
}> => {
  try {
    const [viewStats, downloadStats, searchStats] = await Promise.all([
      getStats('view'),
      getStats('download'),
      getStats('search'),
    ]);

    const calculateTotal = (stats: any): number => {
      if (typeof stats === 'object') {
        return Object.values(stats).reduce((sum, count) => sum + (count as number), 0);
      }
      return 0;
    };

    const getTopFromStats = (stats: any, limit: number = 5) => {
      if (typeof stats === 'object') {
        return Object.entries(stats)
          .map(([id, count]) => ({ id, count: count as number }))
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
      }
      return [];
    };

    return {
      totalViews: calculateTotal(viewStats),
      totalDownloads: calculateTotal(downloadStats),
      totalSearches: calculateTotal(searchStats),
      topViewed: getTopFromStats(viewStats),
      topDownloaded: getTopFromStats(downloadStats),
      topSearched: getTopFromStats(searchStats),
    };
  } catch (error) {
    console.error('Failed to get stats summary:', error);
    return {
      totalViews: 0,
      totalDownloads: 0,
      totalSearches: 0,
      topViewed: [],
      topDownloaded: [],
      topSearched: [],
    };
  }
};

// Client-side statistics tracking
export const trackView = async (id: string, type: string): Promise<void> => {
  // Throttle view tracking to prevent spam
  const key = `view_tracked_${id}`;
  const lastTracked = localStorage.getItem(key);
  const now = Date.now();
  
  if (lastTracked && (now - parseInt(lastTracked, 10)) < 60000) {
    return; // Don't track if viewed within last minute
  }
  
  try {
    await updateStats('view', id);
    localStorage.setItem(key, now.toString());
  } catch (error) {
    console.error('Failed to track view:', error);
  }
};

export const trackDownload = async (id: string, filename?: string): Promise<void> => {
  try {
    await updateStats('download', id);
    
    // Store download history locally
    const downloads = getLocalDownloadHistory();
    downloads.unshift({
      id,
      filename: filename || 'unknown',
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 50 downloads
    localStorage.setItem('download_history', JSON.stringify(downloads.slice(0, 50)));
  } catch (error) {
    console.error('Failed to track download:', error);
  }
};

export const trackSearch = async (query: string): Promise<void> => {
  try {
    await updateStats('search', query.toLowerCase());
    
    // Store search history locally
    const searches = getLocalSearchHistory();
    if (!searches.includes(query)) {
      searches.unshift(query);
      localStorage.setItem('search_history', JSON.stringify(searches.slice(0, 20)));
    }
  } catch (error) {
    console.error('Failed to track search:', error);
  }
};

// Local storage helpers
export const getLocalDownloadHistory = (): Array<{
  id: string;
  filename: string;
  timestamp: string;
}> => {
  try {
    const history = localStorage.getItem('download_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const getLocalSearchHistory = (): string[] => {
  try {
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const clearLocalHistory = (type: 'downloads' | 'searches' | 'all'): void => {
  try {
    if (type === 'downloads' || type === 'all') {
      localStorage.removeItem('download_history');
    }
    if (type === 'searches' || type === 'all') {
      localStorage.removeItem('search_history');
    }
  } catch (error) {
    console.error('Failed to clear local history:', error);
  }
};

// Statistics export
export const exportStats = async (): Promise<StatData | null> => {
  try {
    const [downloads, views, searches] = await Promise.all([
      getStats('download'),
      getStats('view'),
      getStats('search'),
    ]);

    return {
      downloads: downloads as Record<string, number>,
      views: views as Record<string, number>,
      searches: searches as Record<string, number>,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to export stats:', error);
    return null;
  }
};

// Real-time statistics updates
export const subscribeToStatsUpdates = (
  callback: (stats: { type: string; id: string; count: number }) => void
): (() => void) => {
  // This would typically use WebSockets or Server-Sent Events
  // For now, we'll use polling as a fallback
  const interval = setInterval(async () => {
    try {
      const response = await fetch('/api/stats/updates');
      if (response.ok) {
        const updates = await response.json();
        updates.forEach(callback);
      }
    } catch (error) {
      console.error('Failed to fetch stats updates:', error);
    }
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
};

// Analytics integration helpers
export const sendAnalyticsEvent = (
  eventName: string,
  parameters: Record<string, any>
): void => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, parameters);
  }

  // Custom analytics
  console.log('Analytics Event:', { eventName, parameters });
};

export const trackPageView = (page: string, title?: string): void => {
  sendAnalyticsEvent('page_view', {
    page_title: title || document.title,
    page_location: window.location.href,
    page_path: page,
  });
};

export const trackFileDownload = (fileId: string, fileName: string): void => {
  sendAnalyticsEvent('file_download', {
    file_id: fileId,
    file_name: fileName,
    value: 1,
  });
};

export const trackSearchQuery = (query: string, resultCount: number): void => {
  sendAnalyticsEvent('search', {
    search_term: query,
    result_count: resultCount,
  });
};

export const trackToolUsage = (toolId: string, action: string): void => {
  sendAnalyticsEvent('tool_usage', {
    tool_id: toolId,
    action,
    value: 1,
  });
};