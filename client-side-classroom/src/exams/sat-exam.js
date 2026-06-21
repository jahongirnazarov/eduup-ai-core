/**
 * SAT Exam Simulator with Desmos Graphing Calculator
 * ==================================================
 * Digital SAT Simulator matching College Board Bluebook environment
 * - Desmos Graphing Calculator integration
 * - Text highlighter, strikethrough, mark for review
 * - Math Reference Sheet popup
 * - Strict countdown timer
 */

class SATExamSimulator {
    constructor() {
        this.calculator = null;
        this.currentQuestion = 0;
        this.answers = new Map();
        this.markedForReview = new Set();
        this.highlightedText = new Set();
        this.strikethroughText = new Set();
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.examActive = false;
        
        // SAT Module configuration
        this.modules = {
            math: {
                totalQuestions: 22,
                timeLimit: 35 * 60, // 35 minutes
                calculatorAllowed: true
            },
            reading: {
                totalQuestions: 27,
                timeLimit: 32 * 60, // 32 minutes
                calculatorAllowed: false
            },
            writing: {
                totalQuestions: 27,
                timeLimit: 32 * 60, // 32 minutes
                calculatorAllowed: false
            }
        };
        
        this.currentModule = 'math';
        
        console.log('[SATExam] SAT Exam Simulator initialized');
    }
    
