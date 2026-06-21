// EduUpAI - Global 3D Exam & Learning Simulator
// Main JavaScript with Three.js 3D Engine, Multi-Standard Exam System, and AI Features

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ============================================
// GLOBAL VARIABLES & CONFIGURATION
// ============================================
const CONFIG = {
    blackboardWidth: 2048,
    blackboardHeight: 1024,
    cameraStates: {
        default: { position: { x: 0, y: 1.6, z: 4 }, target: { x: 0, y: 1.5, z: 0 } },
        talking: { position: { x: 0.8, y: 1.8, z: 2.5 }, target: { x: 0, y: 1.6, z: 0 } },
        writing_board: { position: { x: 1.2, y: 2.6, z: 1.5 }, target: { x: 0, y: 2.2, z: -0.5 } }
    },
    examStandards: ['IELTS', 'SAT', 'GMAT', 'GRE', 'DTM', 'Multilevel', 'TurkeyYOS'],
    animationClips: ['Walk', 'Writing', 'Idle', 'Explaining', 'Emphasizing', 'Erasing']
};

// ============================================
// THREE.JS 3D ENGINE CLASS
// ============================================
class EduUp3DEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.blackboard = null;
        this.blackboardCanvas = null;
        this.blackboardContext = null;
        this.teacherModel = null;
        this.roomModel = null;
        this.animationMixer = null;
        this.animations = {};
        this.currentAction = null;
        this.cameraState = 'default';
        this.targetCameraPosition = new THREE.Vector3();
        this.targetCameraLookAt = new THREE.Vector3();
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x050508);
        this.scene.fog = new THREE.Fog(0x050508, 5, 20);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.6, 4);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 8;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.target.set(0, 1.5, 0);

        // Lighting
        this.setupLighting();

        // Create blackboard
        this.createBlackboard();

        // Load models
        this.loadModels();

        // Event listeners
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Device orientation for VR effect
        this.setupDeviceOrientation();

        this.isInitialized = true;
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 10, 5);
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
        const fillLight = new THREE.DirectionalLight(0x88ccff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);

        // Point lights for classroom atmosphere
        const pointLight1 = new THREE.PointLight(0xffaa00, 0.5, 10);
        pointLight1.position.set(2, 3, 2);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x00aaff, 0.3, 10);
        pointLight2.position.set(-2, 3, -2);
        this.scene.add(pointLight2);
    }

    createBlackboard() {
        // Create high-resolution canvas for blackboard
        this.blackboardCanvas = document.createElement('canvas');
        this.blackboardCanvas.width = CONFIG.blackboardWidth;
        this.blackboardCanvas.height = CONFIG.blackboardHeight;
        this.blackboardContext = this.blackboardCanvas.getContext('2d');

        // Initialize blackboard with dark green color
        this.blackboardContext.fillStyle = '#1a3a1a';
        this.blackboardContext.fillRect(0, 0, CONFIG.blackboardWidth, CONFIG.blackboardHeight);

        // Add subtle texture
        this.blackboardContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * CONFIG.blackboardWidth;
            const y = Math.random() * CONFIG.blackboardHeight;
            this.blackboardContext.fillRect(x, y, 2, 2);
        }

        // Create texture from canvas
        const blackboardTexture = new THREE.CanvasTexture(this.blackboardCanvas);
        blackboardTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        blackboardTexture.minFilter = THREE.LinearFilter;
        blackboardTexture.magFilter = THREE.LinearFilter;

        // Create blackboard mesh
        const blackboardGeometry = new THREE.PlaneGeometry(4, 2);
        const blackboardMaterial = new THREE.MeshStandardMaterial({
            map: blackboardTexture,
            roughness: 0.8,
            metalness: 0.1
        });

        this.blackboard = new THREE.Mesh(blackboardGeometry, blackboardMaterial);
        this.blackboard.position.set(0, 2.2, -0.5);
        this.blackboard.castShadow = true;
        this.blackboard.receiveShadow = true;
        this.scene.add(this.blackboard);

        // Add blackboard frame
        const frameGeometry = new THREE.BoxGeometry(4.2, 2.2, 0.1);
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.6 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 2.2, -0.55);
        frame.castShadow = true;
        this.scene.add(frame);

        // Add chalk tray
        const trayGeometry = new THREE.BoxGeometry(4.2, 0.1, 0.3);
        const trayMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2718, roughness: 0.7 });
        const tray = new THREE.Mesh(trayGeometry, trayMaterial);
        tray.position.set(0, 1.15, -0.4);
        tray.castShadow = true;
        this.scene.add(tray);
    }

    loadModels() {
        const loader = new GLTFLoader();

        // Load teacher model (placeholder - replace with actual model)
        loader.load(
            '/models/teacher.glb',
            (gltf) => {
                this.teacherModel = gltf.scene;
                this.teacherModel.position.set(0, 0, 1);
                this.teacherModel.scale.set(1, 1, 1);
                this.teacherModel.castShadow = true;
                this.teacherModel.receiveShadow = true;
                this.scene.add(this.teacherModel);

                // Setup animation mixer
                this.animationMixer = new THREE.AnimationMixer(this.teacherModel);
                
                // Store animations
                gltf.animations.forEach((clip) => {
                    this.animations[clip.name] = clip;
                });

                // Start idle animation
                this.playAnimation('Idle');

                console.log('Teacher model loaded');
            },
            (progress) => {
                console.log('Loading teacher model:', (progress.loaded / progress.total * 100).toFixed(1) + '%');
            },
            (error) => {
                console.error('Error loading teacher model:', error);
                // Create placeholder teacher
                this.createPlaceholderTeacher();
            }
        );

        // Load room model (placeholder - replace with actual model)
        loader.load(
            '/models/classroom.glb',
            (gltf) => {
                this.roomModel = gltf.scene;
                this.roomModel.position.set(0, 0, 0);
                this.roomModel.scale.set(1, 1, 1);
                this.roomModel.receiveShadow = true;
                this.scene.add(this.roomModel);
                console.log('Room model loaded');
            },
            undefined,
            (error) => {
                console.error('Error loading room model:', error);
                // Create placeholder room
                this.createPlaceholderRoom();
            }
        );
    }

    createPlaceholderTeacher() {
        const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x4a90d9 });
        this.teacherModel = new THREE.Mesh(geometry, material);
        this.teacherModel.position.set(0, 0.9, 1);
        this.teacherModel.castShadow = true;
        this.scene.add(this.teacherModel);

        // Add head
        const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffdbac });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1.6, 1);
        head.castShadow = true;
        this.scene.add(head);
    }

    createPlaceholderRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(10, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a3a4a,
            roughness: 0.8
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // Back wall
        const wallGeometry = new THREE.PlaneGeometry(10, 5);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a5a });
        const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
        backWall.position.set(0, 2.5, -3);
        backWall.receiveShadow = true;
        this.scene.add(backWall);

        // Side walls
        const sideWall1 = new THREE.Mesh(wallGeometry, wallMaterial);
        sideWall1.position.set(-5, 2.5, 0);
        sideWall1.rotation.y = Math.PI / 2;
        sideWall1.receiveShadow = true;
        this.scene.add(sideWall1);

        const sideWall2 = new THREE.Mesh(wallGeometry, wallMaterial);
        sideWall2.position.set(5, 2.5, 0);
        sideWall2.rotation.y = -Math.PI / 2;
        sideWall2.receiveShadow = true;
        this.scene.add(sideWall2);

        // Ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(10, 10);
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0x5a5a6a });
        const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
        ceiling.position.set(0, 5, 0);
        ceiling.rotation.x = Math.PI / 2;
        this.scene.add(ceiling);
    }

    playAnimation(name, crossfadeDuration = 0.5) {
        if (!this.animationMixer || !this.animations[name]) return;

        const newAction = this.animationMixer.clipAction(this.animations[name]);
        
        if (this.currentAction) {
            this.currentAction.crossFadeTo(newAction, crossfadeDuration, true);
        }
        
        newAction.play();
        this.currentAction = newAction;
    }

    setCameraState(state) {
        if (!CONFIG.cameraStates[state]) return;
        
        this.cameraState = state;
        const config = CONFIG.cameraStates[state];
        
        this.targetCameraPosition.set(config.position.x, config.position.y, config.position.z);
        this.targetCameraLookAt.set(config.target.x, config.target.y, config.target.z);
    }

    updateCinematicCamera(delta) {
        // Smooth lerp to target position
        const lerpSpeed = 2 * delta;
        this.camera.position.lerp(this.targetCameraPosition, lerpSpeed);
        this.controls.target.lerp(this.targetCameraLookAt, lerpSpeed);
    }

    setupDeviceOrientation() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                if (event.beta !== null && event.gamma !== null) {
                    // Subtle VR effect based on device orientation
                    const beta = event.beta * (Math.PI / 180);
                    const gamma = event.gamma * (Math.PI / 180);
                    
                    // Apply subtle camera offset
                    this.camera.position.x += gamma * 0.01;
                    this.camera.position.y += beta * 0.01;
                }
            });
        }
    }

    writeOnBlackboard(text, x, y, fontSize = 48, color = '#ffffff') {
        this.blackboardContext.font = `${fontSize}px Arial`;
        this.blackboardContext.fillStyle = color;
        this.blackboardContext.fillText(text, x, y);
        
        if (this.blackboard) {
            this.blackboard.material.map.needsUpdate = true;
        }
    }

    clearBlackboard() {
        this.blackboardContext.fillStyle = '#1a3a1a';
        this.blackboardContext.fillRect(0, 0, CONFIG.blackboardWidth, CONFIG.blackboardHeight);
        
        // Add subtle texture
        this.blackboardContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * CONFIG.blackboardWidth;
            const y = Math.random() * CONFIG.blackboardHeight;
            this.blackboardContext.fillRect(x, y, 2, 2);
        }
        
        if (this.blackboard) {
            this.blackboard.material.map.needsUpdate = true;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = 0.016; // Approximate 60fps

        // Update animation mixer
        if (this.animationMixer) {
            this.animationMixer.update(delta);
        }

        // Update cinematic camera
        this.updateCinematicCamera(delta);

        // Update controls
        this.controls.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    speak(text) {
        // Speech synthesis
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'uz-UZ';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            utterance.onstart = () => {
                this.setCameraState('talking');
                this.playAnimation('Explaining');
            };
            
            utterance.onend = () => {
                this.setCameraState('default');
                this.playAnimation('Idle');
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }
}

// ============================================
// MULTI-STANDARD EXAM ENGINE
// ============================================
class ExamEngine {
    constructor(standard = 'Multilevel') {
        this.standard = standard;
        this.currentCycle = 0;
        this.cycles = ['listening', 'reading', 'writing', 'speaking'];
        this.answers = {};
        this.timer = null;
        this.timeRemaining = 0;
        this.examData = null;
    }

    async loadExamData(standard) {
        try {
            const response = await fetch(`/data/exams/${standard.toLowerCase()}.json`);
            this.examData = await response.json();
            return this.examData;
        } catch (error) {
            console.error('Error loading exam data:', error);
            return null;
        }
    }

    startExam() {
        this.currentCycle = 0;
        this.answers = {};
        this.showCycle(this.cycles[0]);
        this.startTimer();
    }

    showCycle(cycle) {
        // Hide all panels
        this.cycles.forEach(c => {
            document.getElementById(`panel-${c}`).classList.add('hidden');
        });

        // Show current panel
        document.getElementById(`panel-${cycle}`).classList.remove('hidden');
        document.getElementById(`panel-${cycle}`).classList.add('flex');

        // Update title
        document.getElementById('exam-cycle-title').textContent = 
            cycle.charAt(0).toUpperCase() + cycle.slice(1) + ' Section';

        // Configure tools based on standard
        this.configureExamTools();

        // Render questions
        this.renderCycleQuestions(cycle);
    }

    configureExamTools() {
        const toolbar = document.getElementById('exam-tools-toolbar');
        toolbar.classList.remove('hidden');

        // Hide all tools first
        document.getElementById('toggle-desmos-btn').classList.add('hidden');
        document.getElementById('tool-highlighter').classList.add('hidden');
        document.getElementById('tool-notepad-btn').classList.add('hidden');
        document.getElementById('tool-formulas-btn').classList.add('hidden');

        // Show tools based on standard
        switch (this.standard) {
            case 'SAT':
                document.getElementById('toggle-desmos-btn').classList.remove('hidden');
                document.getElementById('tool-highlighter').classList.remove('hidden');
                break;
            case 'IELTS':
                document.getElementById('tool-notepad-btn').classList.remove('hidden');
                break;
            case 'DTM':
            case 'Multilevel':
                document.getElementById('tool-formulas-btn').classList.remove('hidden');
                break;
        }
    }

    renderCycleQuestions(cycle) {
        const container = document.getElementById(`${cycle}-questions-container`);
        container.innerHTML = '';

        if (!this.examData || !this.examData[cycle]) return;

        const questions = this.examData[cycle].questions;

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'bg-slate-900 p-4 rounded-xl border border-slate-800';
            
            let html = `<p class="text-sm font-medium mb-3">${index + 1}. ${question.question}</p>`;

            if (question.type === 'multiple-choice') {
                question.options.forEach((option, optIndex) => {
                    html += `
                        <label class="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer">
                            <input type="radio" name="q${index}" value="${optIndex}" 
                                   onchange="examEngine.saveAnswer('${cycle}', ${index}, this.value)">
                            <span class="text-sm text-slate-300">${option}</span>
                        </label>
                    `;
                });
            } else if (question.type === 'text') {
                html += `
                    <textarea class="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 mt-2"
                              placeholder="Javobingizni yozing..."
                              onchange="examEngine.saveAnswer('${cycle}', ${index}, this.value)"></textarea>
                `;
            }

            questionDiv.innerHTML = html;
            container.appendChild(questionDiv);
        });
    }

    saveAnswer(cycle, questionIndex, answer) {
        if (!this.answers[cycle]) {
            this.answers[cycle] = {};
        }
        this.answers[cycle][questionIndex] = answer;
    }

    nextCycle() {
        if (this.currentCycle < this.cycles.length - 1) {
            this.currentCycle++;
            this.showCycle(this.cycles[this.currentCycle]);
        } else {
            this.finishExam();
        }
    }

    previousCycle() {
        if (this.currentCycle > 0) {
            this.currentCycle--;
            this.showCycle(this.cycles[this.currentCycle]);
        }
    }

    startTimer() {
        const duration = this.examData?.duration || 1800; // Default 30 minutes
        this.timeRemaining = duration;

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.finishExam();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        document.getElementById('exam-timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    finishExam() {
        clearInterval(this.timer);
        
        // Calculate score
        const score = this.calculateScore();
        
        // Show results
        this.showResults(score);
    }

    calculateScore() {
        let totalScore = 0;
        let maxScore = 0;

        this.cycles.forEach(cycle => {
            if (!this.examData[cycle]) return;

            const questions = this.examData[cycle].questions;
            const answers = this.answers[cycle] || {};

            questions.forEach((question, index) => {
                maxScore += question.points || 1;

                if (question.type === 'multiple-choice' && answers[index] !== undefined) {
                    if (parseInt(answers[index]) === question.correctAnswer) {
                        totalScore += question.points || 1;
                    }
                }
            });
        });

        return {
            total: totalScore,
            max: maxScore,
            percentage: (totalScore / maxScore) * 100
        };
    }

    showResults(score) {
        document.getElementById('exam-simulator').classList.add('hidden');
        document.getElementById('exam-result-dashboard').classList.remove('hidden');
        document.getElementById('exam-result-dashboard').classList.add('flex');

        document.getElementById('final-score').textContent = `${score.total}/${score.max} Ball`;
        document.getElementById('score-standard-detail').textContent = 
            `${this.standard} - ${score.percentage.toFixed(1)}%`;

        // Generate questions map
        this.generateQuestionsMap();

        // Update gamification
        gamificationSystem.addXP(Math.floor(score.total * 10));
    }

    generateQuestionsMap() {
        const grid = document.getElementById('questions-map-grid');
        grid.innerHTML = '';

        let totalQuestions = 0;
        this.cycles.forEach(cycle => {
            if (this.examData[cycle]) {
                totalQuestions += this.examData[cycle].questions.length;
            }
        });

        for (let i = 0; i < totalQuestions; i++) {
            const cell = document.createElement('div');
            cell.className = 'w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold';
            cell.textContent = i + 1;
            grid.appendChild(cell);
        }
    }
}

