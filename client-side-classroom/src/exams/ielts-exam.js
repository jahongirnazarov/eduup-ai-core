/**
 * IELTS Exam Simulator with Split-Screen Layout
 * ==============================================
 * IELTS Simulator with Reading, Listening, and Speaking modules
 * - Split-screen reading layout with text highlighting
 * - Listening interface with synchronized audio controls
 * - Speaking module with MediaRecorder and Whisper analysis
 */

import { localAIModels } from '../ai/local_ai_models.js';

class IELTSExamSimulator {
    constructor() {
        this.currentModule = 'reading';
        this.currentQuestion = 0;
        this.answers = new Map();
        this.audioElement = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.audioPlayed = new Set();
        this.timeRemaining = 0;
        this.timerInterval = null;
        this.examActive = false;
        
        // IELTS Module configuration
        this.modules = {
            reading: {
                totalQuestions: 40,
                timeLimit: 60 * 60, // 60 minutes
                passages: 3
            },
            listening: {
                totalQuestions: 40,
                timeLimit: 30 * 60, // 30 minutes
                sections: 4
            },
            speaking: {
                totalQuestions: 3,
                timeLimit: 15 * 60, // 15 minutes
                parts: 3
            },
            writing: {
                totalQuestions: 2,
                timeLimit: 60 * 60, // 60 minutes
                tasks: 2
            }
        };
        
        console.log('[IELTSExam] IELTS Exam Simulator initialized');
    }
    
    /**
     * Start IELTS exam module
     */
    startModule(moduleName) {
        if (!this.modules[moduleName]) {
            console.error('[IELTSExam] Invalid module:', moduleName);
            return;
        }
        
        this.currentModule = moduleName;
        this.currentQuestion = 0;
        this.answers.clear();
        this.audioPlayed.clear();
        this.timeRemaining = this.modules[moduleName].timeLimit;
        this.examActive = true;
        
        // Start timer
        this.startTimer();
        
        // Load first question/passage
        this.loadContent(0);
        
        console.log('[IELTSExam] Started module:', moduleName);
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
        
        const timerElement = document.getElementById('ielts-timer');
        if (timerElement) {
            timerElement.textContent = display;
            
            if (this.timeRemaining < 300) {
                timerElement.classList.add('text-red-500');
            }
        }
    }
    
    /**
     * Load content based on module
     */
    loadContent(index) {
        this.currentQuestion = index;
        
        switch (this.currentModule) {
            case 'reading':
                this.loadReadingPassage(index);
                break;
            case 'listening':
                this.loadListeningSection(index);
                break;
            case 'speaking':
                this.loadSpeakingPart(index);
                break;
            case 'writing':
                this.loadWritingTask(index);
                break;
        }
    }
    
    /**
     * Load reading passage with split-screen layout
     */
    loadReadingPassage(index) {
        const passageContainer = document.getElementById('reading-passage');
        const questionsContainer = document.getElementById('reading-questions');
        
        if (!passageContainer || !questionsContainer) return;
        
        // Implementation would load passage and questions from backend
        console.log('[IELTSExam] Loading reading passage:', index);
        
        // Enable text highlighting
        this.enableTextHighlighting(passageContainer);
    }
    
