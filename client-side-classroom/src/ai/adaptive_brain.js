/**
 * Adaptive Brain - Weakness Hunter State Machine
 * =============================================
 * Tracks user performance and adapts learning experience:
 * - Fast Responder Mode: Speed up lessons, energetic tone
 * - Struggling Mode: Slow down, step-by-step hints, warm tone
 */

class AdaptiveBrain {
    constructor() {
        // Performance tracking
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.responseTimes = [];
        this.consecutiveErrors = 0;
        this.consecutiveCorrect = 0;

        // Weakness tracking
        this.weakTopics = new Map();
        this.strongTopics = new Map();
        this.topicAttempts = new Map();

        // Current state
        this.currentState = 'normal';
        this.learningMode = 'balanced';

        // Adaptive parameters
        this.lessonSpeed = 1.0;
        this.hintLevel = 0;
        this.tone = 'neutral';

        // Configuration
        this.config = {
            fastResponseThreshold: 5000, // 5 seconds
            slowResponseThreshold: 20000, // 20 seconds
            consecutiveErrorThreshold: 2,
            consecutiveCorrectThreshold: 3,
            weakTopicThreshold: 0.4, // 40% correct rate
            strongTopicThreshold: 0.8 // 80% correct rate
        };

        // Personalized study path
        this.personalizedSyllabus = [];
        this.currentTopic = null;

        console.log('[AdaptiveBrain] Weakness Hunter initialized');
    }

    /**
     * Record student answer and update state
     * @param {boolean} isCorrect - Whether answer was correct
     * @param {number} responseTime - Time taken to answer (ms)
     * @param {string} topic - Topic/question category
     */
    recordAnswer(isCorrect, responseTime, topic = 'general') {
        // Update basic stats
        if (isCorrect) {
            this.correctAnswers++;
            this.consecutiveCorrect++;
            this.consecutiveErrors = 0;
        } else {
            this.incorrectAnswers++;
            this.consecutiveErrors++;
            this.consecutiveCorrect = 0;
        }

        this.responseTimes.push(responseTime);

        // Update topic tracking
        this.updateTopicStats(topic, isCorrect);

        // Determine current state
        this.updateState();

        // Adjust learning parameters
        this.adjustLearningParameters();

        console.log('[AdaptiveBrain] Answer recorded:', {
            isCorrect,
            responseTime,
            topic,
            state: this.currentState,
            mode: this.learningMode
        });

        return this.getCurrentRecommendation();
    }

    /**
     * Update topic-specific statistics
     * @param {string} topic - Topic name
     * @param {boolean} isCorrect - Whether answer was correct
     */
    updateTopicStats(topic, isCorrect) {
        if (!this.topicAttempts.has(topic)) {
            this.topicAttempts.set(topic, { correct: 0, total: 0 });
        }

        const stats = this.topicAttempts.get(topic);
        stats.total++;
        if (isCorrect) {
            stats.correct++;
        }

        // Calculate correct rate
        const correctRate = stats.correct / stats.total;

        // Update weak/strong topics
        if (correctRate < this.config.weakTopicThreshold && stats.total >= 3) {
            this.weakTopics.set(topic, correctRate);
            this.strongTopics.delete(topic);
        } else if (correctRate >= this.config.strongTopicThreshold && stats.total >= 3) {
            this.strongTopics.set(topic, correctRate);
            this.weakTopics.delete(topic);
        }
    }

    /**
     * Update current state based on performance
     */
    updateState() {
        const avgResponseTime = this.getAverageResponseTime();

        // Check for struggling mode
        if (this.consecutiveErrors >= this.config.consecutiveErrorThreshold ||
            avgResponseTime > this.config.slowResponseThreshold) {
            this.currentState = 'struggling';
            this.learningMode = 'supportive';
        }
        // Check for fast responder mode
        else if (this.consecutiveCorrect >= this.config.consecutiveCorrectThreshold &&
                 avgResponseTime < this.config.fastResponseThreshold) {
            this.currentState = 'fast_responder';
            this.learningMode = 'accelerated';
        }
        // Normal mode
        else {
            this.currentState = 'normal';
            this.learningMode = 'balanced';
        }
    }

    /**
     * Adjust learning parameters based on state
     */
    adjustLearningParameters() {
        switch (this.currentState) {
            case 'fast_responder':
                this.lessonSpeed = 1.3;
                this.hintLevel = 0;
                this.tone = 'energetic';
                break;
            case 'struggling':
                this.lessonSpeed = 0.7;
                this.hintLevel = 2;
                this.tone = 'warm';
                break;
            default:
                this.lessonSpeed = 1.0;
                this.hintLevel = 1;
                this.tone = 'neutral';
        }
    }

