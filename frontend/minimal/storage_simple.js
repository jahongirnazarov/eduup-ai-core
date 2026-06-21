/**
 * 💾 MINIMAL INDEXEDDB STORAGE
 * Simple local storage for free users
 * No external dependencies, works immediately
 */

class SimpleStorage {
    constructor() {
        this.dbName = 'EduUpAI_Minimal';
        this.dbVersion = 1;
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Initialize IndexedDB
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('[SimpleStorage] Failed to open database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('[SimpleStorage] Database initialized');
                resolve(true);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users store
                if (!db.objectStoreNames.contains('users')) {
                    const usersStore = db.createObjectStore('users', { keyPath: 'userId' });
                    usersStore.createIndex('email', 'email', { unique: true });
                }

                // Exams store
                if (!db.objectStoreNames.contains('exams')) {
                    const examsStore = db.createObjectStore('exams', { keyPath: 'examId' });
                    examsStore.createIndex('userId', 'userId', { unique: false });
                    examsStore.createIndex('examType', 'examType', { unique: false });
                }

                // Progress store
                if (!db.objectStoreNames.contains('progress')) {
                    const progressStore = db.createObjectStore('progress', { keyPath: 'progressId' });
                    progressStore.createIndex('userId', 'userId', { unique: false });
                }
            };
        });
    }

    /**
     * Create user
     */
    async createUser(userData) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const user = {
                userId: userData.userId || this.generateId(),
                name: userData.name || 'Foydalanuvchi',
                email: userData.email || '',
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString(),
                tier: 'free',
                ...userData
            };

            const request = store.add(user);

            request.onsuccess = () => resolve(user);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get user
     */
    async getUser(userId) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all users
     */
    async getAllUsers() {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Update user
     */
    async updateUser(userId, updates) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            store.get(userId).onsuccess = (event) => {
                const user = event.target.result;
                if (!user) {
                    reject(new Error('User not found'));
                    return;
                }

                const updatedUser = {
                    ...user,
                    ...updates,
                    lastActive: new Date().toISOString()
                };

                const request = store.put(updatedUser);
                request.onsuccess = () => resolve(updatedUser);
                request.onerror = () => reject(request.error);
            };
        });
    }

    /**
     * Create exam result
     */
    async createExam(examData) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exams'], 'readwrite');
            const store = transaction.objectStore('users');
            
            const exam = {
                examId: examData.examId || this.generateId(),
                userId: examData.userId || 'default',
                examType: examData.examType || 'IELTS',
                subject: examData.subject || 'reading',
                score: examData.score || 0,
                maxScore: examData.maxScore || 10,
                percentage: examData.percentage || 0,
                passed: examData.passed || false,
                createdAt: new Date().toISOString(),
                ...examData
            };

            const request = store.add(exam);

            request.onsuccess = () => resolve(exam);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get user exams
     */
    async getUserExams(userId) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exams'], 'readonly');
            const store = transaction.objectStore('exams');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Create progress
     */
    async createProgress(progressData) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readwrite');
            const store = transaction.objectStore('progress');
            
            const progress = {
                progressId: progressData.progressId || this.generateId(),
                userId: progressData.userId || 'default',
                lessonId: progressData.lessonId || '',
                completed: progressData.completed || false,
                score: progressData.score || 0,
                createdAt: new Date().toISOString(),
                ...progressData
            };

            const request = store.add(progress);

            request.onsuccess = () => resolve(progress);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get user progress
     */
    async getUserProgress(userId) {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        const users = await this.getAllUsers();
        const exams = await this.getAllExams();

        return {
            totalUsers: users.length,
            totalExams: exams.length,
            averageScore: exams.length > 0 
                ? exams.reduce((sum, exam) => sum + exam.percentage, 0) / exams.length 
                : 0,
            passRate: exams.length > 0 
                ? (exams.filter(exam => exam.passed).length / exams.length) * 100 
                : 0
        };
    }

    /**
     * Get all exams
     */
    async getAllExams() {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exams'], 'readonly');
            const store = transaction.objectStore('exams');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data
     */
    async clearAll() {
        if (!this.isInitialized) {
            throw new Error('Storage not initialized');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users', 'exams', 'progress'], 'readwrite');
            
            transaction.objectStore('users').clear();
            transaction.objectStore('exams').clear();
            transaction.objectStore('progress').clear();

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get storage status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            dbName: this.dbName,
            dbVersion: this.dbVersion
        };
    }
}

// Export singleton
const simpleStorage = new SimpleStorage();
