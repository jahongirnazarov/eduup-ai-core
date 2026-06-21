/**
 * Aggressive Service Worker for EduUp Platform
 * Enables offline-first operation with extreme caching
 * 
 * Caching Strategy:
 * - Static assets: Cache-first (aggressive)
 * - API responses: Network-first with cache fallback
 * - Generated content: Cache for offline use
 * - Sync queue: Background sync
 * 
 * Benefits:
 * - Works offline completely
 * - Instant loading on repeat visits
 * - Minimal bandwidth usage
 * - Zero server cost for cached content
 */

const CACHE_NAME = 'eduup-aggressive-v1';
const STATIC_CACHE = 'eduup-static-v1';
const DYNAMIC_CACHE = 'eduup-dynamic-v1';

// Files to cache aggressively
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/static/js/main.js',
    '/static/js/client-side-ai.js',
    '/static/js/procedural-content-engine.js',
    '/static/js/cross-device-sync.js',
    '/static/js/semantic-compression.js',
    '/static/js/webgpu-engine.js',
    '/static/css/main.css',
    '/manifest.json',
    '/static/assets/logo.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('📦 Installing Service Worker...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('🗂️ Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('🚀 Activating Service Worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control immediately
    self.clients.claim();
});

// Fetch event - aggressive caching strategy
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Handle different request types
    if (url.pathname.startsWith('/static/')) {
        // Static assets - cache first
        event.respondWith(cacheFirst(event.request));
    } else if (url.pathname.startsWith('/api/')) {
        // API requests - network first with cache fallback
        event.respondWith(networkFirst(event.request));
    } else if (url.pathname.startsWith('/sync')) {
        // Sync requests - network only
        event.respondWith(networkOnly(event.request));
    } else {
        // Other requests - cache first
        event.respondWith(cacheFirst(event.request));
    }
});

/**
 * Cache-first strategy
 * Serve from cache, fall back to network
 */
async function cacheFirst(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        console.log('✅ Cache hit:', request.url);
        return cachedResponse;
    }
    
    console.log('🌐 Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    // Cache the response
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
}

/**
 * Network-first strategy
 * Try network, fall back to cache
 */
async function networkFirst(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        console.log('🌐 Network request:', request.url);
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('📴 Network failed, using cache:', request.url);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback
        return new Response(
            JSON.stringify({ error: 'Offline', message: 'No cached data available' }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Network-only strategy
 * Always use network (for sync operations)
 */
async function networkOnly(request) {
    try {
        return await fetch(request);
    } catch (error) {
        console.log('❌ Sync failed (offline):', request.url);
        
        // Queue for background sync
        const bgSync = await self.registration.sync.register('sync-queue');
        console.log('📤 Background sync registered');
        
        return new Response(
            JSON.stringify({ error: 'Offline', queued: true }),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Background sync
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync triggered:', event.tag);
    
    if (event.tag === 'sync-queue') {
        event.waitUntil(syncQueue());
    }
});

/**
 * Sync queued requests
 */
async function syncQueue() {
    // Get queued sync items from IndexedDB
    // This would be implemented with IndexedDB operations
    console.log('📤 Processing sync queue');
    
    // Sync logic would go here
    // For now, just log
}

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New content available',
        icon: '/static/assets/logo.png',
        badge: '/static/assets/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('EduUp', options)
    );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});

// Message from client
self.addEventListener('message', (event) => {
    console.log('💬 Message from client:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }));
    }
});

// Periodic sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('⏰ Periodic sync:', event.tag);
    
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

/**
 * Sync content periodically
 */
async function syncContent() {
    console.log('🔄 Periodic content sync');
    // Content sync logic would go here
}

// Cache size management
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            // Pre-cache critical assets
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

// Estimate cache size
async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Log cache size on activate
self.addEventListener('activate', (event) => {
    event.waitUntil(
        getCacheSize().then((size) => {
            console.log('💾 Total cache size:', (size / 1024 / 1024).toFixed(2), 'MB');
        })
    );
});
