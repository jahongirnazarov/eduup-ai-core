/**
 * Cross-Device State Synchronization
 * Enables users to continue from where they left off on any device
 * 
 * Architecture:
 * - Local state stored in IndexedDB (client-side)
 * - Minimal sync with server (only progress, preferences)
 * - Conflict resolution using timestamp-based merging
 * - Offline-first with background sync
 * 
 * Server cost: Near-zero for 1B users (only metadata sync)
 * Storage: Client-side (no server storage cost)
 * Bandwidth: Minimal (only progress data, ~1KB per sync)
 */

class CrossDeviceSync {
    constructor() {
        this.dbName = 'EduUpStateDB';
        this.dbVersion = 1;
        this.db = null;
        this.syncInterval = 60000; // Sync every 60 seconds
        this.syncTimer = null;
        this.userId = null;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
    }

    /**
     * Initialize IndexedDB and sync system
     */
    async init(userId) {
        this.userId = userId;
        
        // Initialize IndexedDB
        await this.initDB();
        
        // Setup online/offline listeners
        this.setupNetworkListeners();
        
        // Start periodic sync
        this.startSync();
        
        // Initial sync
        await this.syncWithServer();
        
        console.log('🔄 Cross-device sync initialized');
    }

    /**
     * Initialize IndexedDB for local state storage
     */
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Store for user progress
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
                    progressStore.createIndex('userId', 'userId', { unique: false });
                    progressStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store for user preferences
                if (!db.objectStoreNames.contains('preferences')) {
                    const prefsStore = db.createObjectStore('preferences', { keyPath: 'userId' });
                }
                
