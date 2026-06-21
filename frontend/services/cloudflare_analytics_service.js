/**
 * 📊 CLOUDFLARE ANALYTICS API SERVICE - Live Stats
 * Real-time analytics for admin panel
 * Zero-cost with Cloudflare Analytics
 */

class CloudflareAnalyticsService {
    constructor() {
        this.apiEndpoint = null;
        this.apiKey = null;
        this.accountId = null;
        this.isInitialized = false;
        
        // Cache for analytics data
        this.cache = {
            activeUsers: 0,
            pageViews: 0,
            uniqueVisitors: 0,
            lastUpdated: null
        };
    }

    /**
     * Initialize Cloudflare Analytics API
     * @param {string} apiKey - Cloudflare API key
     * @param {string} accountId - Cloudflare account ID
     */
    async initialize(apiKey, accountId) {
        try {
            this.apiKey = apiKey;
            this.accountId = accountId;
            this.apiEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}`;
            
            // Test connection
            await this.testConnection();
            
            this.isInitialized = true;
            console.log('[CloudflareAnalytics] Service initialized successfully');
            return true;
        } catch (error) {
            console.error('[CloudflareAnalytics] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Connection test failed');
            }
            
            console.log('[CloudflareAnalytics] Connection test successful');
            return true;
        } catch (error) {
            console.error('[CloudflareAnalytics] Connection test failed:', error);
            throw error;
        }
    }

    /**
     * Get real-time active users
     */
    async getActiveUsers() {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=-30minutes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch active users');
            }
            
            const data = await response.json();
            const activeUsers = data.result[0]?.uniq_visitors || 0;
            
            // Update cache
            this.cache.activeUsers = activeUsers;
            this.cache.lastUpdated = new Date().toISOString();
            
            return activeUsers;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get active users:', error);
            // Return cached value or default
            return this.cache.activeUsers || 0;
        }
    }

    /**
     * Get page views for time range
     * @param {string} timeRange - Time range (-1hour, -24hours, -7days, -30days)
     */
    async getPageViews(timeRange = '-24hours') {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=${timeRange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch page views');
            }
            
            const data = await response.json();
            const pageViews = data.result[0]?.requests || 0;
            
            return pageViews;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get page views:', error);
            return 0;
        }
    }

    /**
     * Get unique visitors for time range
     * @param {string} timeRange - Time range (-1hour, -24hours, -7days, -30days)
     */
    async getUniqueVisitors(timeRange = '-24hours') {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=${timeRange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch unique visitors');
            }
            
            const data = await response.json();
            const uniqueVisitors = data.result[0]?.uniq_visitors || 0;
            
            return uniqueVisitors;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get unique visitors:', error);
            return 0;
        }
    }

    /**
     * Get bandwidth usage
     * @param {string} timeRange - Time range (-1hour, -24hours, -7days, -30days)
     */
    async getBandwidth(timeRange = '-24hours') {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=${timeRange}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch bandwidth');
            }
            
            const data = await response.json();
            const bandwidth = data.result[0]?.bandwidth || 0;
            
            // Convert to GB
            const bandwidthGB = bandwidth / (1024 * 1024 * 1024);
            
            return bandwidthGB;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get bandwidth:', error);
            return 0;
        }
    }

    /**
     * Get top pages
     * @param {number} limit - Number of pages to return
     */
    async getTopPages(limit = 10) {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=-24hours`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch top pages');
            }
            
            const data = await response.json();
            const topPages = data.result[0]?.top_pages || [];
            
            return topPages.slice(0, limit);
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get top pages:', error);
            return [];
        }
    }

    /**
     * Get geographic distribution
     */
    async getGeographicDistribution() {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=-24hours`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch geographic distribution');
            }
            
            const data = await response.json();
            const geoData = data.result[0]?.country || [];
            
            return geoData;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get geographic distribution:', error);
            return [];
        }
    }

    /**
     * Get device breakdown
     */
    async getDeviceBreakdown() {
        try {
            const response = await fetch(`${this.apiEndpoint}/analytics/dashboard?since=-24hours`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch device breakdown');
            }
            
            const data = await response.json();
            const deviceData = data.result[0]?.device || [];
            
            return deviceData;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get device breakdown:', error);
            return [];
        }
    }

    /**
     * Get comprehensive analytics summary
     */
    async getAnalyticsSummary() {
        try {
            const [activeUsers, pageViews, uniqueVisitors, bandwidth] = await Promise.all([
                this.getActiveUsers(),
                this.getPageViews('-24hours'),
                this.getUniqueVisitors('-24hours'),
                this.getBandwidth('-24hours')
            ]);
            
            return {
                activeUsers: activeUsers,
                pageViews: pageViews,
                uniqueVisitors: uniqueVisitors,
                bandwidth: bandwidth,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get analytics summary:', error);
            return {
                activeUsers: 0,
                pageViews: 0,
                uniqueVisitors: 0,
                bandwidth: 0,
                lastUpdated: new Date().toISOString()
            };
        }
    }

    /**
     * Get revenue analytics (combined with Google Sheets)
     * @param {object} googleSheetsService - Google Sheets service instance
     */
    async getRevenueAnalytics(googleSheetsService) {
        try {
            // Get revenue from Google Sheets
            const dailyRevenue = await googleSheetsService.getTotalRevenue(
                new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            );
            
            const weeklyRevenue = await googleSheetsService.getTotalRevenue(
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            );
            
            const monthlyRevenue = await googleSheetsService.getTotalRevenue(
                new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                new Date().toISOString()
            );
            
            const totalRevenue = await googleSheetsService.getTotalRevenue();
            
            const vipCount = await googleSheetsService.getVIPUserCount();
            
            return {
                dailyRevenue: dailyRevenue,
                weeklyRevenue: weeklyRevenue,
                monthlyRevenue: monthlyRevenue,
                totalRevenue: totalRevenue,
                vipCount: vipCount,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to get revenue analytics:', error);
            return {
                dailyRevenue: 0,
                weeklyRevenue: 0,
                monthlyRevenue: 0,
                totalRevenue: 0,
                vipCount: 0,
                lastUpdated: new Date().toISOString()
            };
        }
    }

    /**
     * Record custom event
     * @param {string} eventName - Event name
     * @param {object} eventData - Event data
     */
    async recordEvent(eventName, eventData = {}) {
        try {
            // Cloudflare Analytics doesn't support custom events directly
            // This is a placeholder for future implementation
            console.log(`[CloudflareAnalytics] Event recorded: ${eventName}`, eventData);
            return true;
        } catch (error) {
            console.error('[CloudflareAnalytics] Failed to record event:', error);
            return false;
        }
    }

    /**
     * Get cache status
     */
    getCacheStatus() {
        return {
            ...this.cache,
            age: this.cache.lastUpdated ? 
                Date.now() - new Date(this.cache.lastUpdated).getTime() : 
                null
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {
            activeUsers: 0,
            pageViews: 0,
            uniqueVisitors: 0,
            lastUpdated: null
        };
        console.log('[CloudflareAnalytics] Cache cleared');
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            accountId: this.accountId,
            apiEndpoint: this.apiEndpoint,
            cacheStatus: this.getCacheStatus()
        };
    }
}

// Export singleton instance
const cloudflareAnalyticsService = new CloudflareAnalyticsService();
