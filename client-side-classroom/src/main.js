/**
 * EduUpAI - Main Application Controller
 * Core HTML5 Canvas renderer, UI controller, and Screen State Morphing router
 */

import * as THREE from 'three';
import { Application } from 'pixi.js';
import localAI from './local_ai_models.js';
import AdaptiveBrain from './adaptive_brain.js';

// Global state management
const AppState = {
    currentMode: 'lesson', // 'lesson' | 'sat' | 'ielts'
    isSpeaking: false,
    audioContext: null,
    analyser: null,
    malikaCanvas: null,
    threeCanvas: null,
    chalkboardContent: '',
    currentQuestion: 0,
    timer: null,
    timeRemaining: 0
};

// Screen transformation engine
class ScreenTransformer {
    constructor() {
        this.modes = {
            lesson: {
                backgroundColor: '#1a3d1a',
                malikaVisible: true,
                malikaSize: '12.5vw',
                chalkboardVisible: true,
                desmosVisible: false
            },
            sat: {
                backgroundColor: '#f3f4f6',
                malikaVisible: false,
                malikaSize: '0',
                chalkboardVisible: false,
                desmosVisible: true
            },
            ielts: {
                backgroundColor: '#ffffff',
                malikaVisible: true,
                malikaSize: '6.25vw', // 1/32 screen size
                chalkboardVisible: false,
                desmosVisible: false
            }
        };
    }

    async transformTo(mode) {
        const targetMode = this.modes[mode];
        const app = document.getElementById('app');
        
        // Apply smooth CSS transitions
        app.style.transition = 'background-color 0.5s ease-in-out';
        app.style.backgroundColor = targetMode.backgroundColor;
        
        // Handle Malika visibility and size
        const malikaContainer = document.getElementById('avatar-canvas');
        if (malikaContainer) {
            malikaContainer.style.transition = 'all 0.5s ease-in-out';
            malikaContainer.style.width = targetMode.malikaSize;
            malikaContainer.style.height = targetMode.malikaSize;
            
            if (targetMode.malikaVisible) {
                malikaContainer.style.opacity = '1';
                malikaContainer.style.transform = 'scale(1)';
            } else {
                malikaContainer.style.opacity = '0';
                malikaContainer.style.transform = 'scale(0.5)';
            }
        }
        
        // Handle chalkboard visibility
        const chalkboard = document.getElementById('chalkboard');
        if (chalkboard) {
            chalkboard.style.transition = 'opacity 0.5s ease-in-out';
            chalkboard.style.opacity = targetMode.chalkboardVisible ? '1' : '0';
        }
        
        // Handle Desmos calculator
        const desmosContainer = document.getElementById('desmos-calculator');
        if (desmosContainer) {
            desmosContainer.style.transition = 'opacity 0.5s ease-in-out';
            desmosContainer.style.opacity = targetMode.desmosVisible ? '1' : '0';
        }
        
        AppState.currentMode = mode;
        
        // Wait for transition to complete
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Malika Avatar Animation System
class MalikaAvatar {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.breathingPhase = 0;
        this.blinkState = 'open';
        this.blinkTimer = 0;
        this.lipSync = 0;
        this.armRotation = { left: 0, right: 0 };
        this.headTilt = 0;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    
    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }
    
    updateBreathing(deltaTime) {
        // Sine-wave breathing animation
        this.breathingPhase += deltaTime * 0.003;
        const breathingScale = 1 + Math.sin(this.breathingPhase) * 0.02;
        return breathingScale;
    }
    
    updateBlinking(deltaTime) {
        // Random blinking every 3-5 seconds
        this.blinkTimer += deltaTime;
        
        if (this.blinkState === 'open' && this.blinkTimer > 3000 + Math.random() * 2000) {
            this.blinkState = 'closing';
            this.blinkTimer = 0;
        } else if (this.blinkState === 'closing' && this.blinkTimer > 100) {
            this.blinkState = 'closed';
            this.blinkTimer = 0;
        } else if (this.blinkState === 'closed' && this.blinkTimer > 100) {
            this.blinkState = 'opening';
            this.blinkTimer = 0;
        } else if (this.blinkState === 'opening' && this.blinkTimer > 100) {
            this.blinkState = 'open';
            this.blinkTimer = 0;
        }
        
        return this.blinkState;
    }
    
    updateLipSync() {
        if (!AppState.analyser || !AppState.isSpeaking) {
            this.lipSync = 0;
            return 0;
        }
        
        // Get audio amplitude for lip-sync
        const dataArray = new Uint8Array(AppState.analyser.frequencyBinCount);
        AppState.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        
        // Map volume to mouth opening (0-1)
        this.lipSync = Math.min(average / 50, 1);
        return this.lipSync;
    }
    
    updateGestures(text) {
        // Parse text for gesture keywords
        const pointingKeywords = ['look here', "e'tibor bering", 'formula', 'doska', 'blackboard', 'shuni ko\'ring'];
        const emphasisKeywords = ['welcome', 'hush kelibsiz', 'very important', 'muhim', 'excellent', 'a\'lo'];
        
        const lowerText = text.toLowerCase();
        
        if (pointingKeywords.some(keyword => lowerText.includes(keyword))) {
            // Pointing gesture - raise left arm
            this.armRotation.left = Math.min(this.armRotation.left + 0.1, -45);
        } else if (emphasisKeywords.some(keyword => lowerText.includes(keyword))) {
            // Emphasis gesture - both hands open
            this.armRotation.left = Math.min(this.armRotation.left + 0.1, -30);
            this.armRotation.right = Math.max(this.armRotation.right - 0.1, 30);
        } else {
            // Reset to neutral
            this.armRotation.left = Math.max(this.armRotation.left - 0.05, 0);
            this.armRotation.right = Math.min(this.armRotation.right + 0.05, 0);
        }
    }
    
    draw(breathingScale, blinkState, lipSync) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw placeholder avatar (gradient circle with animation)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) * 0.4 * breathingScale;
        
