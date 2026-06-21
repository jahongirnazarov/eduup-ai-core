/**
 * 📧 GMAIL API SERVICE - Automatic Receipt Emails
 * Zero-cost email delivery using Gmail API
 * Sends payment receipts to users automatically
 */

class GmailService {
    constructor() {
        this.apiKey = null;
        this.clientId = null;
        this.scopes = [
            'https://www.googleapis.com/auth/gmail.send'
        ];
        this.isInitialized = false;
        this.accessToken = null;
    }

    /**
     * Initialize Gmail API
     * @param {string} clientId - OAuth2 client ID
     * @param {string} apiKey - Google API key
     */
    async initialize(clientId, apiKey) {
        try {
            this.clientId = clientId;
            this.apiKey = apiKey;
            
            // Load Google API client
            await this.loadGAPIClient();
            
            // Initialize Google API client
            await gapi.client.init({
                apiKey: this.apiKey,
                clientId: this.clientId,
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest'],
                scope: this.scopes.join(' ')
            });
            
            // Check if user is authenticated
            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance.isSignedIn.get()) {
                this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
            }
            
            this.isInitialized = true;
            console.log('[GmailService] Service initialized successfully');
            return true;
        } catch (error) {
            console.error('[GmailService] Initialization failed:', error);
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
                gapi.load('client:auth2', resolve);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Authenticate user
     */
    async authenticate() {
        try {
            const authInstance = gapi.auth2.getAuthInstance();
            const user = await authInstance.signIn();
            this.accessToken = user.getAuthResponse().access_token;
            console.log('[GmailService] Authentication successful');
            return true;
        } catch (error) {
            console.error('[GmailService] Authentication failed:', error);
            throw error;
        }
    }

    /**
     * Send payment receipt email
     * @param {object} receiptData - Receipt data
     */
    async sendPaymentReceipt(receiptData) {
        if (!this.isInitialized) {
            throw new Error('Gmail Service not initialized');
        }

        try {
            // Create email content
            const emailContent = this.createReceiptEmail(receiptData);
            
            // Encode email
            const encodedEmail = this.encodeEmail(emailContent);
            
            // Send email
            const response = await gapi.client.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: encodedEmail
                }
            });
            
