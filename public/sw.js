/**
 * Service Worker for samuido website
 * Implements caching strategies and offline functionality
 * Enhanced with performance regression fixes
 */

const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `samuido-${CACHE_VERSION}`;
const STATIC_CACHE = `samuido-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `samuido-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `samuido-images-${CACHE_VERSION}`;
const API_CACHE = `samuido-api-${CACHE_VERSION}`;

// Resources to cache immediately (only essential and guaranteed to exist)
const STATIC_ASSETS = [
  "/",
  "/about",
  "/portfolio",
  "/workshop",
  "/tools",
  "/search",
  "/privacy-policy",
  "/favicon.ico",
  "/manifest.json",
];

// Critical resources for performance
const CRITICAL_RESOURCES = [
  "/_next/static/css/",
  "/_next/static/chunks/",
  "/images/og-image.png",
];

// Performance monitoring
const PERFORMANCE_METRICS = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0,
};

// Cache strategies with performance optimizations
const CACHE_STRATEGIES = {
  // Static assets - Cache first with long TTL
  static: ["/_next/static/", "/images/", "/videos/", "/fonts/", "/favicons/"],
  // API routes - Network first with fallback and short TTL
  api: ["/api/content/", "/api/stats/", "/api/monitoring/"],
  // Dynamic content - Stale while revalidate
  dynamic: ["/portfolio/", "/workshop/", "/tools/", "/about/"],
  // Critical resources - Preload and cache aggressively
  critical: CRITICAL_RESOURCES,
};

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  SLOW_REQUEST: 3000, // 3 seconds
  CACHE_SIZE_LIMIT: 50 * 1024 * 1024, // 50MB
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Performance monitoring functions
async function preloadCriticalResources() {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const preloadPromises = CRITICAL_RESOURCES.map(async (resource) => {
      try {
        const response = await fetch(resource, { cache: "force-cache" });
        if (response.ok) {
          await cache.put(resource, response);
          console.log("Service Worker: Preloaded", resource);
        }
      } catch (error) {
        console.warn(
          "Service Worker: Failed to preload",
          resource,
          error.message,
        );
      }
    });
    await Promise.allSettled(preloadPromises);
  } catch (error) {
    console.error(
      "Service Worker: Critical resource preloading failed:",
      error,
    );
  }
}

function initializePerformanceMonitoring() {
  // Set up periodic cache cleanup
  setInterval(cleanupOldCaches, 60 * 60 * 1000); // Every hour

  // Monitor cache size
  setInterval(monitorCacheSize, 30 * 60 * 1000); // Every 30 minutes

  console.log("Service Worker: Performance monitoring initialized");
}

async function cleanupOldCaches() {
  try {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(
      (name) => name.startsWith("samuido-") && !name.includes(CACHE_VERSION),
    );

    await Promise.all(oldCaches.map((name) => caches.delete(name)));

    if (oldCaches.length > 0) {
      console.log("Service Worker: Cleaned up old caches:", oldCaches);
    }
  } catch (error) {
    console.error("Service Worker: Cache cleanup failed:", error);
  }
}

async function monitorCacheSize() {
  try {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;

      if (usage > PERFORMANCE_THRESHOLDS.CACHE_SIZE_LIMIT) {
        console.warn("Service Worker: Cache size limit exceeded", {
          usage: Math.round(usage / 1024 / 1024) + "MB",
          quota: Math.round(quota / 1024 / 1024) + "MB",
        });

        // Trigger cache cleanup
        await cleanupOldCaches();
      }
    }
  } catch (error) {
    console.error("Service Worker: Cache size monitoring failed:", error);
  }
}

