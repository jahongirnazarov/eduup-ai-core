/**
 * ☁️ CLOUDFLARE D1 SERVICE - VIP User Database
 * Serverless SQL database for 2M VIP users
 * Zero-cost with Cloudflare Workers
 */

class CloudflareD1Service {
    constructor() {
        this.dbName = 'eduupai_vip_users';
        this.apiEndpoint = null;
        this.apiKey = null;
        this.isInitialized = false;
        
        // Table schema
        this.tables = {
            vip_users: 'vip_users',
            subscriptions: 'subscriptions',
            analytics: 'analytics'
        };
    }

    /**
     * Initialize Cloudflare D1 service
     * @param {string} apiEndpoint - Cloudflare D1 API endpoint
     * @param {string} apiKey - Cloudflare API key
     */
    async initialize(apiEndpoint, apiKey) {
        try {
            this.apiEndpoint = apiEndpoint;
            this.apiKey = apiKey;
            
            // Test connection
            await this.testConnection();
            
            // Create tables if they don't exist
            await this.createTables();
            
            this.isInitialized = true;
            console.log('[CloudflareD1] Service initialized successfully');
            return true;
        } catch (error) {
            console.error('[CloudflareD1] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.apiEndpoint}/test`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Connection test failed');
            }
            
            console.log('[CloudflareD1] Connection test successful');
            return true;
        } catch (error) {
            console.error('[CloudflareD1] Connection test failed:', error);
            throw error;
        }
    }

    /**
     * Create database tables
     */
    async createTables() {
        try {
            // Create VIP users table
            await this.executeSQL(`
                CREATE TABLE IF NOT EXISTS ${this.tables.vip_users} (
                    user_id TEXT PRIMARY KEY,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    phone_number TEXT,
                    password_hash TEXT NOT NULL,
                    tier TEXT DEFAULT 'vip',
                    created_at TEXT NOT NULL,
                    last_active TEXT NOT NULL,
                    subscription_status TEXT DEFAULT 'active'
                )
            `);
            
            // Create subscriptions table
            await this.executeSQL(`
                CREATE TABLE IF NOT EXISTS ${this.tables.subscriptions} (
                    subscription_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    plan_type TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT DEFAULT 'UZS',
                    payment_method TEXT NOT NULL,
                    transaction_id TEXT UNIQUE NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    status TEXT DEFAULT 'active',
                    FOREIGN KEY (user_id) REFERENCES ${this.tables.vip_users}(user_id)
                )
            `);
            
            // Create analytics table
            await this.executeSQL(`
                CREATE TABLE IF NOT EXISTS ${this.tables.analytics} (
                    analytics_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    event_data TEXT,
                    timestamp TEXT NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES ${this.tables.vip_users}(user_id)
                )
            `);
            
            console.log('[CloudflareD1] Tables created successfully');
        } catch (error) {
            console.error('[CloudflareD1] Failed to create tables:', error);
            throw error;
        }
    }

    /**
     * Execute SQL query
     * @param {string} sql - SQL query
     * @param {array} params - Query parameters
     */
    async executeSQL(sql, params = []) {
        try {
            const response = await fetch(`${this.apiEndpoint}/query`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sql: sql,
                    params: params
                })
            });
            
            if (!response.ok) {
                throw new Error(`SQL execution failed: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('[CloudflareD1] SQL execution failed:', error);
            throw error;
        }
    }

    /**
     * Create VIP user
     * @param {object} userData - User data
     */
    async createVIPUser(userData) {
        try {
            // Hash password (using Web Crypto API)
            const passwordHash = await this.hashPassword(userData.password);
            
            const user = {
                user_id: userData.userId || this.generateUserId(),
                email: userData.email,
                name: userData.name,
                phone_number: userData.phoneNumber,
                password_hash: passwordHash,
                tier: 'vip',
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
                subscription_status: 'active'
            };
            
            await this.executeSQL(`
                INSERT INTO ${this.tables.vip_users} 
                (user_id, email, name, phone_number, password_hash, tier, created_at, last_active, subscription_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.user_id,
                user.email,
                user.name,
                user.phone_number,
                user.password_hash,
                user.tier,
                user.created_at,
                user.last_active,
                user.subscription_status
            ]);
            
            console.log('[CloudflareD1] VIP user created successfully');
            return user;
        } catch (error) {
            console.error('[CloudflareD1] Failed to create VIP user:', error);
            throw error;
        }
    }

    /**
     * Get VIP user by ID
     * @param {string} userId - User ID
     */
    async getVIPUser(userId) {
        try {
            const result = await this.executeSQL(`
                SELECT * FROM ${this.tables.vip_users} WHERE user_id = ?
            `, [userId]);
            
            return result.results[0] || null;
        } catch (error) {
            console.error('[CloudflareD1] Failed to get VIP user:', error);
            throw error;
        }
    }

    /**
     * Get VIP user by email
     * @param {string} email - User email
     */
    async getVIPUserByEmail(email) {
        try {
            const result = await this.executeSQL(`
                SELECT * FROM ${this.tables.vip_users} WHERE email = ?
            `, [email]);
            
            return result.results[0] || null;
        } catch (error) {
            console.error('[CloudflareD1] Failed to get VIP user by email:', error);
            throw error;
        }
    }

    /**
     * Update VIP user
     * @param {object} userData - User data
     */
    async updateVIPUser(userData) {
        try {
            await this.executeSQL(`
                UPDATE ${this.tables.vip_users}
                SET name = ?, phone_number = ?, last_active = ?, subscription_status = ?
                WHERE user_id = ?
            `, [
                userData.name,
                userData.phoneNumber,
                new Date().toISOString(),
                userData.subscriptionStatus,
                userData.userId
            ]);
            
            console.log('[CloudflareD1] VIP user updated successfully');
            return true;
        } catch (error) {
            console.error('[CloudflareD1] Failed to update VIP user:', error);
            throw error;
        }
    }

    /**
     * Verify user password
     * @param {string} email - User email
     * @param {string} password - Plain text password
     */
    async verifyPassword(email, password) {
        try {
            const user = await this.getVIPUserByEmail(email);
            
            if (!user) {
                return false;
            }
            
            const isValid = await this.verifyPasswordHash(password, user.password_hash);
            return isValid ? user : false;
        } catch (error) {
            console.error('[CloudflareD1] Password verification failed:', error);
            throw error;
        }
    }

    /**
     * Create subscription
     * @param {object} subscriptionData - Subscription data
     */
    async createSubscription(subscriptionData) {
        try {
            const subscription = {
                subscription_id: subscriptionData.subscriptionId || this.generateSubscriptionId(),
                user_id: subscriptionData.userId,
                plan_type: subscriptionData.planType,
                amount: subscriptionData.amount,
                currency: subscriptionData.currency || 'UZS',
                payment_method: subscriptionData.paymentMethod,
                transaction_id: subscriptionData.transactionId,
                start_date: subscriptionData.startDate || new Date().toISOString(),
                end_date: subscriptionData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'active'
            };
            
            await this.executeSQL(`
                INSERT INTO ${this.tables.subscriptions}
                (subscription_id, user_id, plan_type, amount, currency, payment_method, transaction_id, start_date, end_date, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                subscription.subscription_id,
                subscription.user_id,
                subscription.plan_type,
                subscription.amount,
                subscription.currency,
                subscription.payment_method,
                subscription.transaction_id,
                subscription.start_date,
                subscription.end_date,
                subscription.status
            ]);
            
            console.log('[CloudflareD1] Subscription created successfully');
            return subscription;
        } catch (error) {
            console.error('[CloudflareD1] Failed to create subscription:', error);
            throw error;
        }
    }

    /**
     * Get user subscriptions
     * @param {string} userId - User ID
     */
    async getUserSubscriptions(userId) {
        try {
            const result = await this.executeSQL(`
                SELECT * FROM ${this.tables.subscriptions} WHERE user_id = ?
            `, [userId]);
            
            return result.results || [];
        } catch (error) {
            console.error('[CloudflareD1] Failed to get user subscriptions:', error);
            throw error;
        }
    }

    /**
     * Get active subscription
     * @param {string} userId - User ID
     */
    async getActiveSubscription(userId) {
        try {
            const result = await this.executeSQL(`
                SELECT * FROM ${this.tables.subscriptions}
                WHERE user_id = ? AND status = 'active' AND end_date > datetime('now')
                ORDER BY end_date DESC LIMIT 1
            `, [userId]);
            
            return result.results[0] || null;
        } catch (error) {
            console.error('[CloudflareD1] Failed to get active subscription:', error);
            throw error;
        }
    }

    /**
     * Record analytics event
     * @param {object} eventData - Event data
     */
    async recordEvent(eventData) {
        try {
            const event = {
                analytics_id: this.generateAnalyticsId(),
                user_id: eventData.userId,
                event_type: eventData.eventType,
                event_data: JSON.stringify(eventData.data || {}),
                timestamp: new Date().toISOString()
            };
            
            await this.executeSQL(`
                INSERT INTO ${this.tables.analytics}
                (analytics_id, user_id, event_type, event_data, timestamp)
                VALUES (?, ?, ?, ?, ?)
            `, [
                event.analytics_id,
                event.user_id,
                event.event_type,
                event.event_data,
                event.timestamp
            ]);
            
            console.log('[CloudflareD1] Event recorded successfully');
            return event;
        } catch (error) {
            console.error('[CloudflareD1] Failed to record event:', error);
            throw error;
        }
    }

    /**
     * Get VIP user count
     */
    async getVIPUserCount() {
        try {
            const result = await this.executeSQL(`
                SELECT COUNT(*) as count FROM ${this.tables.vip_users}
            `);
            
            return result.results[0].count;
        } catch (error) {
            console.error('[CloudflareD1] Failed to get VIP user count:', error);
            throw error;
        }
    }

    /**
     * Get all VIP users
     */
    async getAllVIPUsers() {
        try {
            const result = await this.executeSQL(`
                SELECT * FROM ${this.tables.vip_users} ORDER BY created_at DESC
            `);
            
            return result.results || [];
        } catch (error) {
            console.error('[CloudflareD1] Failed to get all VIP users:', error);
            throw error;
        }
    }

    /**
     * Hash password using Web Crypto API
     * @param {string} password - Plain text password
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Verify password hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     */
    async verifyPasswordHash(password, hash) {
        const passwordHash = await this.hashPassword(password);
        return passwordHash === hash;
    }

    /**
     * Generate user ID
     */
    generateUserId() {
        return `VIP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Generate subscription ID
     */
    generateSubscriptionId() {
        return `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Generate analytics ID
     */
    generateAnalyticsId() {
        return `ANL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            apiEndpoint: this.apiEndpoint,
            dbName: this.dbName
        };
    }
}

// Export singleton instance
const cloudflareD1Service = new CloudflareD1Service();
