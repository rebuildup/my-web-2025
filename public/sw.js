// Service Worker for My Web 2025 PWA
const CACHE_NAME = 'my-web-2025-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/portfolio',
  '/tools',
  '/workshop',
  '/contact',
  '/about',
  '/offline.html',
  '/manifest.json',
  '/favicons/favicon.ico',
  '/favicons/favicon.png',
  '/favicons/favicon.svg'
];

// Assets to cache dynamically
const DYNAMIC_ASSETS = [
  '/api/content/portfolio',
  '/api/content/blog',
  '/api/content/plugin',
  '/api/content/tool'
];

// Network-first strategy for these patterns
const NETWORK_FIRST_PATTERNS = [
  /^\/api\//,
  /^\/admin\//,
  /\.json$/
];

// Cache-first strategy for these patterns
const CACHE_FIRST_PATTERNS = [
  /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico)$/,
  /^\/favicons\//,
  /^\/public\//
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Install failed', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('Service Worker: Activation failed', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Handle different caching strategies
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    // Network-first strategy for API and admin routes
    event.respondWith(networkFirst(request));
  } else if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirst(request));
  } else {
    // Stale-while-revalidate for pages
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Cache and network failed:', error);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Network request failed:', error);
    if (request.mode === 'navigate' && !cachedResponse) {
      return caches.match('/offline.html');
    }
    throw error;
  });
  
  return cachedResponse || fetchPromise;
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForms());
  }
});

async function syncContactForms() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingForms = await getPendingForms();
    
    for (const form of pendingForms) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.data),
        });
        
        if (response.ok) {
          await removePendingForm(form.id);
          console.log('Form synced successfully:', form.id);
        }
      } catch (error) {
        console.error('Failed to sync form:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicons/favicon.png',
    badge: '/favicons/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Website',
        icon: '/favicons/favicon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicons/favicon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('My Web 2025', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for content updates
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag);
  
  if (event.tag === 'content-update') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    // Update cached content
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const asset of DYNAMIC_ASSETS) {
      try {
        const response = await fetch(asset);
        if (response.ok) {
          await cache.put(asset, response);
          console.log('Updated cache for:', asset);
        }
      } catch (error) {
        console.error('Failed to update:', asset, error);
      }
    }
  } catch (error) {
    console.error('Content update failed:', error);
  }
}

// Utility functions for IndexedDB operations
async function getPendingForms() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingForm(id) {
  // Implementation would depend on your IndexedDB setup
  console.log('Remove pending form:', id);
}

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled promise rejection:', event);
});