    /**
     * Get current recommendation for the system
     * @returns {Object} Recommendation object
     */
    getCurrentRecommendation() {
        return {
            state: this.currentState,
            learningMode: this.learningMode,
            lessonSpeed: this.lessonSpeed,
            hintLevel: this.hintLevel,
            tone: this.tone,
            skipBasicSlides: this.currentState === 'fast_responder',
            provideStepByStep: this.currentState === 'struggling',
            nextTopic: this.getNextTopic()
        };
    }

    /**
     * Get next recommended topic based on weakness hunter
     * @returns {string} Next topic to focus on
     */
    getNextTopic() {
        // Prioritize weak topics
        if (this.weakTopics.size > 0) {
            const weakestTopic = Array.from(this.weakTopics.entries())
                .sort((a, b) => a[1] - b[1])[0][0];
            return weakestTopic;
        }

        // If no weak topics, return current or general
        return this.currentTopic || 'general';
    }

    /**
     * Generate personalized study path
     * @param {Array} availableTopics - List of available topics
     * @returns {Array} Ordered study path
     */
    generatePersonalizedSyllabus(availableTopics) {
        const syllabus = [];

        // Add weak topics first (prioritized by weakness)
        const weakTopicsList = Array.from(this.weakTopics.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([topic]) => topic);

        weakTopicsList.forEach(topic => {
            if (availableTopics.includes(topic)) {
                syllabus.push({
                    topic: topic,
                    priority: 'high',
                    reason: 'Needs improvement',
                    estimatedTime: this.getEstimatedTime(topic, true)
                });
            }
        });

        // Add remaining topics
        availableTopics.forEach(topic => {
            if (!syllabus.find(s => s.topic === topic)) {
                const isStrong = this.strongTopics.has(topic);
                syllabus.push({
                    topic: topic,
                    priority: isStrong ? 'low' : 'medium',
                    reason: isStrong ? 'Review' : 'Practice',
                    estimatedTime: this.getEstimatedTime(topic, isStrong)
                });
            }
        });

        this.personalizedSyllabus = syllabus;
        console.log('[AdaptiveBrain] Personalized syllabus generated:', syllabus);

        return syllabus;
    }

    /**
     * Get estimated time for topic
     * @param {string} topic - Topic name
     * @param {boolean} isStrong - Whether student is strong in this topic
     * @returns {number} Estimated time in minutes
     */
    getEstimatedTime(topic, isStrong) {
        const baseTime = 30; // 30 minutes base
        if (isStrong) {
            return baseTime * 0.5; // 15 minutes for review
        } else if (this.weakTopics.has(topic)) {
            return baseTime * 1.5; // 45 minutes for weak topics
        }
        return baseTime;
    }

    /**
     * Get average response time
     * @returns {number} Average response time in ms
     */
    getAverageResponseTime() {
        if (this.responseTimes.length === 0) return 0;
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        return sum / this.responseTimes.length;
    }

    /**
     * Get overall accuracy rate
     * @returns {number} Accuracy rate (0-1)
     */
    getAccuracyRate() {
        const total = this.correctAnswers + this.incorrectAnswers;
        if (total === 0) return 0;
        return this.correctAnswers / total;
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return {
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            totalAnswers: this.correctAnswers + this.incorrectAnswers,
            accuracyRate: this.getAccuracyRate(),
            averageResponseTime: this.getAverageResponseTime(),
            consecutiveErrors: this.consecutiveErrors,
            consecutiveCorrect: this.consecutiveCorrect,
            weakTopics: Array.from(this.weakTopics.entries()),
            strongTopics: Array.from(this.strongTopics.entries()),
            currentState: this.currentState,
            learningMode: this.learningMode
        };
    }

    /**
     * Reset session statistics (keep topic stats)
     */
    resetSession() {
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.responseTimes = [];
        this.consecutiveErrors = 0;
        this.consecutiveCorrect = 0;
        this.currentState = 'normal';
        this.learningMode = 'balanced';

        console.log('[AdaptiveBrain] Session reset');
    }

    /**
     * Reset all statistics
     */
    resetAll() {
        this.resetSession();
        this.weakTopics.clear();
        this.strongTopics.clear();
        this.topicAttempts.clear();
        this.personalizedSyllabus = [];

        console.log('[AdaptiveBrain] All statistics reset');
    }

