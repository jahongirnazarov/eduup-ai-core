/**
 * EduUpAI - Adaptive Pedagogical Engine
 * Student state-machine & pedagogical logic for the "Weakness Hunter" system
 */

class AdaptiveBrain {
    constructor() {
        this.studentState = {
            baseline: null,
            currentLevel: 1, // 1-10 scale
            responseTimes: [],
            correctAnswers: 0,
            totalAnswers: 0,
            weakTopics: [],
            strongTopics: [],
            learningMode: 'normal' // 'fast' | 'normal' | 'struggling'
        };
        
        this.topicHierarchy = {
            sat_math: {
                level1: ['basic_arithmetic', 'fractions', 'percentages'],
                level2: ['linear_equations', 'quadratic_equations', 'systems'],
                level3: ['functions', 'polynomials', 'exponentials'],
                level4: ['trigonometry', 'complex_numbers'],
                level5: ['calculus_basics', 'advanced_algebra']
            },
            sat_rw: {
                level1: ['basic_grammar', 'vocabulary_context'],
                level2: ['sentence_structure', 'punctuation'],
                level3: ['rhetorical_analysis', 'text_structure'],
                level4: ['advanced_grammar', 'style_tone'],
                level5: ['complex_arguments', 'literary_analysis']
            },
            ielts: {
                level1: ['basic_vocabulary', 'simple_sentences'],
                level2: ['paragraph_structure', 'coherence_basics'],
                level3: ['academic_vocabulary', 'complex_sentences'],
                level4: ['advanced_grammar', 'essay_structure'],
                level5: ['sophisticated_arguments', 'nuanced_expression']
            }
        };
        
        this.loadState();
    }
    
    loadState() {
        const saved = localStorage.getItem('eduup_student_state');
        if (saved) {
            this.studentState = JSON.parse(saved);
        }
    }
    
    saveState() {
        localStorage.setItem('eduup_student_state', JSON.stringify(this.studentState));
    }
    
    async initializeBaseline() {
        // Run a 5-minute diagnostic test
        const diagnosticResults = await this.runDiagnosticTest();
        this.studentState.baseline = diagnosticResults;
        this.studentState.currentLevel = this.calculateInitialLevel(diagnosticResults);
        this.saveState();
        
        return this.studentState.currentLevel;
    }
    
    async runDiagnosticTest() {
        // Mock diagnostic test - in production, this would be a real assessment
        return {
            sat_math_score: 500,
            sat_rw_score: 480,
            ielts_band: 5.5,
            response_time_avg: 45, // seconds
            accuracy_rate: 0.65
        };
    }
    
    calculateInitialLevel(diagnostic) {
        // Calculate initial level based on diagnostic results
        let level = 1;
        
        if (diagnostic.sat_math_score > 600) level = Math.max(level, 3);
        if (diagnostic.sat_rw_score > 600) level = Math.max(level, 3);
        if (diagnostic.ielts_band >= 6.0) level = Math.max(level, 4);
        if (diagnostic.ielts_band >= 7.0) level = Math.max(level, 5);
        
        return level;
    }
    
    recordAnswer(topic, isCorrect, responseTime) {
        this.studentState.totalAnswers++;
        this.studentState.responseTimes.push(responseTime);
        
        if (isCorrect) {
            this.studentState.correctAnswers++;
            this.updateStrongTopics(topic);
        } else {
            this.updateWeakTopics(topic);
        }
        
        this.updateLearningMode();
        this.adjustDifficulty();
        this.saveState();
    }
    
    updateStrongTopics(topic) {
        const index = this.studentState.strongTopics.indexOf(topic);
        if (index === -1) {
            this.studentState.strongTopics.push(topic);
        }
        
        // Remove from weak topics if present
        const weakIndex = this.studentState.weakTopics.indexOf(topic);
        if (weakIndex > -1) {
            this.studentState.weakTopics.splice(weakIndex, 1);
        }
    }
    
    updateWeakTopics(topic) {
        const index = this.studentState.weakTopics.indexOf(topic);
        if (index === -1) {
            this.studentState.weakTopics.push(topic);
        }
        
        // Remove from strong topics if present
        const strongIndex = this.studentState.strongTopics.indexOf(topic);
        if (strongIndex > -1) {
            this.studentState.strongTopics.splice(strongIndex, 1);
        }
    }
    
    updateLearningMode() {
        const recentResponses = this.studentState.responseTimes.slice(-10);
        const recentCorrect = this.studentState.correctAnswers / this.studentState.totalAnswers;
        const avgResponseTime = recentResponses.reduce((a, b) => a + b, 0) / recentResponses.length;
        
        if (recentCorrect > 0.8 && avgResponseTime < 30) {
            this.studentState.learningMode = 'fast';
        } else if (recentCorrect < 0.5 || avgResponseTime > 60) {
            this.studentState.learningMode = 'struggling';
        } else {
            this.studentState.learningMode = 'normal';
        }
    }
    
    adjustDifficulty() {
        if (this.studentState.learningMode === 'fast') {
            // Increase level if performing well
            this.studentState.currentLevel = Math.min(10, this.studentState.currentLevel + 0.5);
        } else if (this.studentState.learningMode === 'struggling') {
            // Decrease level if struggling
            this.studentState.currentLevel = Math.max(1, this.studentState.currentLevel - 0.5);
        }
    }
    