                // Store for cached content
                if (!db.objectStoreNames.contains('cache')) {
                    const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                // Store for sync queue
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
                    syncStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    /**
     * Setup network status listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Online - syncing pending changes');
            this.syncWithServer();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Offline - changes will sync when online');
        });
    }

    /**
     * Save progress locally and queue for sync
     */
    async saveProgress(progressData) {
        const timestamp = Date.now();
        
        // Save to IndexedDB
        await this.dbOperation('progress', 'readwrite', (store) => {
            const data = {
                id: `${this.userId}_${progressData.lessonId}`,
                userId: this.userId,
                lessonId: progressData.lessonId,
                currentSection: progressData.currentSection || 0,
                completedSections: progressData.completedSections || [],
                score: progressData.score || null,
                completedAt: progressData.completedAt || null,
                timestamp: timestamp
            };
            store.put(data);
        });
        
        // Queue for sync
        await this.queueSync({
            type: 'progress',
            data: data,
            timestamp: timestamp
        });
        
        console.log('💾 Progress saved locally');
    }

    /**
     * Get progress for a lesson
     */
    async getProgress(lessonId) {
        return await this.dbOperation('progress', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(`${this.userId}_${lessonId}`);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Get all progress for user
     */
    async getAllProgress() {
        return await this.dbOperation('progress', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const index = store.index('userId');
                const request = index.getAll(this.userId);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Save user preferences
     */
    async savePreferences(preferences) {
        await this.dbOperation('preferences', 'readwrite', (store) => {
            const data = {
                userId: this.userId,
                preferences: preferences,
                timestamp: Date.now()
            };
            store.put(data);
        });
        
        await this.queueSync({
            type: 'preferences',
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Get user preferences
     */
    async getPreferences() {
        return await this.dbOperation('preferences', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(this.userId);
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.preferences : {});
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Cache generated content locally
     */
    async cacheContent(key, content) {
        await this.dbOperation('cache', 'readwrite', (store) => {
            store.put({
                key: key,
                content: content,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Get cached content
     */
    async getCachedContent(key) {
        return await this.dbOperation('cache', 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => {
                    const result = request.result;
                    resolve(result ? result.content : null);
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Queue item for sync
     */
    async queueSync(item) {
        await this.dbOperation('syncQueue', 'readwrite', (store) => {
            store.put({
                id: `${item.type}_${item.timestamp}`,
                ...item
            });
        });
        
        // Trigger sync if online
        if (this.isOnline) {
            this.syncWithServer();
        }
    }

    /**
     * Sync with server
     */
    async syncWithServer() {
        if (!this.isOnline) {
            console.log('⏸️ Offline - sync deferred');
            return;
        }
        
        console.log('🔄 Syncing with server...');
        
        try {
            // Get pending sync items
            const pendingItems = await this.dbOperation('syncQueue', 'readonly', (store) => {
                return new Promise((resolve, reject) => {
                    const request = store.getAll();
                    request.onsuccess = () => resolve(request.result);
                    request.onerror = () => reject(request.error);
                });
            });
            
            // Sync each item
            for (const item of pendingItems) {
                await this.syncItem(item);
            }
            
            // Clear synced items
            await this.dbOperation('syncQueue', 'readwrite', (store) => {
                pendingItems.forEach(item => store.delete(item.id));
            });
            
            // Fetch server updates
            await this.fetchServerUpdates();
            
            console.log('✅ Sync completed');
        } catch (error) {
            console.error('❌ Sync failed:', error);
        }
    }

    /**
     * Sync individual item with server
     */
    async syncItem(item) {
        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    type: item.type,
                    data: item.data,
                    timestamp: item.timestamp
                })
            });
            
            if (response.ok) {
                console.log(`✅ Synced ${item.type}`);
            }
        } catch (error) {
            console.error(`❌ Failed to sync ${item.type}:`, error);
        }
    }

    /**
     * Fetch updates from server
     */
    async fetchServerUpdates() {
        try {
            const lastSync = await this.getLastSyncTimestamp();
            
            const response = await fetch(`/api/sync/${this.userId}?since=${lastSync}`);
            if (response.ok) {
                const updates = await response.json();
                
                // Merge server updates with local state
                for (const update of updates) {
                    await this.mergeUpdate(update);
                }
                
                // Update last sync timestamp
                await this.setLastSyncTimestamp(Date.now());
            }
        } catch (error) {
            console.error('❌ Failed to fetch server updates:', error);
        }
    }

    /**
     * Merge server update with local state
     * Uses timestamp-based conflict resolution
     */
    async mergeUpdate(update) {
        const localData = await this.getLocalData(update.type, update.id);
        
        if (!localData || update.timestamp > localData.timestamp) {
            // Server data is newer or no local data exists
            await this.saveLocalData(update.type, update.data);
            console.log(`📥 Merged ${update.type} from server`);
        } else {
            // Local data is newer - push to server
            await this.syncItem({
                type: update.type,
                data: localData,
                timestamp: localData.timestamp
            });
        }
    }

    /**
     * Get local data
     */
    async getLocalData(type, id) {
        const storeName = type === 'progress' ? 'progress' : 'preferences';
        return await this.dbOperation(storeName, 'readonly', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.get(id);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Save local data
     */
    async saveLocalData(type, data) {
        const storeName = type === 'progress' ? 'progress' : 'preferences';
        await this.dbOperation(storeName, 'readwrite', (store) => {
            store.put(data);
        });
    }

    /**
     * Get last sync timestamp
     */
    async getLastSyncTimestamp() {
        const prefs = await this.getPreferences();
        return prefs.lastSyncTimestamp || 0;
    }

    /**
     * Set last sync timestamp
     */
    async setLastSyncTimestamp(timestamp) {
        const prefs = await this.getPreferences();
        prefs.lastSyncTimestamp = timestamp;
        await this.savePreferences(prefs);
    }

    /**
     * Start periodic sync
     */
    startSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            this.syncWithServer();
        }, this.syncInterval);
    }

    /**
     * Stop periodic sync
     */
    stopSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
    }

    /**
     * Generic IndexedDB operation
     */
    async dbOperation(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            
            try {
                const result = operation(store);
                transaction.oncomplete = () => resolve(result);
                transaction.onerror = () => reject(transaction.error);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Clear all local data
     */
    async clearAllData() {
        const stores = ['progress', 'preferences', 'cache', 'syncQueue'];
        
        for (const storeName of stores) {
            await this.dbOperation(storeName, 'readwrite', (store) => {
                store.clear();
            });
        }
        
        console.log('🗑️ All local data cleared');
    }

    /**
     * Get storage statistics
     */
    async getStorageStats() {
        const progress = await this.getAllProgress();
        const prefs = await this.getPreferences();
        
        return {
            progressItems: progress.length,
            preferences: Object.keys(prefs).length,
            userId: this.userId,
            isOnline: this.isOnline,
            lastSync: await this.getLastSyncTimestamp()
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossDeviceSync;
} else {
    window.CrossDeviceSync = CrossDeviceSync;
}
