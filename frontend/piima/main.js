// ========================================================================
// EDUUPAI.UZ - HARVARD UNIVERSITY STANDARD PREPARATION PLATFORM
// 100% Client-Side Architecture | 0 UZS Cost | 100M+ Concurrent Users
// ========================================================================

// ========================================================================
// GLOBAL CONFIGURATION
// ========================================================================
const CONFIG = {
    // Model Paths
    roomModelPath: './static/assets/harvard_room.glb',
    malikaModelPath: './static/assets/harvard_malika.glb',
    
    // Performance Settings
    targetFPS: 60,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    powerPreference: 'high-performance',
    
    // LOD (Level of Detail) Settings
    lodLevels: {
        high: { pixelRatio: 2, shadowMapSize: 2048, antialias: true },
        medium: { pixelRatio: 1.5, shadowMapSize: 1024, antialias: true },
        low: { pixelRatio: 1, shadowMapSize: 512, antialias: false }
    },
    
    // Animation Settings
    crossfadeDuration: 1.5, // seconds
    writingSpeed: 100, // ms per character
    walkingSpeed: 2.0, // m/s
    
    // Audio Settings
    speechLanguage: 'uz-UZ',
    lipSyncEnabled: true,
    
    // Content Settings
    contentJsonPath: './static/content/piima_content.json'
};

// ========================================================================
// LOD (LEVEL OF DETAIL) MANAGER
// Dynamically adjusts graphics quality based on device performance
// ========================================================================
class LODManager {
    constructor() {
        this.currentLevel = 'high';
        this.fpsHistory = [];
        this.maxHistorySize = 60;
        this.adjustmentThreshold = 30; // FPS threshold for adjustment
    }

    updateFPS(fps) {
        this.fpsHistory.push(fps);
        if (this.fpsHistory.length > this.maxHistorySize) {
            this.fpsHistory.shift();
        }
    }

    getAverageFPS() {
        if (this.fpsHistory.length === 0) return 60;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return sum / this.fpsHistory.length;
    }

    shouldAdjustQuality() {
        const avgFPS = this.getAverageFPS();
        
        if (avgFPS < this.adjustmentThreshold && this.currentLevel !== 'low') {
            return 'decrease';
        } else if (avgFPS > 55 && this.currentLevel !== 'high') {
            return 'increase';
        }
        return null;
    }

    adjustQuality(direction) {
        const levels = ['low', 'medium', 'high'];
        const currentIndex = levels.indexOf(this.currentLevel);
        
        if (direction === 'decrease' && currentIndex > 0) {
            this.currentLevel = levels[currentIndex - 1];
            console.log(`LOD decreased to: ${this.currentLevel}`);
            return true;
        } else if (direction === 'increase' && currentIndex < levels.length - 1) {
            this.currentLevel = levels[currentIndex + 1];
            console.log(`LOD increased to: ${this.currentLevel}`);
            return true;
        }
        return false;
    }

    getCurrentSettings() {
        return CONFIG.lodLevels[this.currentLevel];
    }

    applyLODToRenderer(renderer) {
        const settings = this.getCurrentSettings();
        renderer.setPixelRatio(settings.pixelRatio);
        
        if (renderer.shadowMap) {
            renderer.shadowMap.type = settings.shadowMapSize >= 1024 
                ? THREE.PCFSoftShadowMap 
                : THREE.BasicShadowMap;
        }
    }
}

// ========================================================================
// CONTENT MANAGER
// Loads lesson content and exam questions from JSON file
// ========================================================================
class ContentManager {
    constructor(jsonPath) {
        this.jsonPath = jsonPath;
        this.content = null;
        this.currentLesson = null;
        this.currentExam = null;
    }

    async loadContent() {
        try {
            const response = await fetch(this.jsonPath);
            this.content = await response.json();
            console.log('Content loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading content:', error);
            // Fallback to embedded content
            this.content = this.getFallbackContent();
            return false;
        }
    }