// ============================================
// GAMIFICATION SYSTEM
// ============================================
class GamificationSystem {
    constructor() {
        this.xp = parseInt(localStorage.getItem('eduup_user_xp')) || 0;
        this.streak = parseInt(localStorage.getItem('eduup_user_streak')) || 1;
        this.lastVisit = localStorage.getItem('eduup_last_visit') || Date.now();
        
        this.checkStreak();
        this.updateUI();
    }

    addXP(amount) {
        this.xp += amount;
        localStorage.setItem('eduup_user_xp', this.xp);
        this.updateUI();
    }

    checkStreak() {
        const today = new Date().toDateString();
        const lastVisit = new Date(this.lastVisit).toDateString();
        
        if (today !== lastVisit) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastVisit === yesterday.toDateString()) {
                this.streak++;
            } else {
                this.streak = 1;
            }
            
            localStorage.setItem('eduup_user_streak', this.streak);
            localStorage.setItem('eduup_last_visit', Date.now());
        }
    }

    updateUI() {
        document.getElementById('user-xp').textContent = this.xp;
        document.getElementById('user-streak').textContent = this.streak;
        document.getElementById('gamification-panel').classList.remove('hidden');
    }
}

// ============================================
// VOICE COMMAND SYSTEM
// ============================================
class VoiceCommandSystem {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'uz-UZ';
            