            console.log('[GmailService] Receipt email sent successfully');
            return response.result;
        } catch (error) {
            console.error('[GmailService] Failed to send receipt email:', error);
            throw error;
        }
    }

    /**
     * Create receipt email content
     * @param {object} receiptData - Receipt data
     */
    createReceiptEmail(receiptData) {
        const email = `
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">EDUUPAI</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Payment Receipt</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd;">
                    <h2 style="color: #667eea; margin-top: 0;">Payment Confirmation</h2>
                    <p>Thank you for your payment! Here are your transaction details:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Transaction ID:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${receiptData.transactionId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Amount:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${receiptData.amount} ${receiptData.currency}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Payment Method:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${receiptData.paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Plan Type:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${receiptData.planType}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Duration:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${receiptData.duration} month(s)</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd; font-weight: bold;">Date:</td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(receiptData.paymentDate).toLocaleDateString()}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666;">
                            Your VIP subscription is now active! You can now access all premium features on EDUUPAI.
                        </p>
                    </div>
                    
                    <p style="font-size: 12px; color: #999; margin-top: 30px;">
                        If you have any questions, please contact us at support@eduupai.uz
                    </p>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        © 2024 EDUUPAI. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
        `;
        
        return {
            to: receiptData.email,
            subject: `Payment Receipt - ${receiptData.transactionId}`,
            body: email
        };
    }

    /**
     * Encode email for Gmail API
     * @param {object} email - Email object
     */
    encodeEmail(email) {
        const emailContent = [
            `To: ${email.to}`,
            `Subject: ${email.subject}`,
            'Content-Type: text/html; charset=utf-8',
            'MIME-Version: 1.0',
            '',
            email.body
        ].join('\r\n');
        
        return btoa(unescape(encodeURIComponent(emailContent)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    /**
     * Send welcome email
     * @param {object} userData - User data
     */
    async sendWelcomeEmail(userData) {
        if (!this.isInitialized) {
            throw new Error('Gmail Service not initialized');
        }

        try {
            const emailContent = this.createWelcomeEmail(userData);
            const encodedEmail = this.encodeEmail(emailContent);
            
            const response = await gapi.client.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: encodedEmail
                }
            });
            
            console.log('[GmailService] Welcome email sent successfully');
            return response.result;
        } catch (error) {
            console.error('[GmailService] Failed to send welcome email:', error);
            throw error;
        }
    }

    /**
     * Create welcome email content
     * @param {object} userData - User data
     */
    createWelcomeEmail(userData) {
        const email = `
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">EDUUPAI</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Welcome!</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd;">
                    <h2 style="color: #667eea; margin-top: 0;">Welcome to EDUUPAI!</h2>
                    <p>Dear ${userData.name},</p>
                    <p>Thank you for joining EDUUPAI! We're excited to help you prepare for your IELTS and SAT exams.</p>
                    
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0; color: #667eea;">What's Next?</h3>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                            <li>Complete your profile</li>
                            <li>Take a placement test</li>
                            <li>Start your first lesson</li>
                            <li>Track your progress</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://eduupai.uz" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Get Started</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #999;">
                        If you have any questions, please contact us at support@eduupai.uz
                    </p>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        © 2024 EDUUPAI. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
        `;
        
        return {
            to: userData.email,
            subject: 'Welcome to EDUUPAI!',
            body: email
        };
    }

    /**
     * Send subscription reminder email
     * @param {object} userData - User data
     */
    async sendSubscriptionReminder(userData) {
        if (!this.isInitialized) {
            throw new Error('Gmail Service not initialized');
        }

        try {
            const emailContent = this.createReminderEmail(userData);
            const encodedEmail = this.encodeEmail(emailContent);
            
            const response = await gapi.client.gmail.users.messages.send({
                userId: 'me',
                resource: {
                    raw: encodedEmail
                }
            });
            
            console.log('[GmailService] Reminder email sent successfully');
            return response.result;
        } catch (error) {
            console.error('[GmailService] Failed to send reminder email:', error);
            throw error;
        }
    }

    /**
     * Create reminder email content
     * @param {object} userData - User data
     */
    createReminderEmail(userData) {
        const email = `
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">EDUUPAI</h1>
                    <p style="color: white; margin: 10px 0 0 0;">Subscription Reminder</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #ddd;">
                    <h2 style="color: #667eea; margin-top: 0;">Your Subscription is Expiring Soon</h2>
                    <p>Dear ${userData.name},</p>
                    <p>Your VIP subscription will expire in ${userData.daysRemaining} days. Don't lose access to premium features!</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://eduupai.uz/upgrade" style="background: linear-gradient(135deg, #f5af19 0%, #f12711 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Now</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #999;">
                        If you have any questions, please contact us at support@eduupai.uz
                    </p>
                </div>
                
                <div style="background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #ddd; border-top: none;">
                    <p style="margin: 0; font-size: 12px; color: #999;">
                        © 2024 EDUUPAI. All rights reserved.
                    </p>
                </div>
            </body>
            </html>
        `;
        
        return {
            to: userData.email,
            subject: 'Subscription Expiring Soon',
            body: email
        };
    }

    /**
     * Check authentication status
     */
    isAuthenticated() {
        if (!this.isInitialized) {
            return false;
        }
        
        const authInstance = gapi.auth2.getAuthInstance();
        return authInstance.isSignedIn.get();
    }

    /**
     * Get service status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isAuthenticated: this.isAuthenticated(),
            clientId: this.clientId
        };
    }
}

// Export singleton instance
const gmailService = new GmailService();
