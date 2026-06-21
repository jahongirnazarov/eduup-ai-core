// ========================================================================
// CLIENT-SIDE DATA LOADER - Zero Server Cost Architecture
// Loads all data from JSON files instead of API calls
// ========================================================================

class ClientSideDataLoader {
    constructor() {
        this.cache = {};
        this.baseURL = '/data';
    }

    async loadJSON(filename) {
        // Check cache first
        if (this.cache[filename]) {
            return this.cache[filename];
        }

        try {
            const response = await fetch(`${this.baseURL}/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            const data = await response.json();
            
            // Cache the data
            this.cache[filename] = data;
            
            // Store in IndexedDB for offline access
            this.storeInIndexedDB(filename, data);
            
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            
            // Try to load from IndexedDB if network fails
            return this.loadFromIndexedDB(filename);
        }
    }

    async loadLessons() {
        return await this.loadJSON('lessons.json');
    }

    async loadQuizzes() {
        return await this.loadJSON('quizzes.json');
    }

    async loadUserTiers() {
        return await this.loadJSON('user_tiers.json');
    }

    async getSubject(subjectId) {
        const lessons = await this.loadLessons();
        return lessons.subjects[subjectId] || null;
    }

    async getLesson(subjectId, lessonId) {
        const subject = await this.getSubject(subjectId);
        if (!subject) return null;
        
        return subject.lessons.find(lesson => lesson.id === lessonId) || null;
    }

    async getExam(examId) {
        const quizzes = await this.loadQuizzes();
        return quizzes.exams[examId] || null;
    }

    async getUserTier(tierId) {
        const tiers = await this.loadUserTiers();
        return tiers.tiers[tierId] || null;
    }

    // IndexedDB for offline storage
    async storeInIndexedDB(key, data) {
        try {
            const request = indexedDB.open('EduUpOfflineData', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('json_data')) {
                    db.createObjectStore('json_data', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['json_data'], 'readwrite');
                const store = transaction.objectStore('json_data');
                store.put({ key: key, data: data, timestamp: Date.now() });
            };
        } catch (error) {
            console.error('IndexedDB storage failed:', error);
        }
    }

    async loadFromIndexedDB(key) {
        try {
            const request = indexedDB.open('EduUpOfflineData', 1);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(['json_data'], 'readonly');
                    const store = transaction.objectStore('json_data');
                    const getRequest = store.get(key);
                    
                    getRequest.onsuccess = () => {
                        if (getRequest.result) {
                            resolve(getRequest.result.data);
                        } else {
                            reject(new Error('Data not found in IndexedDB'));
                        }
                    };
                    
                    getRequest.onerror = () => {
                        reject(new Error('IndexedDB read failed'));
                    };
                };

                request.onerror = () => {
                    reject(new Error('IndexedDB open failed'));
                };
            });
        } catch (error) {
            console.error('IndexedDB load failed:', error);
            return null;
        }
    }

    clearCache() {
        this.cache = {};
    }

    async preloadAllData() {
        try {
            await Promise.all([
                this.loadLessons(),
                this.loadQuizzes(),
                this.loadUserTiers()
            ]);
            console.log('All data preloaded successfully');
            return true;
        } catch (error) {
            console.error('Data preloading failed:', error);
            return false;
        }
    }
}

// Global instance
const dataLoader = new ClientSideDataLoader();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClientSideDataLoader;
}
