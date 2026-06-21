/**
 * Service Worker for EduUp AI
 * Offline capability, caching, and background sync
 */

const CACHE_NAME = 'eduup-ai-v1';
const OFFLINE_CACHE = 'eduup-offline-v1';

// Assets to cache for offline use
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/static/js/client-side-ai.js',
    '/static/css/style.css',
    '/static/manifest.json',
    '/static/assets/icon-192.png',
    '/static/assets/icon-512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching app shell and content');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔄 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Cache hit - return cached response
                if (cachedResponse) {
                    console.log('✅ Cache hit:', event.request.url);
                    return cachedResponse;
                }

                // Cache miss - fetch from network
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone response
                        const responseToCache = networkResponse.clone();

                        // Cache the fetched response
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('💾 Caching:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('❌ Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline.html');
                        }
                        
                        // Return cached response if available
                        return caches.match(event.request);
                    });
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-lessons') {
        event.waitUntil(syncLessons());
    } else if (event.tag === 'sync-exams') {
        event.waitUntil(syncExams());
    }
});

// Push notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Yangi xabar',
        icon: '/static/assets/icon-192.png',
        badge: '/static/assets/icon-96.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };
    
    event.waitUntil(
        self.registration.showNotification('EduUp AI', options)
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

// Sync lessons
async function syncLessons() {
    try {
        // Get offline lessons from IndexedDB
        const offlineLessons = await getOfflineLessons();
        
        // Sync with server
        for (const lesson of offlineLessons) {
            await syncLessonWithServer(lesson);
        }
        
        console.log('✅ Lessons synced successfully');
    } catch (error) {
        console.error('❌ Lesson sync failed:', error);
    }
}

// Sync exams
async function syncExams() {
    try {
        // Get offline exams from IndexedDB
        const offlineExams = await getOfflineExams();
        
        // Sync with server
        for (const exam of offlineExams) {
            await syncExamWithServer(exam);
        }
        
        console.log('✅ Exams synced successfully');
    } catch (error) {
        console.error('❌ Exam sync failed:', error);
    }
}

// Get offline lessons from IndexedDB
async function getOfflineLessons() {
    // Implementation depends on IndexedDB setup
    return [];
}

// Get offline exams from IndexedDB
async function getOfflineExams() {
    // Implementation depends on IndexedDB setup
    return [];
}

// Sync lesson with server
async function syncLessonWithServer(lesson) {
    try {
        const response = await fetch('/api/v1/lessons/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lesson)
        });
        
        if (response.ok) {
            // Remove from offline storage
            await removeFromOfflineStorage('lessons', lesson.id);
        }
    } catch (error) {
        console.error('Failed to sync lesson:', error);
    }
}

// Sync exam with server
async function syncExamWithServer(exam) {
    try {
        const response = await fetch('/api/v1/exams/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exam)
        });
        
        if (response.ok) {
            // Remove from offline storage
            await removeFromOfflineStorage('exams', exam.id);
        }
    } catch (error) {
        console.error('Failed to sync exam:', error);
    }
}

// Remove from offline storage
async function removeFromOfflineStorage(type, id) {
    // Implementation depends on IndexedDB setup
}

// Message handler
self.addEventListener('message', (event) => {
    console.log('📨 Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Periodic sync check (every 30 minutes)
setInterval(() => {
    if (navigator.onLine) {
        console.log('🔄 Periodic sync check');
        syncLessons();
        syncExams();
    }
}, 30 * 60 * 1000);