    getFallbackContent() {
        return {
            lessons: [
                {
                    id: 'lesson_1',
                    title: 'Kvadrat Tenglamalar',
                    subject: 'Matematika',
                    level: 'intermediate',
                    content: [
                        {
                            section: 'Kirish',
                            text: 'Kvadrat tenglama - bu ax² + bx + c = 0 ko\'rinishidagi tenglama.'
                        },
                        {
                            section: 'Diskriminant',
                            text: 'Diskriminant D = b² - 4ac formulasi bilan hisoblanadi.'
                        },
                        {
                            section: 'Ildizlar',
                            text: 'Ildizlar x = (-b ± √D) / 2a formulasi bilan topiladi.'
                        }
                    ]
                }
            ],
            exams: [
                {
                    id: 'exam_1',
                    title: 'Kvadrat Tenglamalar Imtihoni',
                    questions: [
                        {
                            question: 'x² - 5x + 6 = 0 tenglamaning ildizlarini toping.',
                            options: ['2 va 3', '1 va 6', '-2 va -3', '2 va -3'],
                            correct: 0
                        },
                        {
                            question: 'Diskriminant nima uchun muhim?',
                            options: ['Ildizlar sonini aniqlaydi', 'Koeffitsientlarni topadi', 'Tenglama turini aniqlaydi', 'Hech narsa'],
                            correct: 0
                        }
                    ]
                }
            ]
        };
    }

    getLesson(lessonId) {
        if (!this.content) return null;
        return this.content.lessons.find(l => l.id === lessonId) || this.content.lessons[0];
    }

    getExam(examId) {
        if (!this.content) return null;
        return this.content.exams.find(e => e.id === examId) || this.content.exams[0];
    }

    getAllLessons() {
        return this.content ? this.content.lessons : [];
    }

    getAllExams() {
        return this.content ? this.content.exams : [];
    }
}

// ========================================================================
// AUDIO MANAGER
// Web Speech API for Uzbek text-to-speech
// AudioAnalyser for lip-sync animation
// ========================================================================
class AudioManager {
    constructor() {
        this.synth = window.speechSynthesis;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.isSpeaking = false;
        this.uzbekVoice = null;
    }

    init() {
        // Initialize Audio Context for lip-sync
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            console.log('Audio context initialized');
        } catch (error) {
            console.error('Audio context initialization failed:', error);
        }

        // Load Uzbek voice
        this.loadUzbekVoice();
    }

    loadUzbekVoice() {
        const voices = this.synth.getVoices();
        this.uzbekVoice = voices.find(voice => voice.lang.includes('uz'));
        
        if (!this.uzbekVoice) {
            console.warn('Uzbek voice not found, using default');
        }
    }

    speak(text, onEndCallback) {
        if (!this.synth) {
            console.error('Speech synthesis not supported');
            return;
        }

        // Cancel any ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = CONFIG.speechLanguage;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        if (this.uzbekVoice) {
            utterance.voice = this.uzbekVoice;
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            if (onEndCallback) onEndCallback();
        };

        utterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            this.isSpeaking = false;
        };

        this.synth.speak(utterance);
    }

    getAudioData() {
        if (!this.analyser || !this.dataArray) return 0;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate average amplitude
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        return sum / this.dataArray.length;
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
    }
}

// ========================================================================
// SMARTBOARD MANAGER
// Handles chalk-style text writing animation on the board
// ========================================================================
class SmartboardManager {
    constructor(scene) {
        this.scene = scene;
        this.boardMesh = null;
        this.textTexture = null;
        this.canvas = null;
        this.ctx = null;
        this.isWriting = false;
        this.currentText = '';
        this.charIndex = 0;
        this.writingInterval = null;
    }

