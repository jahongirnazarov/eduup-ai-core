/**
 * 🧠 LOCAL AI ENGINE - Client-Side AI Inference
 * Zero API costs using ONNX Runtime Web and Transformers.js
 * Supports Microsoft Phi-3-mini, Google Gemma-2B, Qwen2.5-1.5B models
 */

class LocalAIEngine {
    constructor() {
        this.model = null;
        this.tokenizer = null;
        this.isInitialized = false;
        this.modelType = 'phi-3-mini'; // Default model
        this.isStreaming = false;
    }

    /**
     * Initialize local AI model
     * @param {string} modelType - Model type: 'phi-3-mini', 'gemma-2b', 'qwen-1.5b'
     */
    async initialize(modelType = 'phi-3-mini') {
        try {
            this.modelType = modelType;
            console.log(`[LocalAI] Initializing ${modelType} model...`);

            // Load Transformers.js and ONNX Runtime Web
            if (typeof transformers === 'undefined') {
                await this.loadTransformersJS();
            }

            // Initialize model based on type
            switch (modelType) {
                case 'phi-3-mini':
                    await this.loadPhi3Mini();
                    break;
                case 'gemma-2b':
                    await this.loadGemma2B();
                    break;
                case 'qwen-1.5b':
                    await this.loadQwen15B();
                    break;
                default:
                    throw new Error(`Unknown model type: ${modelType}`);
            }

            this.isInitialized = true;
            console.log(`[LocalAI] ${modelType} model initialized successfully`);
            return true;
        } catch (error) {
            console.error('[LocalAI] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load Transformers.js library
     */
    async loadTransformersJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Load Microsoft Phi-3-mini model (100-200MB)
     */
    async loadPhi3Mini() {
        const model_id = 'microsoft/Phi-3-mini-4k-instruct-onnx';
        
        // Initialize pipeline
        this.model = await window.transformers.pipeline(
            'text-generation',
            model_id,
            {
                dtype: 'q4', // Quantized for smaller size
                device: this.getBestDevice(),
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        console.log(`[LocalAI] Loading model: ${progress.progress.toFixed(1)}%`);
                    }
                }
            }
        );
    }

    /**
     * Load Google Gemma-2B model (100-150MB)
     */
    async loadGemma2B() {
        const model_id = 'google/gemma-2b-it';
        
        this.model = await window.transformers.pipeline(
            'text-generation',
            model_id,
            {
                dtype: 'q4',
                device: this.getBestDevice(),
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        console.log(`[LocalAI] Loading model: ${progress.progress.toFixed(1)}%`);
                    }
                }
            }
        );
    }

    /**
     * Load Qwen2.5-1.5B model (80-120MB)
     */
    async loadQwen15B() {
        const model_id = 'Qwen/Qwen2.5-1.5B-Instruct-O4';
        
        this.model = await window.transformers.pipeline(
            'text-generation',
            model_id,
            {
                dtype: 'q4',
                device: this.getBestDevice(),
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        console.log(`[LocalAI] Loading model: ${progress.progress.toFixed(1)}%`);
                    }
                }
            }
        );
    }

    /**
     * Get best available device for inference
     * Priority: WebGPU > WebNN > WASM
     */
    getBestDevice() {
        // Check for WebGPU support
        if (navigator.gpu) {
            console.log('[LocalAI] Using WebGPU for inference');
            return 'webgpu';
        }
        
        // Check for WebNN support
        if (navigator.ml) {
            console.log('[LocalAI] Using WebNN for inference');
            return 'webnn';
        }
        
        // Fallback to WASM
        console.log('[LocalAI] Using WASM for inference');
        return 'wasm';
    }

    /**
     * Generate response with streaming
     * @param {string} prompt - Input prompt
     * @param {function} onChunk - Callback for streaming chunks
     * @param {object} options - Generation options
     */
    async generate(prompt, onChunk, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Model not initialized. Call initialize() first.');
        }

        this.isStreaming = true;
        const defaultOptions = {
            max_new_tokens: 512,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.95,
            ...options
        };

        try {
            // Generate with streaming
            const output = await this.model(prompt, {
                ...defaultOptions,
                callback_function: (output) => {
                    if (onChunk && output[0].generated_token_ids !== null) {
                        const chunk = this.model.tokenizer.decode(output[0].generated_token_ids);
                        onChunk(chunk);
                    }
                }
            });

            this.isStreaming = false;
            return output[0].generated_text;
        } catch (error) {
            this.isStreaming = false;
            console.error('[LocalAI] Generation failed:', error);
            throw error;
        }
    }

    /**
     * Generate response without streaming
     * @param {string} prompt - Input prompt
     * @param {object} options - Generation options
     */
    async generateSync(prompt, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Model not initialized. Call initialize() first.');
        }

        const defaultOptions = {
            max_new_tokens: 512,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.95,
            ...options
        };

        try {
            const output = await this.model(prompt, defaultOptions);
            return output[0].generated_text;
        } catch (error) {
            console.error('[LocalAI] Generation failed:', error);
            throw error;
        }
    }

    /**
     * Stop current generation
     */
    stopGeneration() {
        this.isStreaming = false;
    }

    /**
     * Check if model is ready
     */
    isReady() {
        return this.isInitialized && this.model !== null;
    }

    /**
     * Get model info
     */
    getModelInfo() {
        return {
            type: this.modelType,
            isInitialized: this.isInitialized,
            device: this.getBestDevice()
        };
    }

    /**
     * Clear model from memory
     */
    async dispose() {
        if (this.model) {
            await this.model.dispose();
            this.model = null;
        }
        this.isInitialized = false;
        console.log('[LocalAI] Model disposed from memory');
    }
}

// Export singleton instance
const localAIEngine = new LocalAIEngine();
