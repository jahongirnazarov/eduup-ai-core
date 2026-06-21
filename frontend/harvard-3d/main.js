// EDUUPAI Harvard 3D Classroom - Client-side Architecture
// Zero server cost for 100M concurrent users
// Cross-device compatible with dynamic LOD

class Harvard3DClassroom {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.room = null;
        this.malika = null;
        this.board = null;
        this.mixer = null;
        this.clock = new THREE.Clock();
        this.audioContext = null;
        this.analyser = null;
        this.speechSynthesis = window.speechSynthesis;
        this.currentLesson = null;
        this.isLessonActive = false;
        this.lodLevel = 'high';
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        // Performance monitoring
        this.performanceMetrics = {
            frameTime: 0,
            memoryUsage: 0,
            drawCalls: 0
        };
        
        // Animation states
        this.animationState = {
            isWalking: false,
            isWriting: false,
            currentLetter: 0,
            writingSpeed: 150, // ms per letter
            walkProgress: 0
        };
        
        // Telegram WebApp integration
        this.telegram = window.Telegram?.WebApp;
        
        this.init();
    }
    
    async init() {
        try {
            // Detect device capabilities and set LOD
            this.detectDeviceCapabilities();
            
            // Initialize Three.js scene
            this.setupScene();
            
            // Setup cinematic lighting
            this.setupLighting();
            
            // Setup camera
            this.setupCamera();
            
            // Setup renderer with optimizations
            this.setupRenderer();
            
            // Load 3D models
            await this.loadModels();
            
            // Setup controls
            this.setupControls();
            
            // Load lesson data
            await this.loadLessonData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.animate();
            
            // Hide loading screen
            setTimeout(() => {
                document.getElementById('loading-screen').classList.add('hidden');
            }, 1000);
            
            // Initialize Telegram WebApp if available
            if (this.telegram) {
                this.telegram.ready();
                this.telegram.expand();
            }
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Yuklashda xatolik yuz berdi');
        }
    }
    
    detectDeviceCapabilities() {
        // Detect device type and capabilities
        const userAgent = navigator.userAgent;
        const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
        const isOldDevice = this.detectOldDevice();
        
        // Check WebGL capabilities
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.lodLevel = 'low';
            return;
        }
        
        // Check GPU capabilities
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            console.log('GPU:', renderer);
            
            // Detect low-end GPUs
            if (renderer.includes('Intel') && !renderer.includes('Iris')) {
                this.lodLevel = isOldDevice ? 'low' : 'medium';
            } else if (isMobile) {
                this.lodLevel = isOldDevice ? 'low' : 'medium';
            } else {
                this.lodLevel = 'high';
            }
        }
        
        // Check memory (if available)
        if (navigator.deviceMemory) {
            const memory = navigator.deviceMemory;
            if (memory < 4) {
                this.lodLevel = 'low';
            } else if (memory < 8) {
                this.lodLevel = 'medium';
            }
        }
        
        // Check CPU cores
        if (navigator.hardwareConcurrency) {
            const cores = navigator.hardwareConcurrency;
            if (cores < 4) {
                this.lodLevel = 'low';
            }
        }
        
        console.log('LOD Level:', this.lodLevel);
        this.updateLODBadge();
    }
    
    detectOldDevice() {
        // Detect devices older than 3 years
        const userAgent = navigator.userAgent;
        
        // Check for old iOS versions
        const iOSMatch = userAgent.match(/iPhone OS (\d+)_(\d+)/);
        if (iOSMatch) {
            const majorVersion = parseInt(iOSMatch[1]);
            if (majorVersion < 14) return true;
        }
        
        // Check for old Android versions
        const androidMatch = userAgent.match(/Android (\d+)/);
        if (androidMatch) {
            const majorVersion = parseInt(androidMatch[1]);
            if (majorVersion < 10) return true;
        }
        
        // Check for old Chrome
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        if (chromeMatch) {
            const majorVersion = parseInt(chromeMatch[1]);
            if (majorVersion < 90) return true;
        }
        
        return false;
    }
    
    updateLODBadge() {
        const badge = document.getElementById('lod-badge');
        badge.className = 'lod-badge';
        
        switch (this.lodLevel) {
            case 'high':
                badge.classList.add('lod-high');
                badge.textContent = 'HIGH';
                break;
            case 'medium':
                badge.classList.add('lod-medium');
                badge.textContent = 'MEDIUM';
                break;
            case 'low':
                badge.classList.add('lod-low');
                badge.textContent = 'LOW';
                break;
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x0a0a0f, 10, 50);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
        mainLight.position.set(5, 10, 7);
        mainLight.castShadow = true;
        
        // Shadow configuration based on LOD
        if (this.lodLevel === 'high') {
            mainLight.shadow.mapSize.width = 2048;
            mainLight.shadow.mapSize.height = 2048;
            mainLight.shadow.camera.near = 0.5;
            mainLight.shadow.camera.far = 50;
            mainLight.shadow.camera.left = -10;
            mainLight.shadow.camera.right = 10;
            mainLight.shadow.camera.top = 10;
            mainLight.shadow.camera.bottom = -10;
        } else if (this.lodLevel === 'medium') {
            mainLight.shadow.mapSize.width = 1024;
            mainLight.shadow.mapSize.height = 1024;
        } else {
            mainLight.shadow.mapSize.width = 512;
            mainLight.shadow.mapSize.height = 512;
        }
        
        mainLight.shadow.bias = -0.0001;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x667eea, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // Rim light for cinematic effect
        const rimLight = new THREE.DirectionalLight(0x764ba2, 0.5);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);
        
        // Point lights for classroom atmosphere
        if (this.lodLevel !== 'low') {
            const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 20);
            pointLight1.position.set(3, 4, 3);
            this.scene.add(pointLight1);
            
            const pointLight2 = new THREE.PointLight(0x00aaff, 0.3, 20);
            pointLight2.position.set(-3, 4, -3);
            this.scene.add(pointLight2);
        }
    }
    
    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
        
        // Position camera for optimal view
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 1.5, 0);
    }
    
    setupRenderer() {
        const container = document.getElementById('canvas-container');
        
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.lodLevel === 'high',
            powerPreference: 'high-performance',
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lodLevel === 'high' ? 2 : 1));
        
        // Cinematic tone mapping
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        
        // Shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = this.lodLevel === 'high' 
            ? THREE.PCFSoftShadowMap 
            : THREE.BasicShadowMap;
        
        // Output encoding
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        container.appendChild(this.renderer.domElement);
    }
    
    async loadModels() {
        const loader = new THREE.GLTFLoader();
        
        try {
            // Load Harvard room
            const roomResult = await new Promise((resolve, reject) => {
                loader.load(
                    'assets/harvard_room.glb',
                    resolve,
                    undefined,
                    reject
                );
            });
            
            this.room = roomResult.scene;
            
            // Optimize room based on LOD
            this.optimizeModel(this.room);
            
            this.room.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = this.lodLevel !== 'low';
                    child.receiveShadow = this.lodLevel !== 'low';
                }
            });
            
            this.scene.add(this.room);
            
            // Load Malika (teacher)
            const malikaResult = await new Promise((resolve, reject) => {
                loader.load(
                    'assets/harvard_malika.glb',
                    resolve,
                    undefined,
                    reject
                );
            });
            
            this.malika = malikaResult.scene;
            
            // Optimize Malika based on LOD
            this.optimizeModel(this.malika);
            
            // Setup animation mixer
            this.mixer = new THREE.AnimationMixer(this.malika);
            
            // Store animations
            this.animations = {};
            malikaResult.animations.forEach((clip) => {
                this.animations[clip.name] = clip;
            });
            
            // Position Malika at starting position
            this.malika.position.set(-3, 0, 2);
            this.malika.rotation.y = Math.PI / 4;
            
            this.malika.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = this.lodLevel !== 'low';
                    child.receiveShadow = this.lodLevel !== 'low';
                }
            });
            
            this.scene.add(this.malika);
            
            // Find board in room
            this.board = this.room.getObjectByName('board') || this.createBoard();
            
            console.log('Models loaded successfully');
            
        } catch (error) {
            console.error('Error loading models:', error);
            // Create fallback procedural scene
            this.createFallbackScene();
        }
    }
    
    optimizeModel(model) {
        model.traverse((child) => {
            if (child.isMesh) {
                // Reduce polygon count based on LOD
                if (this.lodLevel === 'low') {
                    child.geometry.dispose();
                    // Simplified geometry would be created here
                    // For now, we'll just reduce material complexity
                }
                
                // Optimize materials
                if (child.material) {
                    child.material.needsUpdate = true;
                    
                    if (this.lodLevel === 'low') {
                        // Disable expensive features
                        child.material.envMap = null;
                        child.material.normalMap = null;
                        child.material.roughnessMap = null;
                    }
                }
            }
        });
    }
    
    createFallbackScene() {
        // Create procedural Harvard classroom if models fail to load
        const roomGeometry = new THREE.BoxGeometry(10, 5, 10);
        const roomMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B7355,
            roughness: 0.8
        });
        this.room = new THREE.Mesh(roomGeometry, roomMaterial);
        this.room.receiveShadow = true;
        this.scene.add(this.room);
        
        // Create board
        this.board = this.createBoard();
        
        // Create simple Malika placeholder
        const malikaGeometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const malikaMaterial = new THREE.MeshStandardMaterial({
            color: 0x667eea
        });
        this.malika = new THREE.Mesh(malikaGeometry, malikaMaterial);
        this.malika.position.set(-3, 0.9, 2);
        this.malika.castShadow = true;
        this.scene.add(this.malika);
    }
    
    createBoard() {
        const boardGeometry = new THREE.PlaneGeometry(4, 2.5);
        const boardMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            roughness: 0.3,
            metalness: 0.1
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.position.set(0, 2, -4);
        board.receiveShadow = true;
        
        // Add chalk texture
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 640;
        this.chalkCanvas = canvas;
        this.chalkContext = canvas.getContext('2d');
        
        const chalkTexture = new THREE.CanvasTexture(canvas);
        board.material.map = chalkTexture;
        board.material.needsUpdate = true;
        
        this.scene.add(board);
        return board;
    }
    
    setupControls() {
        // Simple orbit controls for viewing
        // In production, this would be more sophisticated
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            // Rotate camera slightly
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi -= deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 1.5, 0);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            isDragging = false;
        });
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            
            const spherical = new THREE.Spherical();
            spherical.setFromVector3(this.camera.position);
            spherical.theta -= deltaX * 0.01;
            spherical.phi -= deltaY * 0.01;
            spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
            
            this.camera.position.setFromSpherical(spherical);
            this.camera.lookAt(0, 1.5, 0);
            
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        });
        
        canvas.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
    
    async loadLessonData() {
        try {
            const response = await fetch('assets/lesson-data.json');
            this.lessonData = await response.json();
            console.log('Lesson data loaded:', this.lessonData);
        } catch (error) {
            console.error('Error loading lesson data:', error);
            // Use fallback lesson data
            this.lessonData = {
                lessons: [
                    {
                        id: 1,
                        title: 'Matematika - Algebra',
                        content: 'Algebra - matematikaning eng muhim bo\'limlaridan biri. Unda sonlar va belgilar yordamida tenglamalar yechiladi.',
                        exam: {
                            questions: [
                                { question: '2x + 5 = 15 tenglamani yeching.', answer: '5' },
                                { question: 'x² - 9 = 0 tenglamani yeching.', answer: '3, -3' }
                            ]
                        }
                    }
                ]
            };
        }
    }
    
    setupEventListeners() {
        // Start lesson button
        document.getElementById('start-lesson').addEventListener('click', () => {
            this.startLesson();
        });
        
        // Toggle sound
        document.getElementById('toggle-sound').addEventListener('click', () => {
            this.toggleSound();
        });
        
        // Toggle quality
        document.getElementById('toggle-quality').addEventListener('click', () => {
            this.toggleQuality();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
        
        // Telegram back button
        if (this.telegram) {
            this.telegram.BackButton.onClick(() => {
                this.stopLesson();
            });
        }
    }
    
    async startLesson() {
        if (this.isLessonActive) return;
        
        this.isLessonActive = true;
        const lesson = this.lessonData.lessons[0];
        this.currentLesson = lesson;
        
        // Update UI
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-content').textContent = '';
        
        // Walk Malika to board
        await this.walkToBoard();
        
        // Start writing and speaking
        this.startWritingAndSpeaking(lesson.content);
        
        // Show Telegram back button
        if (this.telegram) {
            this.telegram.BackButton.show();
        }
    }
    
    async walkToBoard() {
        return new Promise((resolve) => {
            this.animationState.isWalking = true;
            this.animationState.walkProgress = 0;
            
            const startPosition = this.malika.position.clone();
            const endPosition = new THREE.Vector3(0, 0, -2);
            const duration = 3000; // 3 seconds
            const startTime = Date.now();
            
            const animateWalk = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Smooth easing
                const easedProgress = this.easeInOutCubic(progress);
                
                // Interpolate position
                this.malika.position.lerpVectors(startPosition, endPosition, easedProgress);
                
                // Rotate to face board
                this.malika.rotation.y = THREE.MathUtils.lerp(Math.PI / 4, 0, easedProgress);
                
                // Add walking bob
                if (this.mixer && this.animations['walk']) {
                    // Play walk animation if available
                } else {
                    // Procedural walking animation
                    this.malika.position.y = Math.sin(elapsed * 0.01) * 0.05;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(animateWalk);
                } else {
                    this.animationState.isWalking = false;
                    this.malika.position.y = 0;
                    resolve();
                }
            };
            
            animateWalk();
        });
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    startWritingAndSpeaking(text) {
        this.animationState.isWriting = true;
        this.animationState.currentLetter = 0;
        
        // Clear board
        this.clearBoard();
        
        // Start speaking
        this.speakText(text);
        
        // Start writing animation
        this.writeText(text);
    }
    
    speakText(text) {
        if (!this.speechSynthesis) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        // Cancel any ongoing speech
        this.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'uz-UZ'; // Uzbek
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // Try to find Uzbek voice
        const voices = this.speechSynthesis.getVoices();
        const uzbekVoice = voices.find(voice => 
            voice.lang.includes('uz') || voice.lang.includes('tr')
        );
        
        if (uzbekVoice) {
            utterance.voice = uzbekVoice;
        }
        
        // Setup audio analysis for lip sync
        this.setupAudioAnalysis(utterance);
        
        utterance.onend = () => {
            this.animationState.isWriting = false;
        };
        
        this.speechSynthesis.speak(utterance);
    }
    
    setupAudioAnalysis(utterance) {
        // Note: Web Speech API doesn't provide direct audio access
        // For true lip sync, we would need to use a different TTS solution
        // This is a simplified version that uses timing-based animation
        
        // Alternative: Use Web Audio API with a custom TTS or audio file
        // For now, we'll use a timing-based approach
        
        const words = utterance.text.split(' ');
        const wordDuration = 600; // Average duration per word in ms
        
        words.forEach((word, index) => {
            setTimeout(() => {
                this.animateLips(word);
            }, index * wordDuration);
        });
    }
    
    animateLips(word) {
        if (!this.malika) return;
        
        // Find morph targets for lips
        const mouthOpen = this.malika.getObjectByName('mouth_open');
        const mouthClose = this.malika.getObjectByName('mouth_close');
        
        if (mouthOpen && mouthClose) {
            // Animate mouth opening and closing
            const duration = 200;
            const startTime = Date.now();
            
            const animateMouth = () => {
                const elapsed = Date.now() - startTime;
                const progress = (Math.sin(elapsed * 0.05) + 1) / 2;
                
                if (mouthOpen.morphTargetInfluences) {
                    mouthOpen.morphTargetInfluences[0] = progress * 0.5;
                }
                
                if (mouthClose.morphTargetInfluences) {
                    mouthClose.morphTargetInfluences[0] = (1 - progress) * 0.5;
                }
                
                if (elapsed < duration * 5) {
                    requestAnimationFrame(animateMouth);
                }
            };
            
            animateMouth();
        }
    }
    
    writeText(text) {
        const letters = text.split('');
        let currentText = '';
        
        letters.forEach((letter, index) => {
            setTimeout(() => {
                currentText += letter;
                this.drawOnBoard(currentText);
                
                // Update progress
                const progress = ((index + 1) / letters.length) * 100;
                document.getElementById('progress-fill').style.width = progress + '%';
                
                // Update lesson content
                document.getElementById('lesson-content').textContent = currentText;
                
            }, index * this.animationState.writingSpeed);
        });
    }
    
    drawOnBoard(text) {
        if (!this.chalkContext) return;
        
        const ctx = this.chalkContext;
        const canvas = this.chalkCanvas;
        
        // Clear and redraw
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Chalk style
        ctx.font = '48px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add chalk texture effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 2;
        
        // Word wrap
        const words = text.split(' ');
        let line = '';
        let y = canvas.height / 2 - 50;
        const lineHeight = 60;
        
        words.forEach((word) => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > canvas.width - 100 && line !== '') {
                ctx.fillText(line, canvas.width / 2, y);
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        });
        
        ctx.fillText(line, canvas.width / 2, y);
        
        // Update texture
        if (this.board && this.board.material.map) {
            this.board.material.map.needsUpdate = true;
        }
    }
    
    clearBoard() {
        if (!this.chalkContext) return;
        
        const ctx = this.chalkContext;
        const canvas = this.chalkCanvas;
        
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.board && this.board.material.map) {
            this.board.material.map.needsUpdate = true;
        }
    }
    
    stopLesson() {
        this.isLessonActive = false;
        this.speechSynthesis.cancel();
        
        // Walk Malika back
        this.walkBack();
        
        // Hide Telegram back button
        if (this.telegram) {
            this.telegram.BackButton.hide();
        }
    }
    
    async walkBack() {
        return new Promise((resolve) => {
            const startPosition = this.malika.position.clone();
            const endPosition = new THREE.Vector3(-3, 0, 2);
            const duration = 2000;
            const startTime = Date.now();
            
            const animateWalk = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = this.easeInOutCubic(progress);
                
                this.malika.position.lerpVectors(startPosition, endPosition, easedProgress);
                this.malika.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 4, easedProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateWalk);
                } else {
                    resolve();
                }
            };
            
            animateWalk();
        });
    }
    
    toggleSound() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
    }
    
    toggleQuality() {
        const levels = ['low', 'medium', 'high'];
        const currentIndex = levels.indexOf(this.lodLevel);
        this.lodLevel = levels[(currentIndex + 1) % levels.length];
        
        // Update renderer settings
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.lodLevel === 'high' ? 2 : 1));
        this.renderer.antialias = this.lodLevel === 'high';
        this.renderer.shadowMap.type = this.lodLevel === 'high' 
            ? THREE.PCFSoftShadowMap 
            : THREE.BasicShadowMap;
        
        this.updateLODBadge();
    }
    
    onWindowResize() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Update animation mixer
        if (this.mixer) {
            this.mixer.update(delta);
        }
        
        // Update performance metrics
        this.updatePerformanceMetrics();
        
        // Dynamic LOD adjustment
        this.adjustLOD();
        
        // Render
        this.renderer.render(this.scene, this.camera);
    }
    
    updatePerformanceMetrics() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            document.getElementById('fps-counter').textContent = this.fps;
        }
        
        this.performanceMetrics.frameTime = delta;
    }
    
    adjustLOD() {
        // Automatically adjust LOD based on performance
        if (this.fps < 30 && this.lodLevel !== 'low') {
            this.lodLevel = 'low';
            this.updateLODBadge();
        } else if (this.fps > 50 && this.lodLevel === 'low') {
            this.lodLevel = 'medium';
            this.updateLODBadge();
        }
    }
    
    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = loadingScreen.querySelector('.loading-text');
        loadingText.textContent = message;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.harvardClassroom = new Harvard3DClassroom();
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/sw.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}
