/**
 * 📊 GOOGLE SHEETS API SERVICE - Payment Receipts
 * Zero-cost payment tracking using Google Sheets API
 * Stores VIP transaction records in Google Sheets
 */

class GoogleSheetsService {
    constructor() {
        this.apiKey = null;
        this.spreadsheetId = null;
        this.sheetName = 'VIP_Transactions';
        this.isInitialized = false;
        
        // Required scopes
        this.scopes = [
            'https://www.googleapis.com/auth/spreadsheets'
        ];
    }

    /**
     * Initialize Google Sheets API
     * @param {string} apiKey - Google API key
     * @param {string} spreadsheetId - Google Sheet ID
     */
    async initialize(apiKey, spreadsheetId) {
        try {
            this.apiKey = apiKey;
            this.spreadsheetId = spreadsheetId;
            
            // Load Google API client
            await this.loadGAPIClient();
            
            // Initialize Google Sheets API
            await gapi.client.init({
                apiKey: this.apiKey,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
            });
            
            // Check if sheet exists, create if not
            await this.ensureSheetExists();
            
            this.isInitialized = true;
            console.log('[GoogleSheets] Service initialized successfully');
            return true;
        } catch (error) {
            console.error('[GoogleSheets] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load Google API client library
     */
    async loadGAPIClient() {
        return new Promise((resolve, reject) => {
            if (typeof gapi !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', resolve);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Ensure sheet exists
     */
    async ensureSheetExists() {
        try {
            // Get spreadsheet info
            const response = await gapi.client.sheets.spreadsheets.get({
                spreadsheetId: this.spreadsheetId
            });
            
            const sheets = response.result.sheets;
            const sheetExists = sheets.some(sheet => sheet.properties.title === this.sheetName);
            
            if (!sheetExists) {
                await this.createSheet();
            }
        } catch (error) {
            console.error('[GoogleSheets] Failed to check sheet existence:', error);
            throw error;
        }
    }

    /**
     * Create new sheet with headers
     */
    async createSheet() {
        try {
            // Add new sheet
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: this.spreadsheetId,
                resource: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title: this.sheetName
                                }
                            }
                        }
                    ]
                }
            });
            
            // Add headers
            const headers = [
                'Transaction ID',
                'User ID',
                'User Name',
                'Phone Number',
                'Email',
                'Amount',
                'Currency',
                'Payment Method',
                'Payment Date',
                'Status',
                'Plan Type',
                'Duration (months)',
                'Notes'
            ];
            
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A1:M1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [headers]
                }
            });
            
            console.log('[GoogleSheets] Sheet created successfully');
        } catch (error) {
            console.error('[GoogleSheets] Failed to create sheet:', error);
            throw error;
        }
    }

    /**
     * Add transaction record
     * @param {object} transactionData - Transaction data
     */
    async addTransaction(transactionData) {
        if (!this.isInitialized) {
            throw new Error('Google Sheets Service not initialized');
        }

        try {
            const row = [
                transactionData.transactionId || this.generateTransactionId(),
                transactionData.userId,
                transactionData.userName,
                transactionData.phoneNumber,
                transactionData.email,
                transactionData.amount,
                transactionData.currency || 'UZS',
                transactionData.paymentMethod,
                transactionData.paymentDate || new Date().toISOString(),
                transactionData.status || 'completed',
                transactionData.planType || 'VIP',
                transactionData.duration || 1,
                transactionData.notes || ''
            ];
            
            // Append row to sheet
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:M`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [row]
                }
            });
            
            console.log('[GoogleSheets] Transaction added successfully');
            return true;
        } catch (error) {
            console.error('[GoogleSheets] Failed to add transaction:', error);
            throw error;
        }
    }

    /**
     * Get all transactions
     */
    async getAllTransactions() {
        if (!this.isInitialized) {
            throw new Error('Google Sheets Service not initialized');
        }

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:M`
            });
            
            const rows = response.result.values;
            
            // Convert to array of objects
            const headers = rows[0];
            const transactions = rows.slice(1).map(row => {
                const transaction = {};
                headers.forEach((header, index) => {
                    transaction[header.toLowerCase().replace(/ /g, '_')] = row[index];
                });
                return transaction;
            });
            
            return transactions;
        } catch (error) {
            console.error('[GoogleSheets] Failed to get transactions:', error);
            throw error;
        }
    }

    /**
     * Get transaction by ID
     * @param {string} transactionId - Transaction ID
     */
    async getTransaction(transactionId) {
        const transactions = await this.getAllTransactions();
        return transactions.find(t => t.transaction_id === transactionId);
    }

    /**
     * Get transactions by user ID
     * @param {string} userId - User ID
     */
    async getUserTransactions(userId) {
        const transactions = await this.getAllTransactions();
        return transactions.filter(t => t.user_id === userId);
    }

    /**
     * Get transactions by date range
     * @param {string} startDate - Start date (ISO format)
     * @param {string} endDate - End date (ISO format)
     */
    async getTransactionsByDateRange(startDate, endDate) {
        const transactions = await this.getAllTransactions();
        return transactions.filter(t => {
            const paymentDate = new Date(t.payment_date);
            return paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate);
        });
    }

    /**
     * Get total revenue
     * @param {string} startDate - Start date (optional)
     * @param {string} endDate - End date (optional)
     */
    async getTotalRevenue(startDate, endDate) {
        let transactions = await this.getAllTransactions();
        
        if (startDate && endDate) {
            transactions = await this.getTransactionsByDateRange(startDate, endDate);
        }
        
        return transactions.reduce((total, t) => {
            const amount = parseFloat(t.amount) || 0;
            return total + amount;
        }, 0);
    }

    /**
     * Get VIP user count
     */
    async getVIPUserCount() {
        const transactions = await this.getAllTransactions();
        const uniqueUsers = new Set(transactions.map(t => t.user_id));
        return uniqueUsers.size;
    }

    /**
     * Update transaction status
     * @param {string} transactionId - Transaction ID
     * @param {string} status - New status
     */
    async updateTransactionStatus(transactionId, status) {
        const transactions = await this.getAllTransactions();
        const rowIndex = transactions.findIndex(t => t.transaction_id === transactionId);
        
        if (rowIndex === -1) {
            throw new Error('Transaction not found');
        }
        
        // Update status (column 9, index 8)
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${this.sheetName}!J${rowIndex + 2}`, // +2 for header and 0-based index
            valueInputOption: 'RAW',
            resource: {
                values: [[status]]
            }
        });
        
        console.log('[GoogleSheets] Transaction status updated');
        return true;
    }

    /**
     * Delete transaction
     * @param {string} transactionId - Transaction ID
     */
    async deleteTransaction(transactionId) {
        const transactions = await this.getAllTransactions();
        const rowIndex = transactions.findIndex(t => t.transaction_id === transactionId);
        
        if (rowIndex === -1) {
            throw new Error('Transaction not found');
        }
        
        // Delete row
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
                requests: [
                    {
                        deleteDimension: {
                            range: {
                                sheetId: this.getSheetId(),
                                dimension: 'ROWS',
                                startIndex: rowIndex + 1, // +1 for header
                                endIndex: rowIndex + 2
                            }
                        }
                    }
                ]
            }
        });
        
        console.log('[GoogleSheets] Transaction deleted');
        return true;
    }

    /**
     * Get sheet ID
     */
    async getSheetId() {
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: this.spreadsheetId
        });
        
        const sheet = response.result.sheets.find(s => s.properties.title === this.sheetName);
        return sheet ? sheet.properties.sheetId : 0;
    }

    /**
     * Export transactions to CSV
     */
    async exportToCSV() {
        const transactions = await this.getAllTransactions();
        
        // Convert to CSV
        const headers = Object.keys(transactions[0] || {}).join(',');
        const rows = transactions.map(t => Object.values(t).join(','));
        const csv = [headers, ...rows].join('\n');
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vip_transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        window.URL.revokeObjectURL(url);
        console.log('[GoogleSheets] Transactions exported to CSV');
    }

    /**
     * Generate transaction ID
     */
    generateTransactionId() {
        return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            spreadsheetId: this.spreadsheetId,
            sheetName: this.sheetName
        };
    }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