    /**
     * Initialize Desmos Graphing Calculator
     */
    initializeDesmos() {
        if (typeof Desmos === 'undefined') {
            console.error('[SATExam] Desmos API not loaded');
            return false;
        }
        
        const calculatorElement = document.getElementById('desmos-calculator');
        if (!calculatorElement) {
            console.error('[SATExam] Calculator container not found');
            return false;
        }
        
        try {
            this.calculator = Desmos.GraphingCalculator(calculatorElement, {
                keypad: true,
                expressions: true,
                settingsMenu: true,
                zoomButtons: true,
                expressionsTopbar: true,
                border: false,
                lockViewport: false
            });
            
            console.log('[SATExam] Desmos Calculator initialized');
            return true;
        } catch (error) {
            console.error('[SATExam] Desmos initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Load Desmos API dynamically
     */
    async loadDesmosAPI() {
        return new Promise((resolve, reject) => {
            if (typeof Desmos !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=W7j3J5K5y5r5J5';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * Start SAT exam module
     */
    async startModule(moduleName) {
        if (!this.modules[moduleName]) {
            console.error('[SATExam] Invalid module:', moduleName);
            return;
        }
        
        this.currentModule = moduleName;
        this.currentQuestion = 0;
        this.answers.clear();
        this.markedForReview.clear();
        this.timeRemaining = this.modules[moduleName].timeLimit;
        this.examActive = true;
        
        // Load Desmos if math module
        if (moduleName === 'math' && this.modules[moduleName].calculatorAllowed) {
            await this.loadDesmosAPI();
            setTimeout(() => this.initializeDesmos(), 100);
        }
        
        // Start timer
        this.startTimer();
        
        // Load first question
        this.loadQuestion(0);
        
        console.log('[SATExam] Started module:', moduleName);
    }
    
    /**
     * Start countdown timer
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            if (this.timeRemaining <= 0) {
                this.endExam();
            }
        }, 1000);
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerElement = document.getElementById('sat-timer');
        if (timerElement) {
            timerElement.textContent = display;
            
            // Change color when time is running low
            if (this.timeRemaining < 300) { // Less than 5 minutes
                timerElement.classList.add('text-red-500');
            }
        }
    }
    
    /**
     * Load question by index
     */
    loadQuestion(index) {
        this.currentQuestion = index;
        // Implementation would load question data from backend
        console.log('[SATExam] Loading question:', index);
    }
    
    /**
     * Save answer for current question
     */
    saveAnswer(answer) {
        this.answers.set(this.currentQuestion, answer);
        console.log('[SATExam] Answer saved for question:', this.currentQuestion);
    }
    
    /**
     * Toggle mark for review
     */
    toggleMarkForReview() {
        if (this.markedForReview.has(this.currentQuestion)) {
            this.markedForReview.delete(this.currentQuestion);
        } else {
            this.markedForReview.add(this.currentQuestion);
        }
        this.updateQuestionNav();
    }
    
    /**
     * Highlight selected text
     */
    highlightText(textId) {
        const element = document.getElementById(textId);
        if (!element) return;
        
        if (this.highlightedText.has(textId)) {
            this.highlightedText.delete(textId);
            element.classList.remove('bg-yellow-200');
        } else {
            this.highlightedText.add(textId);
            element.classList.add('bg-yellow-200');
        }
    }
    
    /**
     * Toggle strikethrough for answer choice
     */
    toggleStrikethrough(choiceId) {
        const element = document.getElementById(choiceId);
        if (!element) return;
        
        if (this.strikethroughText.has(choiceId)) {
            this.strikethroughText.delete(choiceId);
            element.classList.remove('line-through', 'opacity-50');
        } else {
            this.strikethroughText.add(choiceId);
            element.classList.add('line-through', 'opacity-50');
        }
    }
    
    /**
     * Show Math Reference Sheet
     */
    showMathReference() {
        const referenceModal = document.getElementById('math-reference-modal');
        if (referenceModal) {
            referenceModal.classList.remove('hidden');
        }
    }
    
    /**
     * Hide Math Reference Sheet
     */
    hideMathReference() {
        const referenceModal = document.getElementById('math-reference-modal');
        if (referenceModal) {
            referenceModal.classList.add('hidden');
        }
    }
    
    /**
     * Navigate to next question
     */
    nextQuestion() {
        if (this.currentQuestion < this.modules[this.currentModule].totalQuestions - 1) {
            this.loadQuestion(this.currentQuestion + 1);
        }
    }
    
    /**
     * Navigate to previous question
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.loadQuestion(this.currentQuestion - 1);
        }
    }
    
    /**
     * Update question navigation
     */
    updateQuestionNav() {
        const navContainer = document.getElementById('question-nav');
        if (!navContainer) return;
        
        navContainer.innerHTML = '';
        
        for (let i = 0; i < this.modules[this.currentModule].totalQuestions; i++) {
            const button = document.createElement('button');
            button.textContent = i + 1;
            button.className = `w-8 h-8 rounded ${
                i === this.currentQuestion ? 'bg-blue-500 text-white' : 'bg-gray-200'
            } ${this.markedForReview.has(i) ? 'ring-2 ring-yellow-400' : ''}`;
            button.onclick = () => this.loadQuestion(i);
            navContainer.appendChild(button);
        }
    }
    
    /**
     * End exam and show results
     */
    endExam() {
        this.examActive = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Calculate score
        const correctAnswers = this.calculateScore();
        const totalQuestions = this.modules[this.currentModule].totalQuestions;
        const score = Math.round((correctAnswers / totalQuestions) * 800);
        
        // Show results
        this.showResults(score, correctAnswers, totalQuestions);
        
        console.log('[SATExam] Exam ended. Score:', score);
    }
    
    /**
     * Calculate score based on answers
     */
    calculateScore() {
        // Implementation would compare answers with correct answers
        // For now, return a placeholder
        return this.answers.size;
    }
    
    /**
     * Show exam results
     */
    showResults(score, correct, total) {
        const resultsModal = document.getElementById('sat-results-modal');
        if (resultsModal) {
            document.getElementById('sat-score').textContent = score;
            document.getElementById('sat-correct').textContent = `${correct}/${total}`;
            resultsModal.classList.remove('hidden');
        }
    }
    
    /**
     * Get current exam state
     */
    getExamState() {
        return {
            currentModule: this.currentModule,
            currentQuestion: this.currentQuestion,
            timeRemaining: this.timeRemaining,
            answers: Array.from(this.answers.entries()),
            markedForReview: Array.from(this.markedForReview),
            examActive: this.examActive
        };
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        if (this.calculator) {
            this.calculator = null;
        }
        
        this.examActive = false;
        console.log('[SATExam] Resources cleaned up');
    }
}

// Export singleton instance
export const satExamSimulator = new SATExamSimulator();
export default satExamSimulator;
