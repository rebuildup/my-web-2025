/**
 * Service Worker Registration and Performance Monitoring
 * Handles service worker lifecycle and performance optimization
 */

export interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  version?: string;
}

export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private status: ServiceWorkerStatus = {
    isSupported: false,
    isRegistered: false,
    isActive: false,
  };

  constructor() {
    this.status.isSupported =
      typeof window !== "undefined" && "serviceWorker" in navigator;
  }

  // Register service worker with proper error handling
  public async register(): Promise<ServiceWorkerStatus> {
    if (!this.status.isSupported) {
      console.warn("Service Worker not supported");
      return this.status;
    }

    // Only register in production to avoid development issues
    if (process.env.NODE_ENV !== "production") {
      console.log("Service Worker: Skipping registration in development");
      return this.status;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      this.status.isRegistered = true;

      // Check if service worker is active
      if (this.registration.active) {
        this.status.isActive = true;
      }

      // Handle updates
      this.registration.addEventListener("updatefound", () => {
        this.handleUpdate();
      });

      // Listen for controller changes
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("Service Worker: Controller changed");
        // Reload page to get new content
        if (process.env.NODE_ENV === "production") {
          window.location.reload();
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleMessage(event);
      });

      console.log("Service Worker: Registered successfully");
      return this.status;
    } catch (error) {
      console.error("Service Worker: Registration failed", error);
      return this.status;
    }
  }

  // Handle service worker updates
  private handleUpdate(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener("statechange", () => {
      if (
        newWorker.state === "installed" &&
        navigator.serviceWorker.controller
      ) {
        // New service worker is available
        this.showUpdateNotification();
      }
    });
  }

  // Show update notification to user
  private showUpdateNotification(): void {
    // In a real app, you might show a toast or banner
    console.log("Service Worker: New version available");

    // Auto-update after a delay
    setTimeout(() => {
      this.skipWaiting();
    }, 5000);
  }

  // Skip waiting and activate new service worker
  public skipWaiting(): void {
    if (!this.registration || !this.registration.waiting) return;

    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  // Handle messages from service worker
  private handleMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case "CACHE_UPDATED":
        console.log("Service Worker: Cache updated");
        break;
      case "SW_ERROR":
        console.error("Service Worker Error:", data.error);
        // Report error to monitoring service
        this.reportError(data.error);
        break;
      case "OFFLINE":
        console.log("Service Worker: App is offline");
        this.handleOfflineStatus(true);
        break;
      case "ONLINE":
        console.log("Service Worker: App is online");
        this.handleOfflineStatus(false);
        break;
      default:
        console.log("Service Worker: Unknown message", data);
    }
  }

  // Handle offline/online status
  private handleOfflineStatus(isOffline: boolean): void {
    // Update UI to show offline status
    document.body.classList.toggle("offline", isOffline);

    // Dispatch custom event for components to listen to
    window.dispatchEvent(
      new CustomEvent("sw-connection-change", {
        detail: { isOffline },
      }),
    );
  }

  // Report errors to monitoring service
  private reportError(error: {
    message: string;
    url: string;
    timestamp: number;
  }): void {
    if (process.env.NODE_ENV === "production") {
      // Send to error tracking service
      fetch("/api/monitoring/errors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "service_worker_error",
          error: error,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    }
  }

  // Clear all caches
  public async clearCache(): Promise<void> {
    if (!navigator.serviceWorker.controller) return;

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
      console.log("Service Worker: Cache cleared", event.data);
    };

    navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" }, [
      messageChannel.port2,
    ]);
  }

  // Get current status
  public getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }
}

// Performance monitoring integration
export class PerformanceServiceWorker {
  private swRegistration: ServiceWorkerManager;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    this.swRegistration = new ServiceWorkerManager();
  }

  // Initialize service worker and performance monitoring
  public async initialize(): Promise<void> {
    // Register service worker
    await this.swRegistration.register();

    // Start performance monitoring
    this.startPerformanceMonitoring();

    // Preload critical resources
    this.preloadCriticalResources();
  }

  // Start performance monitoring
  private startPerformanceMonitoring(): void {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      return;
    }

    try {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Monitor resource loading performance
          if (entry.entryType === "resource") {
            const resourceEntry = entry as PerformanceResourceTiming;
            if (resourceEntry.duration > 3000) {
              // Slow resource
              console.warn("Slow resource detected:", {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
              });
            }
          }

          // Monitor navigation performance
          if (entry.entryType === "navigation") {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log("Navigation performance:", {
              domContentLoaded:
                navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              totalTime: navEntry.loadEventEnd - navEntry.fetchStart,
            });
          }
        });
      });

      this.performanceObserver.observe({
        entryTypes: ["resource", "navigation", "measure"],
      });
    } catch (error) {
      console.warn("Performance monitoring failed to start:", error);
    }
  }

  // Preload critical resources
  private preloadCriticalResources(): void {
    const criticalResources = [
      { href: "/favicon.ico", as: "image" },
      { href: "/manifest.json", as: "fetch", crossorigin: "anonymous" },
    ];

    criticalResources.forEach(({ href, as, crossorigin }) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = href;
      link.setAttribute("as", as);
      if (crossorigin) {
        link.setAttribute("crossorigin", crossorigin);
      }

      // Add error handling
      link.onerror = () => {
        console.warn("Failed to preload resource:", href);
      };

      document.head.appendChild(link);
    });
  }

  // Cleanup
  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }

  // Get service worker status
  public getStatus(): ServiceWorkerStatus {
    return this.swRegistration.getStatus();
  }

  // Clear cache
  public async clearCache(): Promise<void> {
    return this.swRegistration.clearCache();
  }
}

// Global instance
let performanceServiceWorker: PerformanceServiceWorker | null = null;

// Initialize service worker and performance monitoring
export const initializeServiceWorker =
  async (): Promise<PerformanceServiceWorker> => {
    if (!performanceServiceWorker) {
      performanceServiceWorker = new PerformanceServiceWorker();
      await performanceServiceWorker.initialize();
    }
    return performanceServiceWorker;
  };

// Get current instance
export const getServiceWorker = (): PerformanceServiceWorker | null => {
  return performanceServiceWorker;
};

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (performanceServiceWorker) {
      performanceServiceWorker.cleanup();
    }
  });
}
