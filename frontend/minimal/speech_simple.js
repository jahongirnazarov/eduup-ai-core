/**
 * 🎤 MINIMAL SPEECH SERVICE - Web Speech API
 * Free speech recognition for IELTS Speaking
 * No external dependencies, works immediately
 */

class SimpleSpeech {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isInitialized = false;
        this.onResult = null;
        this.onError = null;
    }

    /**
     * Initialize speech recognition
     */
    initialize() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('[SimpleSpeech] Speech recognition not supported in this browser');
            this.isInitialized = false;
            return false;
        }

        // Create recognition instance
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US'; // IELTS uses English
        this.recognition.maxAlternatives = 1;

        // Set up event handlers
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (this.onResult) {
                this.onResult({
                    final: finalTranscript,
                    interim: interimTranscript,
                    isFinal: event.results[event.results.length - 1].isFinal
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.error('[SimpleSpeech] Recognition error:', event.error);
            
            if (this.onError) {
                this.onError(event.error);
            }

            // Auto-restart on certain errors
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                this.isListening = false;
            }
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                // Restart if we're supposed to be listening
                try {
                    this.recognition.start();
                } catch (e) {
                    console.warn('[SimpleSpeech] Could not restart recognition');
                    this.isListening = false;
                }
            }
        };

        this.isInitialized = true;
        console.log('[SimpleSpeech] Initialized');
        return true;
    }

    /**
     * Start listening
     */
    startListening(onResult, onError) {
        if (!this.isInitialized) {
            const success = this.initialize();
            if (!success) {
                throw new Error('Speech recognition not available');
            }
        }

        this.onResult = onResult;
        this.onError = onError;

        try {
            this.recognition.start();
            this.isListening = true;
            console.log('[SimpleSpeech] Started listening');
            return true;
        } catch (e) {
            console.error('[SimpleSpeech] Failed to start:', e);
            throw e;
        }
    }

    /**
     * Stop listening
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            console.log('[SimpleSpeech] Stopped listening');
        }
    }

    /**
     * Speak text (Text-to-Speech)
     */
    speak(text, lang = 'en-US') {
        if (!this.synthesis) {
            console.warn('[SimpleSpeech] Speech synthesis not supported');
            return false;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1.0;

        this.synthesis.speak(utterance);
        console.log('[SimpleSpeech] Speaking:', text);
        return true;
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            console.log('[SimpleSpeech] Stopped speaking');
        }
    }

    /**
     * Get available voices
     */
    getVoices() {
        if (!this.synthesis) {
            return [];
        }
        return this.synthesis.getVoices();
    }

    /**
     * Check if speech recognition is supported
     */
    isRecognitionSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    /**
     * Check if speech synthesis is supported
     */
    isSynthesisSupported() {
        return 'speechSynthesis' in window;
    }

    /**
     * Get status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isListening: this.isListening,
            recognitionSupported: this.isRecognitionSupported(),
            synthesisSupported: this.isSynthesisSupported()
        };
    }
}

// Export singleton
const simpleSpeech = new SimpleSpeech();