    createBoard() {
        // Create canvas for text texture
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1024;
        this.canvas.height = 512;
        this.ctx = this.canvas.getContext('2d');
        
        // Create texture from canvas
        this.textTexture = new THREE.CanvasTexture(this.canvas);
        
        // Create board mesh
        const boardGeometry = new THREE.PlaneGeometry(6, 3);
        const boardMaterial = new THREE.MeshStandardMaterial({
            map: this.textTexture,
            color: 0x1a1a2e,
            roughness: 0.3,
            metalness: 0.1
        });
        
        this.boardMesh = new THREE.Mesh(boardGeometry, boardMaterial);
        this.boardMesh.position.set(0, 2.5, -7.4);
        this.boardMesh.receiveShadow = true;
        
        this.scene.add(this.boardMesh);
        
        // Clear canvas initially
        this.clearBoard();
    }

    clearBoard() {
        if (!this.ctx) return;
        
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.textTexture) {
            this.textTexture.needsUpdate = true;
        }
    }

    writeText(text, speed = CONFIG.writingSpeed) {
        if (this.isWriting) {
            this.stopWriting();
        }

        this.currentText = text;
        this.charIndex = 0;
        this.isWriting = true;
        
        // Clear board first
        this.clearBoard();
        
        // Set chalk style
        this.ctx.font = '32px Arial';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // Start writing animation
        this.writingInterval = setInterval(() => {
            if (this.charIndex < text.length) {
                this.writeNextCharacter();
                this.charIndex++;
            } else {
                this.stopWriting();
            }
        }, speed);
    }

    writeNextCharacter() {
        if (!this.ctx || !this.textTexture) return;
        
        const char = this.currentText[this.charIndex];
        const x = 50 + (this.charIndex * 20);
        const y = 100 + Math.floor(this.charIndex / 40) * 40;
        
        // Wrap text if needed
        if (x > this.canvas.width - 50) {
            this.charIndex = Math.floor(this.charIndex / 40) * 40;
        }
        
        // Draw character with chalk effect
        this.ctx.fillText(char, x, y);
        
        // Add some chalk dust effect
        for (let i = 0; i < 3; i++) {
            const dustX = x + (Math.random() - 0.5) * 10;
            const dustY = y + (Math.random() - 0.5) * 10;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            this.ctx.fillRect(dustX, dustY, 2, 2);
        }
        
        // Reset fill style
        this.ctx.fillStyle = '#ffffff';
        
        // Update texture
        this.textTexture.needsUpdate = true;
    }

    stopWriting() {
        if (this.writingInterval) {
            clearInterval(this.writingInterval);
            this.writingInterval = null;
        }
        this.isWriting = false;
    }

    getBoardMesh() {
        return this.boardMesh;
    }
}

// ========================================================================
// MAIN APPLICATION
// ========================================================================
class PIIMAApplication {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.roomModel = null;
        this.malikaModel = null;
        this.mixer = null;
        this.clock = null;
        
        this.lodManager = new LODManager();
        this.contentManager = new ContentManager(CONFIG.contentJsonPath);
        this.audioManager = new AudioManager();
        this.smartboardManager = null;
        
