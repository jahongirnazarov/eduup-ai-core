/**
 * GPU Detector - WebGL/CSS3 Hybrid Avatar System
 * ===============================================
 * Detects GPU capability and decides rendering mode:
 * - High-end devices: WebGL for smooth 2D mesh deformation
 * - Low-end devices: CSS3 sprite sheet/SVG animation (0% GPU)
 */

class GPUDetector {
    constructor() {
        this.gpuInfo = null;
        this.renderingMode = 'unknown';
        this.isHighEnd = false;
        this.webglAvailable = false;
        this.webgl2Available = false;
        this.gpuMemory = 0;
        this.rendererInfo = null;

        console.log('[GPUDetector] Initializing GPU detection...');
    }

    /**
     * Detect GPU capabilities and determine rendering mode
     */
    async detect() {
        console.log('[GPUDetector] Starting GPU capability detection...');

        // Check WebGL availability
        this.webglAvailable = this.checkWebGL();
        this.webgl2Available = this.checkWebGL2();

        // Get GPU information
        if (this.webglAvailable || this.webgl2Available) {
            this.gpuInfo = this.getGPUInfo();
            this.rendererInfo = this.getRendererInfo();
            this.gpuMemory = this.estimateGPUMemory();
        }

        // Determine if device is high-end
        this.isHighEnd = this.determineHighEnd();

        // Set rendering mode based on capabilities
        this.setRenderingMode();

        console.log('[GPUDetector] Detection complete:', {
            webglAvailable: this.webglAvailable,
            webgl2Available: this.webgl2Available,
            isHighEnd: this.isHighEnd,
            renderingMode: this.renderingMode,
            gpuInfo: this.gpuInfo,
            rendererInfo: this.rendererInfo,
            gpuMemory: this.gpuMemory
        });

        return {
            webglAvailable: this.webglAvailable,
            webgl2Available: this.webgl2Available,
            isHighEnd: this.isHighEnd,
            renderingMode: this.renderingMode,
            gpuInfo: this.gpuInfo,
            rendererInfo: this.rendererInfo,
            gpuMemory: this.gpuMemory
        };
    }