    getMalikaTone() {
        switch (this.studentState.learningMode) {
            case 'fast':
                return {
                    energy: 'high',
                    speed: 'fast',
                    style: 'energetic',
                    phrases: ['Excellent!', 'Great job!', 'You\'re doing amazing!']
                };
            case 'struggling':
                return {
                    energy: 'low',
                    speed: 'slow',
                    style: 'comforting',
                    phrases: ['Don\'t worry, let\'s take it step by step.', 'You\'re doing great, let me explain.', 'Take your time.']
                };
            default:
                return {
                    energy: 'medium',
                    speed: 'normal',
                    style: 'professional',
                    phrases: ['Let\'s continue.', 'Good progress.', 'Moving forward.']
                };
        }
    }
    
    getNextLesson(examType) {
        const level = Math.floor(this.studentState.currentLevel);
        const topics = this.topicHierarchy[examType];
        
        // Get topics for current level
        const currentTopics = topics[`level${level}`] || topics.level1;
        
        // Prioritize weak topics
        const prioritizedTopics = currentTopics.filter(topic => 
            this.studentState.weakTopics.includes(topic)
        );
        
        // If no weak topics at this level, return any topic
        if (prioritizedTopics.length === 0) {
            return currentTopics[0];
        }
        
        return prioritizedTopics[0];
    }
    
    generateRemediationPlan() {
        const plan = [];
        
        this.studentState.weakTopics.forEach(topic => {
            const severity = this.calculateTopicSeverity(topic);
            
            plan.push({
                topic: topic,
                severity: severity,
                lessons_needed: severity === 'high' ? 5 : severity === 'medium' ? 3 : 1,
                practice_exercises: this.generatePracticeExercises(topic)
            });
        });
        
        return plan.sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    
    calculateTopicSeverity(topic) {
        // Count how many times student has missed this topic
        const missedCount = this.studentState.responseTimes.filter((_, i) => {
            // In production, track topic per answer
            return false;
        }).length;
        
        if (missedCount >= 3) return 'high';
        if (missedCount >= 2) return 'medium';
        return 'low';
    }
    
    generatePracticeExercises(topic) {
        // Generate practice exercises based on topic
        const exercises = [];
        
        switch (topic) {
            case 'quadratic_equations':
                exercises.push({
                    type: 'solve',
                    equation: 'x² - 5x + 6 = 0',
                    hint: 'Use factoring or quadratic formula'
                });
                exercises.push({
                    type: 'graph',
                    equation: 'y = x² - 4',
                    hint: 'Find vertex and intercepts'
                });
                break;
            case 'linear_equations':
                exercises.push({
                    type: 'solve',
                    equation: '2x + 5 = 15',
                    hint: 'Isolate x'
                });
                break;
            default:
                exercises.push({
                    type: 'practice',
                    description: `Practice ${topic}`,
                    hint: 'Review the lesson material'
                });
        }
        
        return exercises;
    }
    
    getPerformanceAnalytics() {
        const accuracy = this.studentState.totalAnswers > 0 
            ? (this.studentState.correctAnswers / this.studentState.totalAnswers * 100).toFixed(1)
            : 0;
        
        const avgResponseTime = this.studentState.responseTimes.length > 0
            ? (this.studentState.responseTimes.reduce((a, b) => a + b, 0) / this.studentState.responseTimes.length).toFixed(1)
            : 0;
        
        return {
            level: this.studentState.currentLevel,
            accuracy: accuracy,
            avgResponseTime: avgResponseTime,
            learningMode: this.studentState.learningMode,
            weakTopics: this.studentState.weakTopics,
            strongTopics: this.studentState.strongTopics,
            totalAnswers: this.studentState.totalAnswers
        };
    }
    
    predictTargetScore(examType) {
        const currentLevel = this.studentState.currentLevel;
        const accuracy = this.studentState.totalAnswers > 0
            ? this.studentState.correctAnswers / this.studentState.totalAnswers
            : 0.5;
        
        if (examType === 'sat') {
            // Predict SAT score based on level and accuracy
            const baseScore = 400 + (currentLevel / 10) * 400;
            const accuracyBonus = (accuracy - 0.5) * 200;
            return Math.min(1600, Math.max(400, baseScore + accuracyBonus));
        } else if (examType === 'ielts') {
            // Predict IELTS band based on level and accuracy
            const baseBand = 4.0 + (currentLevel / 10) * 4.0;
            const accuracyBonus = (accuracy - 0.5) * 2.0;
            return Math.min(9.0, Math.max(0.0, baseBand + accuracyBonus));
        }
        
        return 0;
    }
    
    resetProgress() {
        this.studentState = {
            baseline: null,
            currentLevel: 1,
            responseTimes: [],
            correctAnswers: 0,
            totalAnswers: 0,
            weakTopics: [],
            strongTopics: [],
            learningMode: 'normal'
        };
        this.saveState();
    }
}

// Export for use in main.js
export default AdaptiveBrain;