    /**
     * Enable text highlighting for reading passages
     */
    enableTextHighlighting(container) {
        container.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            if (selection.toString().trim()) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.className = 'bg-yellow-200';
                
                try {
                    range.surroundContents(span);
                    selection.removeAllRanges();
                } catch (error) {
                    // Handle overlapping selections
                    console.warn('[IELTSExam] Cannot highlight overlapping text');
                }
            }
        });
    }
    
    /**
     * Load listening section with audio
     */
    loadListeningSection(index) {
        const audioContainer = document.getElementById('listening-audio');
        const questionsContainer = document.getElementById('listening-questions');
        
        if (!audioContainer || !questionsContainer) return;
        
        // Create audio element if not exists
        if (!this.audioElement) {
            this.audioElement = document.createElement('audio');
            this.audioElement.className = 'w-full';
            this.audioElement.controls = true;
            audioContainer.appendChild(this.audioElement);
            
            // Lock audio after first play
            this.audioElement.addEventListener('play', () => {
                if (this.audioPlayed.has(index)) {
                    this.audioElement.pause();
                    alert('Audio can only be played once');
                    return;
                }
                this.audioPlayed.add(index);
            });
        }
        
        // Load audio file
        // Implementation would load audio from backend
        console.log('[IELTSExam] Loading listening section:', index);
    }
    
    /**
     * Load speaking part
     */
    loadSpeakingPart(index) {
        const speakingContainer = document.getElementById('speaking-container');
        
        if (!speakingContainer) return;
        
        // Setup recording interface
        this.setupRecordingInterface();
        
        console.log('[IELTSExam] Loading speaking part:', index);
    }
    
    /**
     * Setup recording interface for speaking module
     */
    setupRecordingInterface() {
        const recordButton = document.getElementById('record-button');
        const stopButton = document.getElementById('stop-button');
        const playbackButton = document.getElementById('playback-button');
        
        if (recordButton) {
            recordButton.onclick = () => this.startRecording();
        }
        
        if (stopButton) {
            stopButton.onclick = () => this.stopRecording();
        }
        
        if (playbackButton) {
            playbackButton.onclick = () => this.playRecording();
        }
    }
    
    /**
     * Start audio recording
     */
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.processRecording(audioBlob);
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI
            document.getElementById('record-button').classList.add('hidden');
            document.getElementById('stop-button').classList.remove('hidden');
            
            console.log('[IELTSExam] Recording started');
        } catch (error) {
            console.error('[IELTSExam] Microphone access denied:', error);
            alert('Microphone access is required for the Speaking test');
        }
    }
    
    /**
     * Stop audio recording
     */
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop all tracks
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            // Update UI
            document.getElementById('record-button').classList.remove('hidden');
            document.getElementById('stop-button').classList.add('hidden');
            document.getElementById('playback-button').classList.remove('hidden');
            
            console.log('[IELTSExam] Recording stopped');
        }
    }
    
    /**
     * Process recording with Whisper analysis
     */
    async processRecording(audioBlob) {
        try {
            console.log('[IELTSExam] Processing recording with Whisper...');
            
            // Transcribe using Whisper
            const transcription = await localAIModels.transcribeAudio(audioBlob, 'en');
            
            // Grade the response
            const question = this.getCurrentSpeakingQuestion();
            const grading = await localAIModels.gradeIELTSSpeaking(transcription, question);
            
            // Display results
            this.displaySpeakingResults(grading);
            
            console.log('[IELTSExam] Speaking analysis complete:', grading);
        } catch (error) {
            console.error('[IELTSExam] Recording processing failed:', error);
        }
    }
    
    /**
     * Get current speaking question
     */
    getCurrentSpeakingQuestion() {
        // Implementation would return current question text
        return "Tell me about your hometown.";
    }
    
    /**
     * Display speaking results
     */
    displaySpeakingResults(grading) {
        const resultsContainer = document.getElementById('speaking-results');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-lg">
                <h3 class="text-xl font-bold mb-4">Speaking Assessment</h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-blue-50 p-4 rounded">
                        <div class="text-sm text-gray-600">Overall Band</div>
                        <div class="text-3xl font-bold text-blue-600">${grading.overallBand}</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded">
                        <div class="text-sm text-gray-600">Fluency</div>
                        <div class="text-2xl font-bold text-green-600">${grading.fluency}</div>
                    </div>
                    <div class="bg-purple-50 p-4 rounded">
                        <div class="text-sm text-gray-600">Vocabulary</div>
                        <div class="text-2xl font-bold text-purple-600">${grading.vocabulary}</div>
                    </div>
                    <div class="bg-orange-50 p-4 rounded">
                        <div class="text-sm text-gray-600">Grammar</div>
                        <div class="text-2xl font-bold text-orange-600">${grading.grammar}</div>
                    </div>
                </div>
                <div class="mt-4 p-4 bg-gray-50 rounded">
                    <div class="text-sm text-gray-600 mb-2">Transcription:</div>
                    <div class="text-gray-800">${grading.transcription}</div>
                </div>
                <div class="mt-4 p-4 bg-blue-50 rounded">
                    <div class="text-sm text-gray-600 mb-2">Feedback:</div>
                    <div class="text-gray-800">${grading.feedback}</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Play recorded audio
     */
    playRecording() {
        if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audio.play();
        }
    }
    
    /**
     * Load writing task
     */
    loadWritingTask(index) {
        const taskContainer = document.getElementById('writing-task');
        const answerArea = document.getElementById('writing-answer');
        
        if (!taskContainer || !answerArea) return;
        
        // Implementation would load writing task from backend
        console.log('[IELTSExam] Loading writing task:', index);
    }
    
    /**
     * Save answer for current question
     */
    saveAnswer(answer) {
        this.answers.set(this.currentQuestion, answer);
        console.log('[IELTSExam] Answer saved for question:', this.currentQuestion);
    }
    
    /**
     * Navigate to next question
     */
    nextQuestion() {
        const maxQuestions = this.modules[this.currentModule].totalQuestions;
        if (this.currentQuestion < maxQuestions - 1) {
            this.loadContent(this.currentQuestion + 1);
        }
    }
    
    /**
     * Navigate to previous question
     */
    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.loadContent(this.currentQuestion - 1);
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
        
        // Calculate band scores
        const results = this.calculateResults();
        
        // Show results
        this.showResults(results);
        
        console.log('[IELTSExam] Exam ended. Results:', results);
    }
    
    /**
     * Calculate IELTS band scores
     */
    calculateResults() {
        // Implementation would calculate band scores based on answers
        return {
            reading: 7.0,
            listening: 7.5,
            speaking: 6.5,
            writing: 7.0,
            overall: 7.0
        };
    }
    
    /**
     * Show exam results
     */
    showResults(results) {
        const resultsModal = document.getElementById('ielts-results-modal');
        if (resultsModal) {
            document.getElementById('ielts-reading-band').textContent = results.reading;
            document.getElementById('ielts-listening-band').textContent = results.listening;
            document.getElementById('ielts-speaking-band').textContent = results.speaking;
            document.getElementById('ielts-writing-band').textContent = results.writing;
            document.getElementById('ielts-overall-band').textContent = results.overall;
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
            audioPlayed: Array.from(this.audioPlayed),
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
        
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }
        
        this.examActive = false;
        console.log('[IELTSExam] Resources cleaned up');
    }
}

// Export singleton instance
export const ieltsExamSimulator = new IELTSExamSimulator();
export default ieltsExamSimulator;
