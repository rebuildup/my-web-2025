/**
 * Service Worker for samuido website
 * Implements caching strategies and offline functionality
 */

const CACHE_NAME = "samuido-v1";
const STATIC_CACHE = "samuido-static-v1";
const DYNAMIC_CACHE = "samuido-dynamic-v1";
const IMAGE_CACHE = "samuido-images-v1";

// Resources to cache immediately (only essential and guaranteed to exist)
const STATIC_ASSETS = [
  "/",
  "/about",
  "/portfolio",
  "/workshop",
  "/tools",
  "/search",
  "/privacy-policy",
  "/offline",
  "/images/og-image.jpg",
  "/favicon.ico",
  "/manifest.json",
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - Cache first
  static: ["/_next/static/", "/images/", "/videos/", "/fonts/", "/favicons/"],
  // API routes - Network first with fallback
  api: ["/api/content/", "/api/stats/"],
  // Dynamic content - Stale while revalidate
  dynamic: ["/portfolio/", "/workshop/", "/tools/", "/about/"],
};

// Install event - Cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches.open(STATIC_CACHE).then(async (cache) => {
      console.log("Service Worker: Caching static assets");

      // Cache assets individually to handle failures gracefully
      const cachePromises = STATIC_ASSETS.map(async (asset) => {
        try {
          const response = await fetch(asset);
          if (response.ok) {
            await cache.put(asset, response);
            console.log("Service Worker: Cached", asset);
          } else {
            console.warn("Service Worker: Failed to cache (not found):", asset);
          }
        } catch (error) {
          console.warn(
            "Service Worker: Failed to cache (error):",
            asset,
            error.message,
          );
        }
      });

      await Promise.allSettled(cachePromises);
      console.log("Service Worker: Static assets caching completed");
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

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Static assets - Cache first strategy
    if (isStaticAsset(pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }

    // Images - Cache first with image cache
    if (isImage(pathname)) {
      return await cacheFirst(request, IMAGE_CACHE);
    }

    // API routes - Network first strategy
    if (isApiRoute(pathname)) {
      return await networkFirst(request, DYNAMIC_CACHE);
    }

    // Dynamic pages - Stale while revalidate
    if (isDynamicPage(pathname)) {
      return await staleWhileRevalidate(request, DYNAMIC_CACHE);
    }

    // Default - Network first
    return await networkFirst(request, DYNAMIC_CACHE);
  } catch (error) {
    console.error("Service Worker: Request failed:", error);
    return await handleOffline(request);
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return await handleOffline(request);
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return await handleOffline(request);
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Always try to update cache in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, but we might have cached version
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // Otherwise wait for network
  try {
    return await networkResponsePromise;
  } catch (error) {
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
              background: #222222;
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
