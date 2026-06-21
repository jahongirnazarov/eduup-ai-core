/**
 * 💾 INDEXEDDB SERVICE - Zero-Cost Database for Free Users
 * Stores 98M free users' data locally in browser
 * No server costs, completely offline-capable
 */

class IndexedDBService {
    constructor() {
        this.dbName = 'EduUpAI_FreeUsers';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
        
        // Store names
        this.stores = {
            users: 'users',
            lessons: 'lessons',
            exams: 'exams',
            progress: 'progress',
            errors: 'errors',
            settings: 'settings'
        };
    }

    /**
     * Initialize IndexedDB
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('[IndexedDB] Failed to open database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('[IndexedDB] Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create users store
                if (!db.objectStoreNames.contains(this.stores.users)) {
                    const userStore = db.createObjectStore(this.stores.users, { keyPath: 'userId' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('tier', 'tier', { unique: false });
                    userStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Create lessons store
                if (!db.objectStoreNames.contains(this.stores.lessons)) {
                    const lessonStore = db.createObjectStore(this.stores.lessons, { keyPath: 'lessonId' });
                    lessonStore.createIndex('userId', 'userId', { unique: false });
                    lessonStore.createIndex('subject', 'subject', { unique: false });
                    lessonStore.createIndex('completed', 'completed', { unique: false });
                }

                // Create exams store
                if (!db.objectStoreNames.contains(this.stores.exams)) {
                    const examStore = db.createObjectStore(this.stores.exams, { keyPath: 'examId' });
                    examStore.createIndex('userId', 'userId', { unique: false });
                    examStore.createIndex('examType', 'examType', { unique: false });
                    examStore.createIndex('score', 'score', { unique: false });
                }

                // Create progress store
                if (!db.objectStoreNames.contains(this.stores.progress)) {
                    const progressStore = db.createObjectStore(this.stores.progress, { keyPath: 'progressId' });
                    progressStore.createIndex('userId', 'userId', { unique: false });
                    progressStore.createIndex('date', 'date', { unique: false });
                }

                // Create errors store
                if (!db.objectStoreNames.contains(this.stores.errors)) {
                    const errorStore = db.createObjectStore(this.stores.errors, { keyPath: 'errorId' });
                    errorStore.createIndex('userId', 'userId', { unique: false });
                    errorStore.createIndex('type', 'type', { unique: false });
                    errorStore.createIndex('date', 'date', { unique: false });
                }

                // Create settings store
                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    const settingsStore = db.createObjectStore(this.stores.settings, { keyPath: 'userId' });
                }

                console.log('[IndexedDB] Database schema upgraded');
            };
        });
    }

    /**
     * Generic add operation
     */
    async add(storeName, data) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic get operation
     */
    async get(storeName, key) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic update operation
     */
    async update(storeName, data) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic delete operation
     */
    async delete(storeName, key) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic getAll operation
     */
    async getAll(storeName) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic query by index
     */
    async queryByIndex(storeName, indexName, value) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // User operations
    async createUser(userData) {
        const user = {
            userId: userData.userId || this.generateId(),
            email: userData.email,
            name: userData.name,
            tier: 'free', // Default tier
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            ...userData
        };
        return this.add(this.stores.users, user);
    }

    async getUser(userId) {
        return this.get(this.stores.users, userId);
    }

    async updateUser(userData) {
        userData.lastActive = new Date().toISOString();
        return this.update(this.stores.users, userData);
    }

    async getUserByEmail(email) {
        return this.queryByIndex(this.stores.users, 'email', email);
    }

    // Lesson operations
    async createLesson(lessonData) {
        const lesson = {
            lessonId: lessonData.lessonId || this.generateId(),
            userId: lessonData.userId,
            subject: lessonData.subject,
            title: lessonData.title,
            content: lessonData.content,
            completed: false,
            createdAt: new Date().toISOString(),
            ...lessonData
        };
        return this.add(this.stores.lessons, lesson);
    }

