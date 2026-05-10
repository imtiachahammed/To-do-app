// =============================================
//   AuraithX Task OS — Service Worker v2.1
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
  console.log('[AuraithX SW] Installing v2.1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ACTIVATE — delete old caches
self.addEventListener('activate', event => {
  console.log('[AuraithX SW] Activating v2.1...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
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

// NOTIFICATION CLICK
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing app window
      for (const client of clientList) {
        const url = client.url || '';
        if (url.includes('/To-do-app/') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open the app
      return clients.openWindow('/To-do-app/index.html');
    })
  );
});

// ALLOW PAGE TO TRIGGER NOTIFICATIONS (RELIABLE ON ANDROID PWA)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, options, tag } = event.data;
    self.registration.showNotification(title, {
      tag,
      icon: './To%20do%20list/Icon/launchericon-192x192.png',
      badge: './To%20do%20list/Icon/launchericon-192x192.png',
      ...options
    });
  }
});
