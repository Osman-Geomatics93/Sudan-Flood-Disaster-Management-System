const CACHE_NAME = 'sudanflood-v1';
const PRECACHE_URLS = ['/', '/dashboard', '/manifest.json'];

// Install - precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignore precache failures for dynamic routes
      });
    }),
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

// Fetch - NetworkFirst for API, CacheFirst for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip SSE and auth endpoints
  if (url.pathname.startsWith('/api/sse') || url.pathname.startsWith('/api/auth')) return;

  // API calls - Network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
    return;
  }

  // Static assets - Cache first, fall back to network
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
        );
      }),
    );
    return;
  }

  // Pages - Network first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Handle offline mutation queue messages from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