function reportError(type, details) {
  try {
    // Send error to monitoring endpoint
    fetch("/api/monitoring/errors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "service_worker_error",
        subtype: type,
        details,
        timestamp: new Date().toISOString(),
        metrics: PERFORMANCE_METRICS,
      }),
    }).catch(() => {
      // Silently fail if monitoring is unavailable
    });
  } catch (error) {
    // Silently fail to prevent infinite error loops
  }
}

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(async (cache) => {
        console.log("Service Worker: Caching static assets");

        // Cache assets individually to handle failures gracefully
        const cachePromises = STATIC_ASSETS.map(async (asset) => {
          try {
            const response = await fetch(asset, {
              cache: "no-cache",
              headers: {
                "Cache-Control": "no-cache",
              },
            });
            if (response.ok) {
              await cache.put(asset, response);
              console.log("Service Worker: Cached", asset);
            } else {
              console.warn(
                "Service Worker: Failed to cache (not found):",
                asset,
              );
            }
          } catch (error) {
            console.warn(
              "Service Worker: Failed to cache (error):",
              asset,
              error.message,
            );
            // Continue with other assets even if one fails
          }
        });

        await Promise.allSettled(cachePromises);
        console.log("Service Worker: Static assets caching completed");
      })
      .catch((error) => {
        console.error("Service Worker: Cache initialization failed:", error);
      }),
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE &&
            cacheName !== IMAGE_CACHE
          ) {
            console.log("Service Worker: Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );

  // Take control of all pages
  self.clients.claim();
});

// Fetch event - Implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with performance monitoring
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const startTime = performance.now();

  try {
    PERFORMANCE_METRICS.networkRequests++;

    let response;
    let strategy = "default";

    // Static assets - Cache first strategy
    if (isStaticAsset(pathname)) {
      response = await cacheFirst(request, STATIC_CACHE);
      strategy = "cache-first";
    }
    // Images - Cache first with image cache
    else if (isImage(pathname)) {
      response = await cacheFirst(request, IMAGE_CACHE);
      strategy = "cache-first-images";
    }
    // API routes - Network first strategy
    else if (isApiRoute(pathname)) {
      response = await networkFirst(request, API_CACHE);
      strategy = "network-first-api";
    }
    // Dynamic pages - Stale while revalidate
    else if (isDynamicPage(pathname)) {
      response = await staleWhileRevalidate(request, DYNAMIC_CACHE);
      strategy = "stale-while-revalidate";
    }
    // Default - Network first
    else {
      response = await networkFirst(request, DYNAMIC_CACHE);
      strategy = "network-first-default";
    }

    // Performance monitoring
    const duration = performance.now() - startTime;
    if (duration > PERFORMANCE_THRESHOLDS.SLOW_REQUEST) {
      console.warn("Service Worker: Slow request detected", {
        url: pathname,
        duration: Math.round(duration),
        strategy,
      });

      reportError("slow_request", {
        url: pathname,
        duration,
        strategy,
      });
    }

    return response;
  } catch (error) {
    PERFORMANCE_METRICS.errors++;
    console.error("Service Worker: Request failed:", pathname, error.message);

    // Report error for monitoring
    reportError("request_failed", {
      url: pathname,
      error: error.message,
      duration: performance.now() - startTime,
    });

    // Notify clients
    if (typeof self.clients !== "undefined") {
      self.clients
        .matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_ERROR",
              error: {
                message: error.message,
                url: request.url,
                timestamp: Date.now(),
              },
            });
          });
        })
        .catch(() => {
          // Silently fail if client messaging fails
        });
    }

    return await handleOffline(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      PERFORMANCE_METRICS.cacheHits++;

      // Check if cached response is still valid
      const cacheDate = cachedResponse.headers.get("date");
      if (cacheDate) {
        const age = Date.now() - new Date(cacheDate).getTime();
        // If cached for more than max age, try network first
        if (age > PERFORMANCE_THRESHOLDS.MAX_CACHE_AGE) {
          try {
            const networkResponse = await fetch(request, {
              signal: AbortSignal.timeout(5000), // 5 second timeout
            });
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone()).catch(() => {
                // Silently fail cache update
              });
              return networkResponse;
            }
          } catch (networkError) {
            // Network failed, return cached version
            console.log(
              "Service Worker: Network failed, using cache:",
              request.url,
            );
          }
        }
      }
      return cachedResponse;
    }

    PERFORMANCE_METRICS.cacheMisses++;

    const networkResponse = await fetch(request, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone()).catch(() => {
        // Silently fail cache update
      });
    }
    return networkResponse;
  } catch (error) {
    console.warn(
      "Service Worker: Cache first failed:",
      request.url,
      error.message,
    );
    return await handleOffline(request);
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);

    try {
      const networkResponse = await fetch(request, {
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone()).catch(() => {
          // Silently fail cache update
        });
      }
      return networkResponse;
    } catch (networkError) {
      console.log("Service Worker: Network failed, trying cache:", request.url);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw networkError;
    }
  } catch (error) {
    console.warn(
      "Service Worker: Network first failed:",
      request.url,
      error.message,
    );
    return await handleOffline(request);
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    // Always try to update cache in background
    const networkResponsePromise = fetch(request, {
      signal: AbortSignal.timeout(6000), // 6 second timeout
    })
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone()).catch(() => {
            // Silently fail cache update
          });
        }
        return networkResponse;
      })
      .catch((networkError) => {
        console.log("Service Worker: Background update failed:", request.url);
        // Network failed, but we might have cached version
        return null;
      });

    // Return cached version immediately if available
    if (cachedResponse) {
      // Don't await the network promise, let it update in background
      networkResponsePromise.catch(() => {
        // Silently handle background update failures
      });
      return cachedResponse;
    }

    // Otherwise wait for network
    const networkResponse = await networkResponsePromise;
    if (networkResponse) {
      return networkResponse;
    }

    throw new Error("No cached response and network failed");
  } catch (error) {
    console.warn(
      "Service Worker: Stale while revalidate failed:",
      request.url,
      error.message,
    );
    return await handleOffline(request);
  }
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url);

  // For HTML pages, return offline page
  if (request.headers.get("accept")?.includes("text/html")) {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match("/offline");
    if (offlinePage) {
      return offlinePage;
    }

    // Fallback offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>オフライン - samuido</title>
          <style>
            body {
              font-family: 'Noto Sans JP', sans-serif;
              background: #181818;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              text-align: center;
            }
            .offline-container {
              max-width: 400px;
              padding: 2rem;
            }
            h1 { color: #0000ff; margin-bottom: 1rem; }
            p { line-height: 1.6; margin-bottom: 1rem; }
            button {
              background: #0000ff;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <h1>オフライン</h1>
            <p>インターネット接続を確認してください。</p>
            <p>一部のツールはオフラインでも利用可能です。</p>
            <button onclick="window.location.reload()">再試行</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      },
    );
  }

  // For other resources, return a generic offline response
  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
  });
}