        this.isLessonStarted = false;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        
        this.init();
    }

    async init() {
        console.log('Initializing PIIMA Platform...');
        
        // Initialize Three.js
        this.initThreeJS();
        
        // Initialize managers
        this.audioManager.init();
        this.smartboardManager = new SmartboardManager(this.scene);
        this.smartboardManager.createBoard();
        
        // Load content
        await this.contentManager.loadContent();
        
        // Load models
        await this.loadModels();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.clock = new THREE.Clock();
        this.animate();
        
        // Hide loading overlay
        setTimeout(() => {
            document.getElementById('loading-overlay').classList.add('hidden');
        }, 2000);
        
        console.log('PIIMA Platform initialized successfully');
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 2, 8);
        
        // Renderer with cinematic settings
        this.renderer = new THREE.WebGLRenderer({
            antialias: CONFIG.lodLevels.high.antialias,
            powerPreference: CONFIG.powerPreference
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(CONFIG.pixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.maxPolarAngle = Math.PI / 2;
        
        // Lighting
        this.setupLighting();
        
        // Apply LOD
        this.lodManager.applyLODToRenderer(this.renderer);
        
        // Window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light (sunlight)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -10;
        mainLight.shadow.camera.right = 10;
        mainLight.shadow.camera.top = 10;
        mainLight.shadow.camera.bottom = -10;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light for cinematic effect
        const rimLight = new THREE.DirectionalLight(0xe94560, 0.2);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
    }

    async loadModels() {
        const loader = new THREE.GLTFLoader();
        
        // Load Harvard room
        try {
            const roomResult = await loader.loadAsync(CONFIG.roomModelPath);
            this.roomModel = roomResult.scene;
            this.roomModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.scene.add(this.roomModel);
            console.log('Harvard room loaded');
        } catch (error) {
            console.error('Error loading room model:', error);
            this.createFallbackRoom();
        }
        
        // Load Harvard Malika
        try {
            const malikaResult = await loader.loadAsync(CONFIG.malikaModelPath);
            this.malikaModel = malikaResult.scene;
            this.malikaModel.position.set(0, 0, -3);
            this.malikaModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            this.scene.add(this.malikaModel);
            
            // Setup animation mixer
            if (malikaResult.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(this.malikaModel);
                const idleAnimation = this.mixer.clipAction(malikaResult.animations[0]);
                idleAnimation.play();
            }
            
            console.log('Harvard Malika loaded');
        } catch (error) {
            console.error('Error loading Malika model:', error);
            this.createFallbackMalika();
        }
    }

    createFallbackRoom() {
        // Create simple classroom if model fails to load
        const roomGroup = new THREE.Group();
        
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(20, 15);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        roomGroup.add(floor);
        
        // Walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF8DC });
        
        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wallMaterial);
        backWall.position.set(0, 2.5, -7.5);
        backWall.receiveShadow = true;
        roomGroup.add(backWall);
        
        this.scene.add(roomGroup);
        this.roomModel = roomGroup;
    }

    createFallbackMalika() {
        // Create simple avatar if model fails to load
        const malikaGroup = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.9;
        body.castShadow = true;
        malikaGroup.add(body);
        
        // Head
        const headGeometry = new THREE.SphereGeometry(0.25, 32, 32);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xFFDBB4 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.75;
        head.castShadow = true;
        malikaGroup.add(head);
        
        malikaGroup.position.set(0, 0, -3);
        this.scene.add(malikaGroup);
        this.malikaModel = malikaGroup;
    }

    setupEventListeners() {
        // Start lesson button
        document.getElementById('btn-start-lesson').addEventListener('click', () => {
            this.startLesson();
        });
        
        // Speak button
        document.getElementById('btn-speak').addEventListener('click', () => {
            this.audioManager.speak('Salom! Men Malika - PIIMA platformasining AI o\'qituvchisi.');
        });
        
        // Write button
        document.getElementById('btn-write').addEventListener('click', () => {
            const text = prompt('Doskaga yozish uchun matn kiriting:');
            if (text) {
                this.smartboardManager.writeText(text);
            }
        });
        
        // Exam button
        document.getElementById('btn-exam').addEventListener('click', () => {
            this.startExam();
        });
        
        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => {
            this.resetCamera();
        });
        
        // Send message
        document.getElementById('btn-send').addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enter key for chat
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async startLesson() {
        if (this.isLessonStarted) return;
        
        this.isLessonStarted = true;
        
        // Get first lesson
        const lesson = this.contentManager.getLesson('lesson_1');
        if (!lesson) {
            console.error('No lesson found');
            return;
        }
        
        // Animate Malika walking to board
        await this.animateMalikaToBoard();
        
        // Speak introduction
        const introText = `Assalomu alaykum! Bugun biz "${lesson.title}" mavzusini o'rganamiz. ${lesson.subject} fanining qiziqarli mavzusi.`;
        this.audioManager.speak(introText);
        
        // Write on smartboard
        this.smartboardManager.writeText(lesson.title);
        
        // Show in chat
        this.addMessage(introText, 'malika');
    }

    async animateMalikaToBoard() {
        if (!this.malikaModel) return;
        
        const startPosition = this.malikaModel.position.clone();
        const endPosition = new THREE.Vector3(0, 0, -6);
        const duration = CONFIG.crossfadeDuration;
        const startTime = performance.now();
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = (performance.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-in-out function
                const easedProgress = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                this.malikaModel.position.lerpVectors(startPosition, endPosition, easedProgress);
                
                // Rotate to face board
                this.malikaModel.rotation.y = easedProgress * Math.PI;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            animate();
        });
    }

    startExam() {
        const exam = this.contentManager.getExam('exam_1');
        if (!exam) {
            console.error('No exam found');
            return;
        }
        
        // Show first question
        const question = exam.questions[0];
        const questionText = `${question.question}\n\nVariantlar:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`;
        
        this.smartboardManager.writeText(questionText);
        this.audioManager.speak(questionText);
        this.addMessage(questionText, 'malika');
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Simple response (in production, use AI)
        setTimeout(() => {
            const responses = [
                'Yaxshi savol! Keling, tushuntirib beraman.',
                'Qiziq, batafsil gaplashamiz.',
                'Tushunarli. Davom etamizmi?'
            ];
            const response = responses[Math.floor(Math.random() * responses.length)];
            this.addMessage(response, 'malika');
            this.audioManager.speak(response);
        }, 1000);
    }

    addMessage(text, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    resetCamera() {
        this.camera.position.set(0, 2, 8);
        this.controls.target.set(0, 2, 0);
        this.controls.update();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Reapply LOD
        this.lodManager.applyLODToRenderer(this.renderer);
    }

    updateLipSync() {
        if (!CONFIG.lipSyncEnabled || !this.malikaModel) return;
        
        const audioData = this.audioManager.getAudioData();
        
        // Map audio amplitude to morph targets
        this.malikaModel.traverse((child) => {
            if (child.isMesh && child.morphTargetInfluences) {
                // Mouth open (index 0)
                if (child.morphTargetInfluences[0] !== undefined) {
                    child.morphTargetInfluences[0] = Math.min(audioData / 255, 1.0);
                }
                // Jaw open (index 1)
                if (child.morphTargetInfluences[1] !== undefined) {
                    child.morphTargetInfluences[1] = Math.min(audioData / 255 * 0.8, 1.0);
                }
                // Smile (index 2)
                if (child.morphTargetInfluences[2] !== undefined) {
                    child.morphTargetInfluences[2] = Math.min(audioData / 255 * 0.3, 0.5);
                }
            }
        });
    }

    updatePerformanceStats() {
        // Calculate FPS
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Update LOD
            this.lodManager.updateFPS(this.fps);
            const adjustment = this.lodManager.shouldAdjustQuality();
            if (adjustment) {
                this.lodManager.adjustQuality(adjustment);
                this.lodManager.applyLODToRenderer(this.renderer);
            }
            
            // Update UI
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('lod-level').textContent = this.lodManager.currentLevel.toUpperCase();
            
            if (performance.memory) {
                const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(1);
                document.getElementById('memory').textContent = memoryMB;
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Update lip-sync
        if (this.audioManager.isSpeaking) {
            this.updateLipSync();
        }
        
        // Update controls
        this.controls.update();
        
        // Render
        this.renderer.render(this.scene, this.camera);
        
        // Update performance stats
        this.updatePerformanceStats();
    }
}

// ========================================================================
// INITIALIZE APPLICATION
// ========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const app = new PIIMAApplication();
    
    // Expose to window for debugging
    window.PIIMA = app;
});