    /**
     * Export data for analytics
     * @returns {Object} Exportable data
     */
    exportData() {
        return {
            performance: this.getPerformanceStats(),
            weakTopics: Array.from(this.weakTopics.entries()),
            strongTopics: Array.from(this.strongTopics.entries()),
            topicAttempts: Array.from(this.topicAttempts.entries()),
            personalizedSyllabus: this.personalizedSyllabus,
            config: this.config
        };
    }

    /**
     * Import data from analytics
     * @param {Object} data - Imported data
     */
    importData(data) {
        if (data.performance) {
            this.correctAnswers = data.performance.correctAnswers || 0;
            this.incorrectAnswers = data.performance.incorrectAnswers || 0;
            this.responseTimes = data.performance.responseTimes || [];
            this.consecutiveErrors = data.performance.consecutiveErrors || 0;
            this.consecutiveCorrect = data.performance.consecutiveCorrect || 0;
        }

        if (data.weakTopics) {
            this.weakTopics = new Map(data.weakTopics);
        }

        if (data.strongTopics) {
            this.strongTopics = new Map(data.strongTopics);
        }

        if (data.topicAttempts) {
            this.topicAttempts = new Map(data.topicAttempts);
        }

        if (data.personalizedSyllabus) {
            this.personalizedSyllabus = data.personalizedSyllabus;
        }

        if (data.config) {
            this.config = { ...this.config, ...data.config };
        }

        console.log('[AdaptiveBrain] Data imported');
    }

    /**
     * Get weakness report for analytics
     * @returns {Object} Weakness analysis
     */
    getWeaknessReport() {
        const weakTopicsList = Array.from(this.weakTopics.entries());
        const strongTopicsList = Array.from(this.strongTopics.entries());

        return {
            totalWeakTopics: weakTopicsList.length,
            totalStrongTopics: strongTopicsList.length,
            weakestTopic: weakTopicsList.length > 0 ? weakTopicsList[0][0] : null,
            strongestTopic: strongTopicsList.length > 0 ? strongTopicsList[0][0] : null,
            needsIntervention: this.consecutiveErrors >= this.config.consecutiveErrorThreshold,
            recommendedFocus: this.getNextTopic(),
            projectedImprovement: this.calculateProjectedImprovement()
        };
    }

    /**
     * Calculate projected improvement based on current trajectory
     * @returns {Object} Projection data
     */
    calculateProjectedImprovement() {
        const currentAccuracy = this.getAccuracyRate();
        const recentTrend = this.responseTimes.slice(-5);
        const avgRecentTime = recentTrend.length > 0
            ? recentTrend.reduce((a, b) => a + b, 0) / recentTrend.length
            : this.getAverageResponseTime();

        // Simple projection: if improving, show positive trend
        const isImproving = this.consecutiveCorrect > this.consecutiveErrors;

        return {
            currentAccuracy: currentAccuracy,
            projectedAccuracy: isImproving ? Math.min(1, currentAccuracy + 0.1) : Math.max(0, currentAccuracy - 0.05),
            trend: isImproving ? 'improving' : 'needs_attention',
            estimatedTimeToMastery: this.estimateTimeToMastery()
        };
    }

    /**
     * Estimate time to mastery for weak topics
     * @returns {number} Estimated hours
     */
    estimateTimeToMastery() {
        if (this.weakTopics.size === 0) return 0;

        const avgWeakness = Array.from(this.weakTopics.values())
            .reduce((a, b) => a + b, 0) / this.weakTopics.size;

        // More weakness = more time needed
        const baseHours = 10;
        const weaknessMultiplier = (1 - avgWeakness) * 2;
        return Math.round(baseHours * weaknessMultiplier);
    }

    /**
     * Set current topic being studied
     * @param {string} topic - Topic name
     */
    setCurrentTopic(topic) {
        this.currentTopic = topic;
        console.log('[AdaptiveBrain] Current topic set to:', topic);
    }

    /**
     * Get adaptive hint based on current state
     * @param {string} question - Current question
     * @returns {string} Adaptive hint
     */
    getAdaptiveHint(question) {
        switch (this.hintLevel) {
            case 0:
                return null; // No hints for fast responders
            case 1:
                return "Take your time and think through each step carefully.";
            case 2:
                return `Let's break this down. First, identify what the question is asking about ${this.currentTopic || 'this topic'}.`;
            default:
                return "Here's a step-by-step approach: 1) Read the question carefully, 2) Identify key information, 3) Apply the relevant formula or concept, 4) Check your answer.";
        }
    }
}

// Export singleton instance
export const adaptiveBrain = new AdaptiveBrain();
export default adaptiveBrain;