    async getLesson(lessonId) {
        return this.get(this.stores.lessons, lessonId);
    }

    async updateLesson(lessonData) {
        return this.update(this.stores.lessons, lessonData);
    }

    async getUserLessons(userId) {
        return this.queryByIndex(this.stores.lessons, 'userId', userId);
    }

    async getLessonsBySubject(subject) {
        return this.queryByIndex(this.stores.lessons, 'subject', subject);
    }

    // Exam operations
    async createExam(examData) {
        const exam = {
            examId: examData.examId || this.generateId(),
            userId: examData.userId,
            examType: examData.examType, // 'IELTS' or 'SAT'
            subject: examData.subject,
            questions: examData.questions,
            answers: examData.answers,
            score: 0,
            completed: false,
            createdAt: new Date().toISOString(),
            ...examData
        };
        return this.add(this.stores.exams, exam);
    }

    async getExam(examId) {
        return this.get(this.stores.exams, examId);
    }

    async updateExam(examData) {
        return this.update(this.stores.exams, examData);
    }

    async getUserExams(userId) {
        return this.queryByIndex(this.stores.exams, 'userId', userId);
    }

    async getExamsByType(examType) {
        return this.queryByIndex(this.stores.exams, 'examType', examType);
    }

    // Progress operations
    async recordProgress(progressData) {
        const progress = {
            progressId: progressData.progressId || this.generateId(),
            userId: progressData.userId,
            lessonId: progressData.lessonId,
            examId: progressData.examId,
            score: progressData.score,
            timeSpent: progressData.timeSpent,
            date: new Date().toISOString(),
            ...progressData
        };
        return this.add(this.stores.progress, progress);
    }

    async getUserProgress(userId) {
        return this.queryByIndex(this.stores.progress, 'userId', userId);
    }

    async getProgressByDate(date) {
        return this.queryByIndex(this.stores.progress, 'date', date);
    }

    // Error operations
    async recordError(errorData) {
        const error = {
            errorId: errorData.errorId || this.generateId(),
            userId: errorData.userId,
            type: errorData.type, // 'lesson', 'exam', 'system'
            message: errorData.message,
            stack: errorData.stack,
            date: new Date().toISOString(),
            ...errorData
        };
        return this.add(this.stores.errors, error);
    }

    async getUserErrors(userId) {
        return this.queryByIndex(this.stores.errors, 'userId', userId);
    }

    async getErrorsByType(type) {
        return this.queryByIndex(this.stores.errors, 'type', type);
    }

    // Settings operations
    async saveSettings(userId, settings) {
        const userSettings = {
            userId: userId,
            ...settings,
            updatedAt: new Date().toISOString()
        };
        return this.update(this.stores.settings, userSettings);
    }

    async getSettings(userId) {
        return this.get(this.stores.settings, userId);
    }

    // Utility operations
    async clearStore(storeName) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getStoreCount(storeName) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getDatabaseStats() {
        const stats = {};
        for (const storeName of Object.values(this.stores)) {
            stats[storeName] = await this.getStoreCount(storeName);
        }
        return stats;
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export all data to JSON
     */
    async exportAllData() {
        const data = {};
        for (const storeName of Object.values(this.stores)) {
            data[storeName] = await this.getAll(storeName);
        }
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import data from JSON
     */
    async importData(jsonData) {
        const data = JSON.parse(jsonData);
        for (const storeName of Object.keys(data)) {
            if (this.stores[storeName]) {
                for (const item of data[storeName]) {
                    await this.add(storeName, item);
                }
            }
        }
    }

    /**
     * Destroy database
     */
    async destroy() {
        if (this.db) {
            this.db.close();
            const request = indexedDB.deleteDatabase(this.dbName);
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    this.db = null;
                    this.isInitialized = false;
                    console.log('[IndexedDB] Database destroyed');
                    resolve();
                };
            });
        }
    }
}

// Export singleton instance
const indexedDBService = new IndexedDBService();
