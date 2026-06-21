/**
 * 🚀 EDUUPAI MAIN APPLICATION - Client-Side Integration
 * Zero-cost IELTS/SAT platform with 100M user capacity
 * Integrates all services: AI, Teacher, Speech, Storage, Payments, Analytics
 */

class EduUpAIApp {
    constructor() {
        this.services = {
            localAI: null,
            teacher2D: null,
            webSpeech: null,
            indexedDB: null,
            googleSheets: null,
            paymentWebhook: null,
            gradingSystem: null,
            cloudflareD1: null,
            cloudflareAnalytics: null,
            gmail: null
        };
        
        this.config = {
            // Google Sheets API
            googleSheetsApiKey: 'YOUR_GOOGLE_SHEETS_API_KEY',
            googleSheetsSpreadsheetId: 'YOUR_SPREADSHEET_ID',
            
            // Cloudflare D1
            cloudflareD1Endpoint: 'YOUR_CLOUDFLARE_D1_ENDPOINT',
            cloudflareD1ApiKey: 'YOUR_CLOUDFLARE_API_KEY',
            
            // Cloudflare Analytics
            cloudflareAnalyticsApiKey: 'YOUR_CLOUDFLARE_ANALYTICS_API_KEY',
            cloudflareAnalyticsAccountId: 'YOUR_CLOUDFLARE_ACCOUNT_ID',
            
            // Gmail API
            gmailClientId: 'YOUR_GMAIL_CLIENT_ID',
            gmailApiKey: 'YOUR_GMAIL_API_KEY',
            
            // Payment providers
            clickMerchantId: 'YOUR_CLICK_MERCHANT_ID',
            clickSecretKey: 'YOUR_CLICK_SECRET_KEY',
            paymeMerchantId: 'YOUR_PAYME_MERCHANT_ID',
            paymeSecretKey: 'YOUR_PAYME_SECRET_KEY',
            stripePublicKey: 'YOUR_STRIPE_PUBLIC_KEY',
            stripeSecretKey: 'YOUR_STRIPE_SECRET_KEY'
        };
        
        this.isInitialized = false;
        this.currentUser = null;
        this.userTier = 'free'; // 'free' or 'vip'
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('[EduUpAI] Initializing application...');
            
            // Initialize IndexedDB (free users storage)
            this.services.indexedDB = indexedDBService;
            await this.services.indexedDB.initialize();
            console.log('[EduUpAI] IndexedDB initialized');
            
            // Initialize 2D Teacher
            this.services.teacher2D = new Teacher2D('teacher-container');
            await this.services.teacher2D.initialize();
            console.log('[EduUpAI] 2D Teacher initialized');
            
            // Initialize Web Speech Service
            this.services.webSpeech = webSpeechService;
            await this.services.webSpeech.initialize();
            console.log('[EduUpAI] Web Speech Service initialized');
            
            // Initialize Local AI Engine
            this.services.localAI = localAIEngine;
            await this.services.localAI.initialize();
            console.log('[EduUpAI] Local AI Engine initialized');
            
            // Initialize Grading System
            this.services.gradingSystem = gradingSystem;
            this.services.gradingSystem.loadQuestionBank({});
            this.services.gradingSystem.loadGradingRules({});
            console.log('[EduUpAI] Grading System initialized');
            
            // Initialize Payment Webhook Service
            this.services.paymentWebhook = paymentWebhookService;
            this.services.paymentWebhook.initializeProvider('click', {
                merchantId: this.config.clickMerchantId,
                secretKey: this.config.clickSecretKey
            });
            this.services.paymentWebhook.initializeProvider('payme', {
                merchantId: this.config.paymeMerchantId,
                secretKey: this.config.paymeSecretKey
            });
            this.services.paymentWebhook.initializeProvider('stripe', {
                publicKey: this.config.stripePublicKey,
                secretKey: this.config.stripeSecretKey
            });
            console.log('[EduUpAI] Payment Webhook Service initialized');
            
            // Set up payment callbacks
            this.services.paymentWebhook.setCallbacks({
                onSuccess: this.handlePaymentSuccess.bind(this),
                onFailure: this.handlePaymentFailure.bind(this),
                onPending: this.handlePaymentPending.bind(this)
            });
            
            // Initialize Google Sheets Service (for VIP receipts)
            this.services.googleSheets = googleSheetsService;
            await this.services.googleSheets.initialize(
                this.config.googleSheetsApiKey,
                this.config.googleSheetsSpreadsheetId
            );
            console.log('[EduUpAI] Google Sheets Service initialized');
            
            // Initialize Cloudflare D1 (for VIP users)
            this.services.cloudflareD1 = cloudflareD1Service;
            await this.services.cloudflareD1.initialize(
                this.config.cloudflareD1Endpoint,
                this.config.cloudflareD1ApiKey
            );
            console.log('[EduUpAI] Cloudflare D1 Service initialized');
            
            // Initialize Cloudflare Analytics
            this.services.cloudflareAnalytics = cloudflareAnalyticsService;
            await this.services.cloudflareAnalytics.initialize(
                this.config.cloudflareAnalyticsApiKey,
                this.config.cloudflareAnalyticsAccountId
            );
            console.log('[EduUpAI] Cloudflare Analytics Service initialized');
            
            // Initialize Gmail Service
            this.services.gmail = gmailService;
            await this.services.gmail.initialize(
                this.config.gmailClientId,
                this.config.gmailApiKey
            );
            console.log('[EduUpAI] Gmail Service initialized');
            
            // Load user data from IndexedDB
            await this.loadUserData();
            
            this.isInitialized = true;
            console.log('[EduUpAI] Application initialized successfully');
            
            return true;
        } catch (error) {
            console.error('[EduUpAI] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load user data from IndexedDB
     */
    async loadUserData() {
        try {
            const users = await this.services.indexedDB.getAllUsers();
            if (users.length > 0) {
                this.currentUser = users[0];
                this.userTier = this.currentUser.tier || 'free';
                console.log('[EduUpAI] User data loaded:', this.currentUser);
            }
        } catch (error) {
            console.error('[EduUpAI] Failed to load user data:', error);
        }
    }

    /**
     * Handle payment success
     */
    async handlePaymentSuccess(transaction) {
        try {
            console.log('[EduUpAI] Payment successful:', transaction);
            
            // Add transaction to Google Sheets
            await this.services.googleSheets.addTransaction({
                transactionId: transaction.transactionId,
                userId: transaction.userId,
                userName: transaction.userName,
                phoneNumber: transaction.phoneNumber,
                email: transaction.email,
                amount: transaction.amount,
                currency: transaction.currency,
                paymentMethod: transaction.paymentMethod,
                paymentDate: transaction.paymentDate,
                status: 'completed',
                planType: transaction.planType,
                duration: transaction.duration
            });
            
            // Create VIP user in Cloudflare D1
            await this.services.cloudflareD1.createVIPUser({
                userId: transaction.userId,
                email: transaction.email,
                name: transaction.userName,
                phoneNumber: transaction.phoneNumber,
                password: 'default_password' // Will be changed by user
            });
            
            // Create subscription
            await this.services.cloudflareD1.createSubscription({
                subscriptionId: this.generateSubscriptionId(),
                userId: transaction.userId,
                planType: transaction.planType,
                amount: transaction.amount,
                currency: transaction.currency,
                paymentMethod: transaction.paymentMethod,
                transactionId: transaction.transactionId
            });
            
            // Send receipt email via Gmail
            await this.services.gmail.sendPaymentReceipt({
                transactionId: transaction.transactionId,
                email: transaction.email,
                amount: transaction.amount,
                currency: transaction.currency,
                paymentMethod: transaction.paymentMethod,
                planType: transaction.planType,
                duration: transaction.duration,
                paymentDate: transaction.paymentDate
            });
            
            // Update user tier in IndexedDB
            if (this.currentUser) {
                this.currentUser.tier = 'vip';
                this.userTier = 'vip';
                await this.services.indexedDB.updateUser(this.currentUser.userId, {
                    tier: 'vip'
                });
            }
            
            // Update UI
            this.updateUserTierBadge();
            
            console.log('[EduUpAI] Payment processing completed');
        } catch (error) {
            console.error('[EduUpAI] Failed to handle payment success:', error);
        }
    }

    /**
     * Handle payment failure
     */
    async handlePaymentFailure(transaction) {
        console.log('[EduUpAI] Payment failed:', transaction);
        // Show error message to user
        alert('Payment failed. Please try again.');
    }

    /**
     * Handle payment pending
     */
    async handlePaymentPending(transaction) {
        console.log('[EduUpAI] Payment pending:', transaction);
        // Show pending message to user
        alert('Payment is being processed. Please wait.');
    }

    /**
     * Start exam
     */
    async startExam(examType, subject) {
        try {
            // Start exam using grading system
            const exam = this.services.gradingSystem.startExam(examType, subject, 10);
            
            // Record analytics event
            await this.services.cloudflareAnalytics.recordEvent('exam_started', {
                examType: examType,
                subject: subject
            });
            
            return exam;
        } catch (error) {
            console.error('[EduUpAI] Failed to start exam:', error);
            throw error;
        }
    }

    /**
     * Submit exam answer
     */
    async submitAnswer(questionId, answer) {
        try {
            this.services.gradingSystem.submitAnswer(questionId, answer);
            
            // If user is VIP, also save to Cloudflare D1
            if (this.userTier === 'vip' && this.currentUser) {
                await this.services.cloudflareD1.recordEvent({
                    userId: this.currentUser.userId,
                    eventType: 'answer_submitted',
                    eventData: {
                        questionId: questionId,
                        answer: answer
                    }
                });
            }
        } catch (error) {
            console.error('[EduUpAI] Failed to submit answer:', error);
            throw error;
        }
    }

    /**
     * Complete exam
     */
    async completeExam() {
        try {
            const results = this.services.gradingSystem.completeExam();
            
            // Save exam results to IndexedDB
            await this.services.indexedDB.createExam({
                examType: results.examType,
                subject: results.subject,
                score: results.results.totalScore,
                maxScore: results.results.maxScore,
                percentage: results.results.percentage,
                passed: results.results.passed
            });
            
            // If user is VIP, also save to Cloudflare D1
            if (this.userTier === 'vip' && this.currentUser) {
                await this.services.cloudflareD1.recordEvent({
                    userId: this.currentUser.userId,
                    eventType: 'exam_completed',
                    eventData: {
                        examType: results.examType,
                        subject: results.subject,
                        score: results.results.totalScore,
                        percentage: results.results.percentage
                    }
                });
            }
            
            // Record analytics event
            await this.services.cloudflareAnalytics.recordEvent('exam_completed', {
                examType: results.examType,
                subject: results.subject,
                score: results.results.totalScore,
                percentage: results.results.percentage
            });
            
            return results;
        } catch (error) {
            console.error('[EduUpAI] Failed to complete exam:', error);
            throw error;
        }
    }

    /**
     * Get AI response
     */
    async getAIResponse(prompt) {
        try {
            const response = await this.services.localAI.generateResponse(prompt);
            
            // Update teacher emotion based on response
            if (this.services.teacher2D) {
                this.services.teacher2D.setEmotion('explaining');
                this.services.teacher2D.speak(response);
            }
            
            return response;
        } catch (error) {
            console.error('[EduUpAI] Failed to get AI response:', error);
            throw error;
        }
    }

    /**
     * Start speech recognition
     */
    async startSpeechRecognition() {
        try {
            await this.services.webSpeech.startRecognition();
            
            if (this.services.teacher2D) {
                this.services.teacher2D.setEmotion('listening');
            }
        } catch (error) {
            console.error('[EduUpAI] Failed to start speech recognition:', error);
            throw error;
        }
    }

    /**
     * Stop speech recognition
     */
    async stopSpeechRecognition() {
        try {
            const transcript = await this.services.webSpeech.stopRecognition();
            
            if (this.services.teacher2D) {
                this.services.teacher2D.setEmotion('thinking');
            }
            
            return transcript;
        } catch (error) {
            console.error('[EduUpAI] Failed to stop speech recognition:', error);
            throw error;
        }
    }

    /**
     * Speak text
     */
    async speak(text) {
        try {
            await this.services.webSpeech.speak(text);
            
            if (this.services.teacher2D) {
                this.services.teacher2D.setEmotion('speaking');
            }
        } catch (error) {
            console.error('[EduUpAI] Failed to speak:', error);
            throw error;
        }
    }

    /**
     * Get analytics summary
     */
    async getAnalyticsSummary() {
        try {
            const analytics = await this.services.cloudflareAnalytics.getAnalyticsSummary();
            const revenue = await this.services.cloudflareAnalytics.getRevenueAnalytics(
                this.services.googleSheets
            );
            
            return {
                ...analytics,
                ...revenue
            };
        } catch (error) {
            console.error('[EduUpAI] Failed to get analytics summary:', error);
            throw error;
        }
    }

    /**
     * Update user tier badge
     */
    updateUserTierBadge() {
        const badge = document.getElementById('userTier');
        if (badge) {
            badge.textContent = this.userTier === 'vip' ? 'VIP TIER' : 'FREE TIER';
            badge.className = `tier-badge ${this.userTier === 'vip' ? 'tier-vip' : 'tier-free'}`;
        }
    }

    /**
     * Generate subscription ID
     */
    generateSubscriptionId() {
        return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentUser: this.currentUser,
            userTier: this.userTier,
            services: Object.keys(this.services).reduce((acc, key) => {
                acc[key] = this.services[key] ? 'initialized' : 'not initialized';
                return acc;
            }, {})
        };
    }
}

// Export singleton instance
const eduUpAIApp = new EduUpAIApp();

// Auto-initialize on DOM load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await eduUpAIApp.initialize();
            console.log('[EduUpAI] Application ready');
        } catch (error) {
            console.error('[EduUpAI] Failed to initialize application:', error);
        }
    });
}