            this.recognition.onresult = (event) => this.handleResult(event);
            this.recognition.onerror = (event) => console.error('Speech recognition error:', event);
        }
    }

    startListening() {
        if (this.recognition) {
            this.recognition.start();
            this.isListening = true;
            document.getElementById('voice-indicator').classList.remove('hidden');
        }
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            document.getElementById('voice-indicator').classList.add('hidden');
        }
    }

    handleResult(event) {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        // Voice commands
        if (transcript.includes('imtihonni boshla')) {
            examEngine.startExam();
        } else if (transcript.includes('darsni boshla')) {
            // Start lesson
        } else if (transcript.includes('to\'xta')) {
            this.stopListening();
        }
    }
}

// ============================================
// PDF CERTIFICATE GENERATION
// ============================================
function generateHarvardCertificatePDF(studentName, examType, score) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');

    // Background
    doc.setFillColor(20, 30, 50);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Header
    doc.setFontSize(24);
    doc.setTextColor(218, 165, 32);
    doc.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 40, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('EduUpAI Global Academy', 148.5, 50, { align: 'center' });

    // Content
    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text('This is to certify that', 148.5, 80, { align: 'center' });

    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.text(studentName, 148.5, 95, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text('has successfully completed the', 148.5, 115, { align: 'center' });

    doc.setFontSize(20);
    doc.setTextColor(218, 165, 32);
    doc.text(examType + ' Examination', 148.5, 130, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(200, 200, 200);
    doc.text('with a score of', 148.5, 145, { align: 'center' });

    doc.setFontSize(32);
    doc.setTextColor(0, 255, 136);
    doc.text(score + '%', 148.5, 160, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This certificate is generated automatically by EduUpAI Platform', 148.5, 190, { align: 'center' });

    // Save
    doc.save(`EduUpAI_Certificate_${studentName.replace(/\s+/g, '_')}.pdf`);
}

// ============================================
// ANALYTICS CHART
// ============================================
function initAnalyticsChart() {
    const ctx = document.getElementById('analyticsChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
            datasets: [{
                label: 'Progress Score',
                data: [65, 72, 78, 85, 82, 90],
                borderColor: 'rgb(0, 255, 204)',
                backgroundColor: 'rgba(0, 255, 204, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

// ============================================
// SHAKE TO CLEAR (Accelerometer)
// ============================================
function setupShakeToClear() {
    if (window.DeviceMotionEvent) {
        let lastX, lastY, lastZ;
        let lastTime = 0;
        
        window.addEventListener('devicemotion', (event) => {
            const current = event.accelerationIncludingGravity;
            const currentTime = new Date().getTime();
            
            if ((currentTime - lastTime) > 100) {
                const diffTime = currentTime - lastTime;
                lastTime = currentTime;
                
                const deltaX = Math.abs(current.x - lastX);
                const deltaY = Math.abs(current.y - lastY);
                const deltaZ = Math.abs(current.z - lastZ);
                
                if ((deltaX + deltaY + deltaZ) / diffTime * 10000 > 500) {
                    // Shake detected - clear blackboard
                    if (window.eduUp3D) {
                        window.eduUp3D.clearBlackboard();
                    }
                }
                
                lastX = current.x;
                lastY = current.y;
                lastZ = current.z;
            }
        });
    }
}

// ============================================
// PROCTORING SYSTEM (Eye Tracking)
// ============================================
function startProctoringAI() {
    // This would use webgazer.js for eye tracking
    // For now, we'll show a warning banner
    const banner = document.getElementById('proctor-warning-banner');
    banner.classList.remove('hidden');
    
    // Simulate proctoring checks
    setInterval(() => {
        // In a real implementation, this would check eye gaze
        // For demo, we'll randomly show/hide the banner
        if (Math.random() > 0.9) {
            banner.classList.remove('hidden');
            setTimeout(() => banner.classList.add('hidden'), 3000);
        }
    }, 10000);
}

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================
async function submitResultToGoogleSheets(data) {
    const formURL = 'YOUR_GOOGLE_FORM_URL';
    const entryIDs = {
        name: 'entry.123456789',
        exam: 'entry.987654321',
        score: 'entry.456789123'
    };

    const formData = new FormData();
    formData.append(entryIDs.name, data.name);
    formData.append(entryIDs.exam, data.exam);
    formData.append(entryIDs.score, data.score);

    try {
        await fetch(formURL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        console.log('Result submitted to Google Sheets');
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
    }
}

// ============================================
// INITIALIZATION
// ============================================
let eduUp3D;
let examEngine;
let gamificationSystem;
let voiceCommandSystem;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize 3D Engine
    eduUp3D = new EduUp3DEngine();
    window.eduUp3D = eduUp3D;

    // Initialize Gamification
    gamificationSystem = new GamificationSystem();

    // Initialize Voice Commands
    voiceCommandSystem = new VoiceCommandSystem();

    // Initialize Exam Engine
    examEngine = new ExamEngine();
    window.examEngine = examEngine;

    // Setup shake to clear
    setupShakeToClear();

    // Initialize analytics chart
    initAnalyticsChart();

    // Hide loading overlay
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    }, 2000);

    // Event listeners for exam simulator
    document.getElementById('next-cycle-btn')?.addEventListener('click', () => examEngine.nextCycle());
    document.getElementById('prev-cycle-btn')?.addEventListener('click', () => examEngine.previousCycle());
    document.getElementById('finish-cycle-btn')?.addEventListener('click', () => examEngine.finishExam());
    
    // Tool buttons
    document.getElementById('tool-notepad-btn')?.addEventListener('click', () => {
        document.getElementById('ielts-notepad-container').classList.toggle('hidden');
    });
    
    document.getElementById('tool-formulas-btn')?.addEventListener('click', () => {
        document.getElementById('formulas-popup').classList.toggle('hidden');
    });

    // PDF certificate button
    document.getElementById('download-cert-btn')?.addEventListener('click', () => {
        generateHarvardCertificatePDF('Student Name', examEngine.standard, '85');
    });

    // Ask Malika button
    document.getElementById('ask-malika-btn')?.addEventListener('click', () => {
        document.getElementById('exam-result-dashboard').classList.add('hidden');
        eduUp3D.speak('Tabriklayman! Sizning natijangiz yaxshi. Keling, xatolarni birgalikda tahlil qilamiz.');
    });

    // Voice indicator click to toggle
    document.getElementById('voice-indicator')?.addEventListener('click', () => {
        if (voiceCommandSystem.isListening) {
            voiceCommandSystem.stopListening();
        } else {
            voiceCommandSystem.startListening();
        }
    });

    // Start proctoring (optional)
    // startProctoringAI();
});

// Export for external use
window.EduUp3DEngine = EduUp3DEngine;
window.ExamEngine = ExamEngine;
window.GamificationSystem = GamificationSystem;
window.VoiceCommandSystem = VoiceCommandSystem;
window.generateHarvardCertificatePDF = generateHarvardCertificatePDF;