// Helper functions
function isStaticAsset(pathname) {
  return CACHE_STRATEGIES.static.some((pattern) =>
    pathname.startsWith(pattern),
  );
}

function isImage(pathname) {
  return /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(pathname);
}

function isApiRoute(pathname) {
  return CACHE_STRATEGIES.api.some((pattern) => pathname.startsWith(pattern));
}

function isDynamicPage(pathname) {
  return CACHE_STRATEGIES.dynamic.some((pattern) =>
    pathname.startsWith(pattern),
  );
}

// Background sync for analytics
self.addEventListener("sync", (event) => {
  if (event.tag === "analytics-sync") {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync offline analytics data when connection is restored
  console.log("Service Worker: Syncing analytics data");

  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();

    // Process any queued analytics requests
    for (const request of requests) {
      if (request.url.includes("/api/stats/")) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log("Analytics sync failed for:", request.url);
        }
      }
    }
  } catch (error) {
    console.error("Analytics sync error:", error);
  }
}

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/images/icons/icon-192x192.png",
      badge: "/images/icons/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey,
      },
      actions: [
        {
          action: "explore",
          title: "サイトを見る",
          icon: "/images/icons/checkmark.png",
        },
        {
          action: "close",
          title: "閉じる",
          icon: "/images/icons/xmark.png",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      }),
    );
  }
});

console.log("Service Worker: Loaded successfully");