        // Create gradient
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw eyes (with blinking)
        const eyeY = centerY - radius * 0.1;
        const eyeSpacing = radius * 0.3;
        const eyeSize = radius * 0.15;
        
        if (blinkState === 'open' || blinkState === 'closing') {
            // Open eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(centerX - eyeSpacing, eyeY, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(centerX + eyeSpacing, eyeY, eyeSize, eyeSize * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Pupils
            ctx.fillStyle = '#333333';
            ctx.beginPath();
            ctx.arc(centerX - eyeSpacing, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(centerX + eyeSpacing, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Closed eyes (lines)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX - eyeSpacing - eyeSize, eyeY);
            ctx.lineTo(centerX - eyeSpacing + eyeSize, eyeY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(centerX + eyeSpacing - eyeSize, eyeY);
            ctx.lineTo(centerX + eyeSpacing + eyeSize, eyeY);
            ctx.stroke();
        }
        
        // Draw mouth (with lip-sync)
        const mouthY = centerY + radius * 0.3;
        const mouthWidth = radius * 0.3;
        const mouthHeight = radius * 0.1 + lipSync * radius * 0.2;
        
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthY, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw gesture indicators (arm positions)
        if (this.armRotation.left !== 0 || this.armRotation.right !== 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.5;
            
            // Left arm indicator
            if (this.armRotation.left !== 0) {
                ctx.beginPath();
                ctx.moveTo(centerX - radius * 0.5, centerY + radius * 0.3);
                const leftArmX = centerX - radius * 0.5 + Math.sin(this.armRotation.left * Math.PI / 180) * radius * 0.5;
                const leftArmY = centerY + radius * 0.3 - Math.cos(this.armRotation.left * Math.PI / 180) * radius * 0.5;
                ctx.lineTo(leftArmX, leftArmY);
                ctx.stroke();
            }
            
            // Right arm indicator
            if (this.armRotation.right !== 0) {
                ctx.beginPath();
                ctx.moveTo(centerX + radius * 0.5, centerY + radius * 0.3);
                const rightArmX = centerX + radius * 0.5 + Math.sin(this.armRotation.right * Math.PI / 180) * radius * 0.5;
                const rightArmY = centerY + radius * 0.3 - Math.cos(this.armRotation.right * Math.PI / 180) * radius * 0.5;
                ctx.lineTo(rightArmX, rightArmY);
                ctx.stroke();
            }
            
            ctx.globalAlpha = 1;
        }
    }
    
    animate() {
        const deltaTime = 16; // ~60fps
        
        const breathingScale = this.updateBreathing(deltaTime);
        const blinkState = this.updateBlinking(deltaTime);
        const lipSync = this.updateLipSync();
        
        this.draw(breathingScale, blinkState, lipSync);
        
        requestAnimationFrame(() => this.animate());
    }
    
    speak(text) {
        this.updateGestures(text);
    }
}

// Interactive 3D Chalkboard with Three.js
class Chalkboard3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
        
