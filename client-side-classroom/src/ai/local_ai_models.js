/**
 * Local AI Models - Client-Side Neural Networks
 * =============================================
 * 100% Free AI Processing using:
 * - Whisper-Tiny for Speech-to-Text
 * - all-MiniLM-L6-v2 for Text Semantic Analysis
 * - WebLLM for Local LLM Inference
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

class LocalAIModels {
    constructor() {
        this.whisperModel = null;
        this.minilmModel = null;
        this.webllmEngine = null;
        this.isInitialized = false;
        this.initPromise = null;
    }

    /**
     * Initialize all local AI models
     */
    async initialize() {
        if (this.isInitialized) {
            return this.initPromise;
        }

        this.initPromise = (async () => {
            console.log('[LocalAI] Initializing client-side AI models...');

            try {
                // Initialize Whisper-Tiny for Speech-to-Text
                console.log('[LocalAI] Loading Whisper-Tiny model...');
                this.whisperModel = await pipeline(
                    'automatic-speech-recognition',
                    'Xenova/whisper-tiny',
                    {
                        quantized: true,
                        progress_callback: (progress) => {
                            if (progress.status === 'progress') {
                                console.log(`[Whisper] Loading: ${progress.progress.toFixed(1)}%`);
                            }
                        }
                    }
                );
                console.log('[LocalAI] Whisper-Tiny loaded successfully');

                // Initialize all-MiniLM-L6-v2 for Text Semantic Analysis
                console.log('[LocalAI] Loading all-MiniLM-L6-v2 model...');
                this.minilmModel = await pipeline(
                    'feature-extraction',
                    'Xenova/all-MiniLM-L6-v2',
                    {
                        quantized: true,
                        progress_callback: (progress) => {
                            if (progress.status === 'progress') {
                                console.log(`[MiniLM] Loading: ${progress.progress.toFixed(1)}%`);
                            }
                        }
                    }
                );
                console.log('[LocalAI] all-MiniLM-L6-v2 loaded successfully');

                // Initialize WebLLM if WebGPU is available
                if (this.checkWebGPUSupport()) {
                    console.log('[LocalAI] WebGPU available, initializing WebLLM...');
                    await this.initializeWebLLM();
                } else {
                    console.log('[LocalAI] WebGPU not available, skipping WebLLM');
                }

                this.isInitialized = true;
                console.log('[LocalAI] All models initialized successfully');
            } catch (error) {
                console.error('[LocalAI] Initialization error:', error);
                throw error;
            }
        })();

        return this.initPromise;
    }

    /**
     * Check WebGPU support
     */
    checkWebGPUSupport() {
        if (!navigator.gpu) {
            return false;
        }
        return true;
    }

    /**
     * Initialize WebLLM for local LLM inference
     */
    async initializeWebLLM() {
        try {
            // Dynamic import of WebLLM to avoid build issues
            const { CreateMLCEngine } = await import('@mlc-ai/web-llm');

            this.webllmEngine = await CreateMLCEngine(
                {
                    model: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
                    initProgressCallback: (report) => {
                        console.log(`[WebLLM] ${report.text}`);
                    }
                }
            );

            console.log('[LocalAI] WebLLM initialized successfully');
        } catch (error) {
            console.error('[LocalAI] WebLLM initialization error:', error);
            console.log('[LocalAI] Will use fallback for LLM features');
        }
    }

    /**
     * Transcribe audio using Whisper-Tiny
     * @param {Blob|File} audioBlob - Audio file to transcribe
     * @param {string} language - Language code (default: 'en')
     * @returns {Promise<string>} Transcribed text
     */
    async transcribeAudio(audioBlob, language = 'en') {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            console.log('[Whisper] Starting transcription...');

            // Convert audio blob to URL
            const audioUrl = URL.createObjectURL(audioBlob);

            // Run Whisper transcription
            const result = await this.whisperModel(audioUrl, {
                language: language,
                task: 'transcribe',
                chunk_length_s: 30,
                stride_length_s: 5
            });

            // Clean up
            URL.revokeObjectURL(audioUrl);

            console.log('[Whisper] Transcription complete:', result.text);
            return result.text;
        } catch (error) {
            console.error('[Whisper] Transcription error:', error);
            throw error;
        }
    }

    /**
     * Extract text embeddings using all-MiniLM-L6-v2
     * @param {string} text - Text to embed
     * @returns {Promise<number[]>} Text embedding vector
     */
    async getTextEmbedding(text) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const output = await this.minilmModel(text, {
                pooling: 'mean',
                normalize: true
            });

            // Convert to array
            const embedding = Array.from(output.data);
            return embedding;
        } catch (error) {
            console.error('[MiniLM] Embedding error:', error);
            throw error;
        }
    }

    /**
     * Calculate cosine similarity between two embeddings
     * @param {number[]} embedding1 - First embedding
     * @param {number[]} embedding2 - Second embedding
     * @returns {number} Similarity score (0-1)
     */
    calculateCosineSimilarity(embedding1, embedding2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }

        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);

        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }

        return dotProduct / (norm1 * norm2);
    }

    /**
     * Compare student answer with model answer
     * @param {string} studentAnswer - Student's answer
     * @param {string} modelAnswer - Model answer
     * @returns {Promise<Object>} Comparison result with similarity score
     */
    async compareAnswers(studentAnswer, modelAnswer) {
        try {
            console.log('[MiniLM] Comparing answers...');

            // Get embeddings
            const studentEmbedding = await this.getTextEmbedding(studentAnswer);
            const modelEmbedding = await this.getTextEmbedding(modelAnswer);

            // Calculate similarity
            const similarity = this.calculateCosineSimilarity(studentEmbedding, modelEmbedding);

            console.log('[MiniLM] Similarity score:', similarity);

            return {
                similarity: similarity,
                studentAnswer: studentAnswer,
                modelAnswer: modelAnswer,
                score: this.similarityToScore(similarity)
            };
        } catch (error) {
            console.error('[MiniLM] Comparison error:', error);
            throw error;
        }
    }

    /**
     * Convert similarity score to grade (0-9 for IELTS, 0-100 for SAT)
     * @param {number} similarity - Similarity score (0-1)
     * @param {string} examType - 'ielts' or 'sat'
     * @returns {number} Grade score
     */
    similarityToScore(similarity, examType = 'ielts') {
        if (examType === 'ielts') {
            // IELTS band score (0-9)
            return Math.round(similarity * 9);
        } else {
            // SAT score (0-100)
            return Math.round(similarity * 100);
        }
    }

    /**
     * Generate response using WebLLM
     * @param {string} prompt - Input prompt
     * @returns {Promise<string>} Generated response
     */
    async generateLLMResponse(prompt) {
        if (!this.webllmEngine) {
            console.warn('[WebLLM] Not available, using fallback');
            return this.generateFallbackResponse(prompt);
        }

        try {
            const response = await this.webllmEngine.chat.completions.create({
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content;
        } catch (error) {
            console.error('[WebLLM] Generation error:', error);
            return this.generateFallbackResponse(prompt);
        }
    }

    /**
     * Fallback response generator when WebLLM is unavailable
     * @param {string} prompt - Input prompt
     * @returns {string} Fallback response
     */
    generateFallbackResponse(prompt) {
        // Simple rule-based fallback
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('help') || lowerPrompt.includes('explain')) {
            return "I'd be happy to help explain this concept. Let me break it down step by step.";
        } else if (lowerPrompt.includes('example')) {
            return "Here's an example that might help illustrate this concept.";
        } else if (lowerPrompt.includes('question')) {
            return "That's a great question! Let me think about the best way to answer it.";
        } else {
            return "I understand. Let me provide a helpful response based on what you've asked.";
        }
    }

    /**
     * Grade IELTS Speaking response
     * @param {string} transcription - Transcribed speech
     * @param {string} question - Original question
     * @returns {Promise<Object>} Grading result with band scores
     */
    async gradeIELTSSpeaking(transcription, question) {
        try {
            console.log('[LocalAI] Grading IELTS Speaking...');

            // Get embedding similarity
            const comparison = await this.compareAnswers(transcription, question);

            // Calculate fluency (based on word count and length)
            const wordCount = transcription.split(/\s+/).length;
            const fluencyScore = Math.min(9, Math.floor(wordCount / 10));

            // Calculate vocabulary diversity
            const uniqueWords = new Set(transcription.toLowerCase().split(/\s+/));
            const vocabularyScore = Math.min(9, Math.floor((uniqueWords.size / wordCount) * 10));

            // Calculate grammar (simple heuristic)
            const grammarScore = Math.min(9, Math.floor(comparison.similarity * 10));

            // Overall band score
            const overallBand = Math.round(
                (fluencyScore + vocabularyScore + grammarScore + comparison.score) / 4
            );

            return {
                overallBand: overallBand,
                fluency: fluencyScore,
                vocabulary: vocabularyScore,
                grammar: grammarScore,
                coherence: comparison.score,
                transcription: transcription,
                feedback: this.generateIELTSFeedback(overallBand)
            };
        } catch (error) {
            console.error('[LocalAI] Grading error:', error);
            throw error;
        }
    }

    /**
     * Generate IELTS feedback based on band score
     * @param {number} bandScore - IELTS band score
     * @returns {string} Feedback message
     */
    generateIELTSFeedback(bandScore) {
        if (bandScore >= 8) {
            return "Excellent! Your response demonstrates strong fluency, vocabulary, and coherence.";
        } else if (bandScore >= 6) {
            return "Good response. You show solid understanding with some room for improvement in vocabulary and coherence.";
        } else if (bandScore >= 4) {
            return "Fair response. Focus on expanding your vocabulary and improving sentence structure.";
        } else {
            return "Keep practicing. Work on basic fluency and try to use more varied vocabulary.";
        }
    }

    /**
     * Get initialization status
     * @returns {boolean} Whether models are initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get model status information
     * @returns {Object} Status of all models
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            whisperLoaded: this.whisperModel !== null,
            minilmLoaded: this.minilmModel !== null,
            webllmLoaded: this.webllmEngine !== null,
            webgpuSupported: this.checkWebGPUSupport()
        };
    }
}

// Export singleton instance
export const localAIModels = new LocalAIModels();
export default localAIModels;
