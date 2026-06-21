/**
 * Lip-Sync System - AudioContext AnalyserNode
 * ============================================
 * Real-time lip-sync animation using Web Audio API:
 * - Analyzes audio frequency and volume
 * - Animates mouth CSS transforms or WebGL blendshapes
 * - Syncs Malika's lips to spoken syllables in real-time
 */

class LipSyncSystem {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isPlaying = false;
        this.animationFrame = null;

        // Lip-sync parameters
        this.mouthElement = null;
        this.renderingMode = 'css3'; // 'css3' or 'webgl'
        this.sensitivity = 1.0;
        this.smoothing = 0.3;

        // Current mouth state
        this.currentMouthOpen = 0;
        this.currentMouthWidth = 0;
        this.targetMouthOpen = 0;
        this.targetMouthWidth = 0;

        // Phoneme-based animation (optional enhancement)
        this.phonemeQueue = [];
        this.currentPhoneme = null;

        console.log('[LipSync] Lip-sync system initialized');
    }

    /**
     * Initialize AudioContext
     */
    async initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = this.smoothing;

            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);

            console.log('[LipSync] AudioContext initialized');
            return true;
        } catch (error) {
            console.error('[LipSync] AudioContext initialization failed:', error);
            return false;
        }
    }

    /**
     * Set mouth element for CSS3 animation
     * @param {HTMLElement} element - Mouth DOM element
     */
    setMouthElement(element) {
        this.mouthElement = element;
        console.log('[LipSync] Mouth element set');
    }

    /**
     * Set rendering mode
     * @param {string} mode - 'css3' or 'webgl'
     */
    setRenderingMode(mode) {
        this.renderingMode = mode;
        console.log('[LipSync] Rendering mode set to:', mode);
    }

    /**
     * Set lip-sync sensitivity
     * @param {number} sensitivity - Sensitivity multiplier (0.1-2.0)
     */
    setSensitivity(sensitivity) {
        this.sensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
    }

    /**
     * Set smoothing factor
     * @param {number} smoothing - Smoothing factor (0.0-1.0)
     */
    setSmoothing(smoothing) {
        this.smoothing = Math.max(0.0, Math.min(1.0, smoothing));
        if (this.analyser) {
            this.analyser.smoothingTimeConstant = smoothing;
        }
    }

    /**
     * Start lip-sync with audio element
     * @param {HTMLAudioElement} audioElement - Audio element to analyze
     */
    async start(audioElement) {
        if (!this.audioContext) {
            await this.initialize();
        }

        try {
            // Resume AudioContext if suspended (browser requirement)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create source from audio element
            this.source = this.audioContext.createMediaElementSource(audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.isPlaying = true;
            this.startAnimation();

            console.log('[LipSync] Lip-sync started');
        } catch (error) {
            console.error('[LipSync] Failed to start lip-sync:', error);
        }
    }

    /**
     * Start lip-sync with audio buffer
     * @param {AudioBuffer} audioBuffer - Audio buffer to play
     */
    async startWithBuffer(audioBuffer) {
        if (!this.audioContext) {
            await this.initialize();
        }

        try {
            // Resume AudioContext if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Create source from buffer
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = audioBuffer;
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.source.start(0);
            this.isPlaying = true;
            this.startAnimation();

            console.log('[LipSync] Lip-sync started with buffer');
        } catch (error) {
            console.error('[LipSync] Failed to start lip-sync with buffer:', error);
        }
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        const animate = () => {
            if (!this.isPlaying) return;

            this.analyzeAudio();
            this.updateMouth();

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Analyze audio and calculate mouth parameters
     */
    analyzeAudio() {
        if (!this.analyser || !this.dataArray) return;

        // Get frequency data
        this.analyser.getByteFrequencyData(this.dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        const average = sum / this.dataArray.length;

        // Normalize to 0-1 range
        const normalizedVolume = (average / 255) * this.sensitivity;

        // Calculate mouth parameters based on volume
        this.targetMouthOpen = Math.min(1.0, normalizedVolume * 1.5);
        this.targetMouthWidth = Math.min(1.0, normalizedVolume * 0.8 + 0.2);

        // Add some randomness for natural movement
        this.targetMouthWidth += (Math.random() - 0.5) * 0.1;
    }

    /**
     * Update mouth animation based on rendering mode
     */
    updateMouth() {
        // Smooth interpolation
        this.currentMouthOpen += (this.targetMouthOpen - this.currentMouthOpen) * 0.3;
        this.currentMouthWidth += (this.targetMouthWidth - this.currentMouthWidth) * 0.3;

        if (this.renderingMode === 'css3' && this.mouthElement) {
            this.updateCSS3Mouth();
        } else if (this.renderingMode === 'webgl') {
            this.updateWebGLMouth();
        }
    }

    /**
     * Update CSS3 mouth animation
     */
    updateCSS3Mouth() {
        if (!this.mouthElement) return;

        const scaleY = 1 + this.currentMouthOpen * 0.5;
        const scaleX = 1 + this.currentMouthWidth * 0.3;

        this.mouthElement.style.transform = `scale(${scaleX}, ${scaleY})`;
        this.mouthElement.style.transition = 'transform 0.05s ease-out';
    }

    /**
     * Update WebGL mouth animation (blendshapes)
     */
    updateWebGLMouth() {
        // This would be implemented with WebGL blendshapes
        // For now, we'll emit an event that can be caught by the WebGL renderer
        const event = new CustomEvent('lipSyncUpdate', {
            detail: {
                mouthOpen: this.currentMouthOpen,
                mouthWidth: this.currentMouthWidth
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Stop lip-sync
     */
    stop() {
        this.isPlaying = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }

        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }

        // Reset mouth to closed position
        this.targetMouthOpen = 0;
        this.targetMouthWidth = 0;
        this.updateMouth();

        console.log('[LipSync] Lip-sync stopped');
    }

    /**
     * Load phoneme data for more accurate lip-sync
     * @param {Array} phonemes - Array of phoneme data with timing
     */
    loadPhonemeData(phonemes) {
        this.phonemeQueue = phonemes;
        console.log('[LipSync] Phoneme data loaded:', phonemes.length, 'phonemes');
    }

    /**
     * Get current mouth state
     */
    getMouthState() {
        return {
            open: this.currentMouthOpen,
            width: this.currentMouthWidth,
            targetOpen: this.targetMouthOpen,
            targetWidth: this.targetMouthWidth
        };
    }

    /**
     * Check if lip-sync is playing
     */
    isPlaying() {
        return this.isPlaying;
    }

    /**
     * Set mouth element for CSS3 animation (alternative method)
     * @param {string} selector - CSS selector for mouth element
     */
    setMouthBySelector(selector) {
        const element = document.querySelector(selector);
        if (element) {
            this.setMouthElement(element);
        } else {
            console.warn('[LipSync] Mouth element not found:', selector);
        }
    }

    /**
     * Create a simple mouth element if none exists
     * @param {HTMLElement} container - Container element
     */
    createDefaultMouth(container) {
        const mouth = document.createElement('div');
        mouth.style.cssText = `
            position: absolute;
            width: 30px;
            height: 15px;
            background: #8B4513;
            border-radius: 50%;
            transform-origin: center;
            transition: transform 0.05s ease-out;
        `;
        container.appendChild(mouth);
        this.setMouthElement(mouth);
        console.log('[LipSync] Default mouth element created');
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stop();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.mouthElement = null;
        this.phonemeQueue = [];

        console.log('[LipSync] Resources cleaned up');
    }

    /**
     * Get audio analysis data for debugging
     */
    getAnalysisData() {
        if (!this.dataArray) return null;

        return {
            frequencyData: Array.from(this.dataArray),
            average: this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length,
            max: Math.max(...this.dataArray),
            min: Math.min(...this.dataArray)
        };
    }
}

// Export singleton instance
export const lipSyncSystem = new LipSyncSystem();
export default lipSyncSystem;
