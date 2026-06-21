/**
 * 🎤 WEB SPEECH API SERVICE - Free STT/TTS
 * Zero API costs using browser's built-in Web Speech API
 * Supports IELTS Speaking conversation and text-to-speech
 */

class WebSpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.onResult = null;
        this.onEnd = null;
        this.onError = null;
        this.currentVoice = null;
        this.voices = [];
        
        // IELTS Speaking specific settings
        this.speakingTestConfig = {
            language: 'en-US',
            continuous: true,
            interimResults: true,
            maxAlternatives: 1
        };
    }

    /**
     * Initialize Web Speech Service
     */
    async initialize() {
        try {
            // Check browser support
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                throw new Error('Speech recognition not supported in this browser');
            }

            if (!('speechSynthesis' in window)) {
                throw new Error('Speech synthesis not supported in this browser');
            }

            // Initialize speech recognition
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.setupRecognition();

            // Load voices
            await this.loadVoices();

            console.log('[WebSpeech] Web Speech Service initialized successfully');
            return true;
        } catch (error) {
            console.error('[WebSpeech] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup speech recognition
     */
    setupRecognition() {
        this.recognition.continuous = this.speakingTestConfig.continuous;
        this.recognition.interimResults = this.speakingTestConfig.interimResults;
        this.recognition.lang = this.speakingTestConfig.language;
        this.recognition.maxAlternatives = this.speakingTestConfig.maxAlternatives;

        this.recognition.onresult = (event) => {
            let transcript = '';
            let isFinal = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }

            if (this.onResult) {
                this.onResult(transcript, isFinal);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onEnd) {
                this.onEnd();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('[WebSpeech] Recognition error:', event.error);
            this.isListening = false;
            if (this.onError) {
                this.onError(event.error);
            }
        };
    }

    /**
     * Load available voices
     */
    async loadVoices() {
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = this.synthesis.getVoices();
                
                // Set default English voice
                this.currentVoice = this.voices.find(voice => 
                    voice.lang.startsWith('en') && voice.name.includes('Google')
                ) || this.voices.find(voice => voice.lang.startsWith('en')) || this.voices[0];
                
                console.log(`[WebSpeech] Loaded ${this.voices.length} voices`);
                resolve();
            };

            if (this.synthesis.getVoices().length > 0) {
                loadVoices();
            } else {
                this.synthesis.onvoiceschanged = loadVoices;
            }
        });
    }

    /**
     * Start speech recognition
     * @param {object} config - Recognition configuration
     */
    startListening(config = {}) {
        if (this.isListening) {
            console.warn('[WebSpeech] Already listening');
            return;
        }

        // Update config if provided
        if (config.language) {
            this.recognition.lang = config.language;
        }
        if (config.continuous !== undefined) {
            this.recognition.continuous = config.continuous;
        }
        if (config.interimResults !== undefined) {
            this.recognition.interimResults = config.interimResults;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            console.log('[WebSpeech] Started listening');
        } catch (error) {
            console.error('[WebSpeech] Failed to start listening:', error);
            throw error;
        }
    }

    /**
     * Stop speech recognition
     */
    stopListening() {
        if (!this.isListening) {
            console.warn('[WebSpeech] Not listening');
            return;
        }

        this.recognition.stop();
        this.isListening = false;
        console.log('[WebSpeech] Stopped listening');
    }

    /**
     * Speak text using speech synthesis
     * @param {string} text - Text to speak
     * @param {object} options - Speaking options
     */
    speak(text, options = {}) {
        if (!text) {
            console.warn('[WebSpeech] No text to speak');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        if (options.voice) {
            utterance.voice = options.voice;
        } else if (this.currentVoice) {
            utterance.voice = this.currentVoice;
        }

        // Set speaking options
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        utterance.lang = options.language || 'en-US';

        // IELTS Speaking specific settings
        if (options.isIELTS) {
            utterance.rate = 0.9; // Slightly slower for clarity
            utterance.pitch = 1.0; // Natural pitch
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            console.log('[WebSpeech] Started speaking');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            console.log('[WebSpeech] Finished speaking');
            if (options.onEnd) {
                options.onEnd();
            }
        };

        utterance.onerror = (event) => {
            console.error('[WebSpeech] Speech synthesis error:', event.error);
            this.isSpeaking = false;
            if (options.onError) {
                options.onError(event.error);
            }
        };

        this.synthesis.speak(utterance);
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            console.log('[WebSpeech] Stopped speaking');
        }
    }

    /**
     * Set voice by language
     * @param {string} language - Language code (e.g., 'en-US', 'en-GB')
     */
    setVoice(language) {
        const voice = this.voices.find(v => v.lang === language) || 
                      this.voices.find(v => v.lang.startsWith(language.split('-')[0]));
        
        if (voice) {
            this.currentVoice = voice;
            console.log(`[WebSpeech] Set voice to: ${voice.name} (${voice.lang})`);
        } else {
            console.warn(`[WebSpeech] No voice found for language: ${language}`);
        }
    }

    /**
     * Get available voices
     */
    getAvailableVoices() {
        return this.voices;
    }

    /**
     * Get current voice
     */
    getCurrentVoice() {
        return this.currentVoice;
    }

    /**
     * Check if listening
     */
    getIsListening() {
        return this.isListening;
    }

    /**
     * Check if speaking
     */
    getIsSpeaking() {
        return this.isSpeaking;
    }

    /**
     * Set callbacks
     * @param {object} callbacks - Callback functions
     */
    setCallbacks(callbacks) {
        if (callbacks.onResult) {
            this.onResult = callbacks.onResult;
        }
        if (callbacks.onEnd) {
            this.onEnd = callbacks.onEnd;
        }
        if (callbacks.onError) {
            this.onError = callbacks.onError;
        }
    }

    /**
     * IELTS Speaking Test - Start conversation
     * @param {string} examinerPrompt - Examiner's prompt
     */
    async startIELTSSpeakingTest(examinerPrompt) {
        // Speak examiner's prompt
        this.speak(examinerPrompt, {
            isIELTS: true,
            onEnd: () => {
                // Start listening for student response
                this.startListening({
                    language: 'en-US',
                    continuous: true,
                    interimResults: true
                });
            }
        });
    }

    /**
     * IELTS Speaking Test - Stop conversation
     */
    stopIELTSSpeakingTest() {
        this.stopListening();
        this.stopSpeaking();
    }

    /**
     * Get speech recognition status
     */
    getStatus() {
        return {
            isListening: this.isListening,
            isSpeaking: this.isSpeaking,
            currentVoice: this.currentVoice ? this.currentVoice.name : null,
            language: this.recognition ? this.recognition.lang : null,
            voicesAvailable: this.voices.length
        };
    }

    /**
     * Destroy service
     */
    destroy() {
        this.stopListening();
        this.stopSpeaking();
        this.recognition = null;
        this.onResult = null;
        this.onEnd = null;
        this.onError = null;
        console.log('[WebSpeech] Service destroyed');
    }
}

// Export singleton instance
const webSpeechService = new WebSpeechService();
