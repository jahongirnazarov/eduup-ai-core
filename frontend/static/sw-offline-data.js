// ========================================================================
// SERVICE WORKER FOR OFFLINE DATA CAPABILITY
// Caches JSON data files for zero server cost architecture
// ========================================================================

const CACHE_NAME = 'eduup-offline-data-v1';
const JSON_DATA_FILES = [
    '/data/lessons.json',
    '/data/quizzes.json', 
    '/data/user_tiers.json'
];

const STATIC_ASSETS = [
    '/',
    '/static/js/client-side-data-loader.js',
    '/templates/kiber_malika_classroom.html',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.0'
];

// Install event - cache JSON data files
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing offline data support...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching JSON data files');
                return cache.addAll(JSON_DATA_FILES);
            })
            .then(() => {
                console.log('[Service Worker] JSON data files cached successfully');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Failed to cache JSON data:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating offline data support...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached JSON data when offline
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Check if request is for JSON data files
    if (JSON_DATA_FILES.some(file => url.pathname === file)) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log('[Service Worker] Serving cached JSON data:', url.pathname);
                        return cachedResponse;
                    }
                    
                    // If not in cache, fetch from network and cache
                    return fetch(event.request)
                        .then((networkResponse) => {
                            if (!networkResponse || networkResponse.status !== 200) {
                                return networkResponse;
                            }
                            
                            // Clone the response before caching
                            const responseToCache = networkResponse.clone();
                            
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('[Service Worker] Caching new JSON data:', url.pathname);
                                    cache.put(event.request, responseToCache);
                                });
                            
                            return networkResponse;
                        })
                        .catch((error) => {
                            console.error('[Service Worker] JSON data fetch failed:', error);
                            // Return a basic error response
                            return new Response(
                                JSON.stringify({ error: 'Offline - JSON data not available' }),
                                { 
                                    status: 503,
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                })
        );
        return;
    }
    
    // For other requests, use network-first strategy
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Background sync for updating JSON data
self.addEventListener('sync', (event) => {
    if (event.tag === 'update-json-data') {
        event.waitUntil(updateJSONData());
    }
});

async function updateJSONData() {
    console.log('[Service Worker] Updating JSON data in background...');
    
    try {
        const cache = await caches.open(CACHE_NAME);
        
        for (const file of JSON_DATA_FILES) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    await cache.put(file, response);
                    console.log('[Service Worker] Updated:', file);
                }
            } catch (error) {
                console.error('[Service Worker] Failed to update:', file, error);
            }
        }
        
        console.log('[Service Worker] JSON data update complete');
    } catch (error) {
        console.error('[Service Worker] Background sync failed:', error);
    }
}

// Push notification for data updates (optional)
self.addEventListener('push', (event) => {
    const options = {
        body: 'Yangi darslar qo\'shildi!',
        icon: '/static/assets/icon-192.png',
        badge: '/static/assets/icon-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('EduUp AI', options)
    );
});