    /**
     * Check if WebGL is available
     */
    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!gl;
        } catch (e) {
            console.error('[GPUDetector] WebGL check failed:', e);
            return false;
        }
    }

    /**
     * Check if WebGL2 is available
     */
    checkWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2');
            return !!gl;
        } catch (e) {
            console.error('[GPUDetector] WebGL2 check failed:', e);
            return false;
        }
    }

    /**
     * Get GPU information from WebGL context
     */
    getGPUInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

            if (!gl) return null;

            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (!debugInfo) return null;

            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

            return {
                vendor: vendor,
                renderer: renderer,
                fullString: `${vendor} ${renderer}`
            };
        } catch (e) {
            console.error('[GPUDetector] GPU info extraction failed:', e);
            return null;
        }
    }

    /**
     * Get detailed renderer information
     */
    getRendererInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');

            if (!gl) return null;

            return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
                maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
                maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
                maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)
            };
        } catch (e) {
            console.error('[GPUDetector] Renderer info extraction failed:', e);
            return null;
        }
    }

    /**
     * Estimate GPU memory based on renderer info
     */
    estimateGPUMemory() {
        if (!this.rendererInfo) return 0;

        const maxTextureSize = this.rendererInfo.maxTextureSize || 0;

        // Rough estimation based on max texture size
        // This is a heuristic, not exact
        if (maxTextureSize >= 16384) {
            return 8192; // ~8GB
        } else if (maxTextureSize >= 8192) {
            return 4096; // ~4GB
        } else if (maxTextureSize >= 4096) {
            return 2048; // ~2GB
        } else if (maxTextureSize >= 2048) {
            return 1024; // ~1GB
        } else {
            return 512; // ~512MB
        }
    }

    /**
     * Determine if device is high-end based on multiple factors
     */
    determineHighEnd() {
        // Check WebGL2 availability (modern GPUs)
        if (!this.webgl2Available) {
            return false;
        }

        // Check GPU memory
        if (this.gpuMemory < 1024) {
            return false;
        }

        // Check renderer string for known low-end GPUs
        if (this.gpuInfo) {
            const lowEndGPUs = [
                'Intel HD Graphics',
                'Intel UHD Graphics 600',
                'Intel UHD Graphics 605',
                'Mali-400',
                'Mali-450',
                'Adreno 308',
                'Adreno 306',
                'PowerVR GE8100',
                'PowerVR GE8300'
            ];

            const rendererLower = this.gpuInfo.renderer.toLowerCase();
            for (const gpu of lowEndGPUs) {
                if (rendererLower.includes(gpu.toLowerCase())) {
                    return false;
                }
            }
        }

        // Check device memory (if available)
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory < 4) {
                return false;
            }
        }

        // Check hardware concurrency (CPU cores)
        if (navigator.hardwareConcurrency) {
            if (navigator.hardwareConcurrency < 4) {
                return false;
            }
        }

        // Check for mobile device
        if (this.isMobile()) {
            // Mobile devices need higher specs to be considered high-end
            if (this.gpuMemory < 4096) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if device is mobile
     */
    isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|ipad|iphone|ipod|windows phone|iemobile|blackberry|mobile/i.test(userAgent);
    }

    /**
     * Set rendering mode based on detected capabilities
     */
    setRenderingMode() {
        if (this.isHighEnd && this.webgl2Available) {
            this.renderingMode = 'webgl2';
        } else if (this.webglAvailable) {
            this.renderingMode = 'webgl1';
        } else {
            this.renderingMode = 'css3';
        }
    }

    /**
     * Get recommended avatar rendering settings
     */
    getAvatarSettings() {
        switch (this.renderingMode) {
            case 'webgl2':
                return {
                    mode: 'webgl',
                    meshDeformation: true,
                    blendShapes: true,
                    realTimeLighting: true,
                    textureQuality: 'high',
                    animationQuality: 'high',
                    particleEffects: true,
                    postProcessing: true
                };
            case 'webgl1':
                return {
                    mode: 'webgl',
                    meshDeformation: true,
                    blendShapes: false,
                    realTimeLighting: false,
                    textureQuality: 'medium',
                    animationQuality: 'medium',
                    particleEffects: false,
                    postProcessing: false
                };
            case 'css3':
            default:
                return {
                    mode: 'css3',
                    meshDeformation: false,
                    blendShapes: false,
                    realTimeLighting: false,
                    textureQuality: 'low',
                    animationQuality: 'low',
                    particleEffects: false,
                    postProcessing: false,
                    useSpriteSheet: true,
                    useSVG: true
                };
        }
    }

    /**
     * Get performance profile for the device
     */
    getPerformanceProfile() {
        return {
            tier: this.isHighEnd ? 'high' : 'low',
            renderingMode: this.renderingMode,
            estimatedFPS: this.isHighEnd ? 60 : 30,
            maxTextureSize: this.rendererInfo?.maxTextureSize || 1024,
            gpuMemory: this.gpuMemory,
            systemMemory: navigator.deviceMemory || 'unknown',
            cpuCores: navigator.hardwareConcurrency || 'unknown',
            isMobile: this.isMobile(),
            recommendedSettings: this.getAvatarSettings()
        };
    }

    /**
     * Run performance benchmark (optional)
     */
    async runBenchmark() {
        console.log('[GPUDetector] Running performance benchmark...');

        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            return { score: 0, fps: 0 };
        }

        // Simple triangle draw benchmark
        const vertexShader = `
            attribute vec4 aVertexPosition;
            void main() {
                gl_Position = aVertexPosition;
            }
        `;

        const fragmentShader = `
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `;

        const shaderProgram = this.createShaderProgram(gl, vertexShader, fragmentShader);
        if (!shaderProgram) {
            return { score: 0, fps: 0 };
        }

        // Measure FPS
        const frameCount = 100;
        const startTime = performance.now();

        for (let i = 0; i < frameCount; i++) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const fps = (frameCount / duration) * 1000;

        console.log('[GPUDetector] Benchmark complete:', { fps, duration });

        return {
            score: Math.round(fps),
            fps: Math.round(fps),
            duration: Math.round(duration)
        };
    }

    /**
     * Create shader program for benchmark
     */
    createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
        try {
            const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

            if (!vertexShader || !fragmentShader) {
                return null;
            }

            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.error('[GPUDetector] Shader program link failed:', gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        } catch (e) {
            console.error('[GPUDetector] Shader program creation failed:', e);
            return null;
        }
    }

    /**
     * Load shader for benchmark
     */
    loadShader(gl, type, source) {
        try {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('[GPUDetector] Shader compile failed:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        } catch (e) {
            console.error('[GPUDetector] Shader load failed:', e);
            return null;
        }
    }

    /**
     * Get current rendering mode
     */
    getRenderingMode() {
        return this.renderingMode;
    }

    /**
     * Check if WebGL is available
     */
    isWebGLAvailable() {
        return this.webglAvailable;
    }

    /**
     * Check if WebGL2 is available
     */
    isWebGL2Available() {
        return this.webgl2Available;
    }

    /**
     * Check if device is high-end
     */
    isDeviceHighEnd() {
        return this.isHighEnd;
    }

    /**
     * Force rendering mode (for testing)
     */
    forceRenderingMode(mode) {
        const validModes = ['webgl2', 'webgl1', 'css3'];
        if (validModes.includes(mode)) {
            this.renderingMode = mode;
            console.log('[GPUDetector] Rendering mode forced to:', mode);
        } else {
            console.warn('[GPUDetector] Invalid rendering mode:', mode);
        }
    }
}

// Export singleton instance
export const gpuDetector = new GPUDetector();
export default gpuDetector;
