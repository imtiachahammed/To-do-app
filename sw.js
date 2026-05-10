// =============================================
//   AuraithX Task OS — Service Worker v2.0
// =============================================

const CACHE_NAME = 'auraithx-todo-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './intro.js',
  './manifest.json',
  './To%20do%20list/Icon/launchericon-192x192.png',
  './To%20do%20list/Icon/launchericon-512x512.png'
];

// INSTALL
self.addEventListener('install', event => {
  console.log('[AuraithX SW] Installing v2...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[AuraithX SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE — delete old caches
self.addEventListener('activate', event => {
  console.log('[AuraithX SW] Activating v2...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[AuraithX SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      });
    }).catch(() => {
      if (event.request.destination === 'document') return caches.match('./index.html');
    })
  );
});
