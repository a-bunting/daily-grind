/* eslint-env serviceworker */
/* global self, caches, clients */
/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'daily-grind-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache installation failed:', error);
        // Don't fail the installation if caching fails
        return Promise.resolve();
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim control of all clients
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          return response || fetch(event.request);
        })
        .catch(() => {
          // Return a basic offline page if we can't serve the main app
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head>
                <title>Daily Grind - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    text-align: center; 
                    padding: 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                  }
                  .offline-icon { font-size: 64px; margin-bottom: 20px; }
                  h1 { margin-bottom: 10px; }
                  p { opacity: 0.8; max-width: 400px; line-height: 1.6; }
                  .retry-btn {
                    background: rgba(255,255,255,0.2);
                    border: 2px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 20px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                  }
                  .retry-btn:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                  }
                </style>
              </head>
              <body>
                <div class="offline-icon">📱</div>
                <h1>Daily Grind</h1>
                <p>You're currently offline, but your data is safely stored locally. Connect to the internet and refresh to sync your latest changes.</p>
                <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
              </body>
            </html>`,
            {
              headers: { 'Content-Type': 'text/html' }
            }
          );
        })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // For failed requests, return a generic offline response for important assets
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // You could implement background sync logic here
      // For example, sync any pending data changes
      console.log('Background sync triggered')
    );
  }
});

// Handle push notifications (if you want to add them later)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('Daily Grind', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});