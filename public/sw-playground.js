/**
 * Service Worker for Playground Caching
 * Advanced caching strategies for playground assets
 * Task 3.3: キャッシュ戦略の拡張 - CDN活用による静的ファイル配信最適化
 */

const CACHE_NAME = "playground-cache-v1";
const STATIC_CACHE = "playground-static-v1";
const DYNAMIC_CACHE = "playground-dynamic-v1";

// Assets to cache immediately
const STATIC_ASSETS = [
  "/portfolio/playground/design",
  "/portfolio/playground/WebGL",
  "/_next/static/css/",
  "/_next/static/js/",
];

// Cache strategies by URL pattern
const CACHE_STRATEGIES = {
  // Static assets - Cache First
  static: /\/_next\/static\//,

  // Experiment data - Network First with fallback
  experiments: /\/api\/playground\/experiments/,

  // Shader code - Stale While Revalidate
  shaders: /\/api\/playground\/shaders/,

  // Performance metrics - Network Only
  performance: /\/api\/playground\/performance/,

  // Textures and assets - Cache First
  textures: /\.(jpg|jpeg|png|webp|svg|woff2|woff)$/,
};

// Cache TTL settings (in milliseconds)
const CACHE_TTL = {
  static: 365 * 24 * 60 * 60 * 1000, // 1 year
  experiments: 6 * 60 * 60 * 1000, // 6 hours
  shaders: 24 * 60 * 60 * 1000, // 24 hours
  textures: 12 * 60 * 60 * 1000, // 12 hours
  performance: 5 * 60 * 1000, // 5 minutes
};

/**
 * Install event - Cache static assets
 */
self.addEventListener("install", (event) => {
  console.log("Playground Service Worker installing...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static playground assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("Playground Service Worker installed");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Failed to cache static assets:", error);
      }),
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener("activate", (event) => {
  console.log("Playground Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE
            ) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("Playground Service Worker activated");
        return self.clients.claim();
      }),
  );
});

/**
 * Fetch event - Handle requests with appropriate caching strategy
 */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") {
    return;
  }

  // Determine cache strategy
  let strategy = "networkFirst"; // Default strategy

  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    strategy = "cacheFirst";
  } else if (CACHE_STRATEGIES.experiments.test(url.pathname)) {
    strategy = "networkFirst";
  } else if (CACHE_STRATEGIES.shaders.test(url.pathname)) {
    strategy = "staleWhileRevalidate";
  } else if (CACHE_STRATEGIES.performance.test(url.pathname)) {
    strategy = "networkOnly";
  } else if (CACHE_STRATEGIES.textures.test(url.pathname)) {
    strategy = "cacheFirst";
  }

  // Apply the determined strategy
  switch (strategy) {
    case "cacheFirst":
      event.respondWith(cacheFirst(request));
      break;
    case "networkFirst":
      event.respondWith(networkFirst(request));
      break;
    case "staleWhileRevalidate":
      event.respondWith(staleWhileRevalidate(request));
      break;
    case "networkOnly":
      event.respondWith(networkOnly(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

/**
 * Cache First Strategy
 * Good for static assets that rarely change
 */
async function cacheFirst(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      await cache.put(request, addTimestamp(responseToCache));
    }

    return networkResponse;
  } catch (error) {
    console.error("Cache First strategy failed:", error);

    // Fallback to cache even if expired
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response("Offline - Asset not available", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

/**
 * Network First Strategy
 * Good for dynamic content that changes frequently
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      const responseToCache = networkResponse.clone();
      await cache.put(request, addTimestamp(responseToCache));
    }

    return networkResponse;
  } catch (error) {
    console.error("Network request failed, trying cache:", error);

    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response(
      JSON.stringify({
        error: "Offline - Data not available",
        cached: false,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Stale While Revalidate Strategy
 * Good for content that can be served stale while updating in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseToCache = networkResponse.clone();
        cache.put(request, addTimestamp(responseToCache));
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error("Background fetch failed:", error);
    });

  // Return cached response immediately if available
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse;
  }

  // Wait for network response if no cache or expired
  return networkResponsePromise;
}

/**
 * Network Only Strategy
 * For real-time data that should never be cached
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error("Network Only request failed:", error);
    return new Response(
      JSON.stringify({
        error: "Network unavailable",
        timestamp: Date.now(),
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

/**
 * Add timestamp to response for TTL tracking
 */
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set("sw-cached-at", Date.now().toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });
}

/**
 * Check if cached response is expired
 */
function isExpired(response) {
  const cachedAt = response.headers.get("sw-cached-at");
  if (!cachedAt) return false;

  const age = Date.now() - parseInt(cachedAt);
  const url = new URL(response.url);

  // Determine TTL based on URL pattern
  let ttl = CACHE_TTL.experiments; // Default

  if (CACHE_STRATEGIES.static.test(url.pathname)) {
    ttl = CACHE_TTL.static;
  } else if (CACHE_STRATEGIES.shaders.test(url.pathname)) {
    ttl = CACHE_TTL.shaders;
  } else if (CACHE_STRATEGIES.textures.test(url.pathname)) {
    ttl = CACHE_TTL.textures;
  } else if (CACHE_STRATEGIES.performance.test(url.pathname)) {
    ttl = CACHE_TTL.performance;
  }

  return age > ttl;
}

/**
 * Message handler for cache management
 */
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "CLEAR_CACHE":
      clearCache(payload.cacheName)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;

    case "GET_CACHE_STATS":
      getCacheStats()
        .then((stats) => {
          event.ports[0].postMessage({ success: true, stats });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;

    case "PRELOAD_ASSETS":
      preloadAssets(payload.urls)
        .then(() => {
          event.ports[0].postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0].postMessage({ success: false, error: error.message });
        });
      break;
  }
});

/**
 * Clear specific cache
 */
async function clearCache(cacheName) {
  if (cacheName) {
    return caches.delete(cacheName);
  } else {
    const cacheNames = await caches.keys();
    return Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
}

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    stats[cacheName] = {
      entryCount: keys.length,
      urls: keys.map((request) => request.url),
    };
  }

  return stats;
}

/**
 * Preload assets into cache
 */
async function preloadAssets(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);

  const preloadPromises = urls.map(async (url) => {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, addTimestamp(response));
      }
    } catch (error) {
      console.warn(`Failed to preload ${url}:`, error);
    }
  });

  return Promise.all(preloadPromises);
}

/**
 * Periodic cache cleanup
 */
setInterval(
  async () => {
    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
          const response = await cache.match(request);
          if (response && isExpired(response)) {
            await cache.delete(request);
            console.log("Expired cache entry removed:", request.url);
          }
        }
      }
    } catch (error) {
      console.error("Cache cleanup failed:", error);
    }
  },
  10 * 60 * 1000,
); // Run every 10 minutes