        this.camera.position.z = 5;
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        this.shapes = [];
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        
        this.setupInteraction();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    addShape(type, color = 0x4a7c4a) {
        let geometry, material, mesh;
        
        material = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        switch (type) {
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'cube':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            default:
                geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0);
        this.scene.add(mesh);
        this.shapes.push(mesh);
        
        return mesh;
    }
    
    addCoordinatePlane() {
        // Create coordinate plane
        const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0x888888);
        gridHelper.material.opacity = 0.5;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Add axes
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }
    
    setupInteraction() {
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;
            
            this.shapes.forEach(shape => {
                shape.rotation.y += deltaX * 0.01;
                shape.rotation.x += deltaY * 0.01;
            });
            
            this.previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.renderer.domElement.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.01;
            this.camera.position.z = Math.max(2, Math.min(10, this.camera.position.z));
        });
    }
    
    resize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Auto-rotate shapes slightly
        this.shapes.forEach(shape => {
            shape.rotation.y += 0.005;
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    clear() {
        this.shapes.forEach(shape => {
            this.scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
        });
        this.shapes = [];
    }
}

// Router for navigation
const router = {
    navigate: async (mode) => {
        const transformer = new ScreenTransformer();
        await transformer.transformTo(mode);
        
        // Update navigation buttons
        document.querySelectorAll('nav button').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-white');
        });
        
        const activeButton = document.querySelector(`button[onclick*="${mode}"]`);
        if (activeButton) {
            activeButton.classList.add('ring-2', 'ring-white');
        }
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize AI models
    try {
        await localAI.initialize();
    } catch (error) {
        console.error('Failed to initialize AI models:', error);
        // Hide loading screen even if AI models fail
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }
    
    // Initialize adaptive brain
    window.adaptiveBrain = new AdaptiveBrain();
    
    // Initialize Malika avatar
    AppState.malikaCanvas = new MalikaAvatar('avatar-webgl');
    
    // Initialize 3D chalkboard
    AppState.threeCanvas = new Chalkboard3D('three-canvas');
    
    // Initialize audio context for lip-sync
    try {
        AppState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        AppState.analyser = AppState.audioContext.createAnalyser();
        AppState.analyser.fftSize = 256;
    } catch (e) {
        console.log('Web Audio API not supported');
    }
    
    // Make router globally available
    window.router = router;
    
    // Initialize classroom controller
    window.classroom = {
        startLesson: () => {
            const chalkContent = document.getElementById('chalk-content');
            if (chalkContent) {
                chalkContent.textContent = 'Welcome to EduUpAI! Let\'s learn mathematics together.';
            }
            if (AppState.malikaCanvas) {
                AppState.malikaCanvas.speak('Welcome to EduUpAI! Let\'s learn mathematics together.');
            }
        },
        
        toggle3D: () => {
            if (AppState.threeCanvas) {
                if (AppState.threeCanvas.shapes.length === 0) {
                    AppState.threeCanvas.addCoordinatePlane();
                    AppState.threeCanvas.addShape('cone');
                } else {
                    AppState.threeCanvas.clear();
                }
            }
        },
        
        clearBoard: () => {
            const chalkContent = document.getElementById('chalk-content');
            if (chalkContent) {
                chalkContent.textContent = '';
            }
            if (AppState.threeCanvas) {
                AppState.threeCanvas.clear();
            }
        }
    };
    
    // Initialize SAT exam controller
    window.satExam = {
        currentQuestion: 1,
        markedForReview: [],
        
        toggleStrikethrough: (choiceId) => {
            const element = document.getElementById(choiceId);
            if (element) {
                element.style.textDecoration = element.style.textDecoration === 'line-through' ? 'none' : 'line-through';
            }
        },
        
        toggleMarkForReview: () => {
            const questionNum = window.satExam.currentQuestion;
            const index = window.satExam.markedForReview.indexOf(questionNum);
            
            if (index > -1) {
                window.satExam.markedForReview.splice(index, 1);
            } else {
                window.satExam.markedForReview.push(questionNum);
            }
            
            // Update visual indicator
            const navButton = document.querySelector(`#question-nav button:nth-child(${questionNum})`);
            if (navButton) {
                navButton.classList.toggle('bg-yellow-500');
            }
        },
        
        showMathReference: () => {
            document.getElementById('math-reference-modal').classList.remove('hidden');
            document.getElementById('math-reference-modal').classList.add('flex');
        },
        
        hideMathReference: () => {
            document.getElementById('math-reference-modal').classList.add('hidden');
            document.getElementById('math-reference-modal').classList.remove('flex');
        },
        
        previousQuestion: () => {
            if (window.satExam.currentQuestion > 1) {
                window.satExam.currentQuestion--;
                window.satExam.updateQuestionDisplay();
            }
        },
        
        nextQuestion: () => {
            if (window.satExam.currentQuestion < 22) {
                window.satExam.currentQuestion++;
                window.satExam.updateQuestionDisplay();
            }
        },
        
        updateQuestionDisplay: () => {
            document.getElementById('sat-question-num').textContent = `${window.satExam.currentQuestion}/22`;
            // Update question content here
        }
    };
    
    // Initialize IELTS exam controller
    window.ieltsExam = {
        currentModule: 'reading',
        currentQuestion: 1,
        
        startModule: (module) => {
            window.ieltsExam.currentModule = module;
            // Hide all modules
            document.getElementById('ielts-reading').classList.add('hidden');
            document.getElementById('ielts-listening').classList.add('hidden');
            document.getElementById('ielts-writing').classList.add('hidden');
            document.getElementById('ielts-speaking').classList.add('hidden');
            
            // Show selected module
            document.getElementById(`ielts-${module}`).classList.remove('hidden');
        },
        
        previousQuestion: () => {
            if (window.ieltsExam.currentQuestion > 1) {
                window.ieltsExam.currentQuestion--;
                document.getElementById('ielts-question-num').textContent = `${window.ieltsExam.currentQuestion}/40`;
            }
        },
        
        nextQuestion: () => {
            if (window.ieltsExam.currentQuestion < 40) {
                window.ieltsExam.currentQuestion++;
                document.getElementById('ielts-question-num').textContent = `${window.ieltsExam.currentQuestion}/40`;
            }
        }
    };
    
    // Initialize Desmos calculator when SAT view is active
    if (typeof Desmos !== 'undefined') {
        const calculator = Desmos.GraphingCalculator(document.getElementById('desmos-calculator'));
    }
    
    console.log('EduUpAI initialized successfully');
});
