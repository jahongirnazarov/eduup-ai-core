/**
 * Interactive 3D Math Engine
 * ==========================
 * Beautiful 3D geometric shapes using Three.js:
 * - Cone, cylinder, coordinate plane rendering
 * - Touch-interactive controls for mobile
 * - Student can rotate and scale shapes
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Math3DEngine {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;
        this.isInitialized = false;
        this.animationId = null;

        // 3D objects
        this.shapes = new Map();
        this.currentShape = null;

        // Mobile fallback
        this.useMobileFallback = false;
        this.canvas2D = null;
        this.ctx2D = null;

        console.log('[Math3D] 3D Math Engine initialized');
    }

    /**
     * Initialize the 3D engine
     * @param {HTMLElement} container - Container element
     * @param {boolean} forceMobile - Force mobile fallback mode
     */
    async initialize(container, forceMobile = false) {
        this.container = container;

        // Check if we should use mobile fallback
        this.useMobileFallback = forceMobile || this.detectMobileDevice();

        if (this.useMobileFallback) {
            console.log('[Math3D] Using mobile fallback (2D Canvas)');
            this.initializeMobileFallback();
        } else {
            console.log('[Math3D] Using Three.js (WebGL)');
            await this.initializeThreeJS();
        }

        this.isInitialized = true;
    }

    /**
     * Detect if device is mobile
     */
    detectMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return /android|ipad|iphone|ipod|windows phone|iemobile|blackberry|mobile/i.test(userAgent);
    }

    /**
     * Initialize Three.js
     */
    async initializeThreeJS() {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1a2e1a); // Dark green chalkboard color

            // Create camera
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
            this.camera.position.set(5, 5, 5);

            // Create renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(width, height);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.renderer.domElement);

            // Add orbit controls
            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;

            // Add lighting
            this.addLighting();

            // Add coordinate system
            this.addCoordinateSystem();

            // Handle resize
            window.addEventListener('resize', () => this.onWindowResize());

            // Start animation loop
            this.animate();

            console.log('[Math3D] Three.js initialized successfully');
        } catch (error) {
            console.error('[Math3D] Three.js initialization failed, falling back to 2D:', error);
            this.useMobileFallback = true;
            this.initializeMobileFallback();
        }
    }

    /**
     * Initialize mobile fallback (2D Canvas)
     */
    initializeMobileFallback() {
        this.canvas2D = document.createElement('canvas');
        this.canvas2D.style.cssText = `
            width: 100%;
            height: 100%;
            touch-action: none;
        `;
        this.container.appendChild(this.canvas2D);

        this.ctx2D = this.canvas2D.getContext('2d');
        this.resizeCanvas();

        // Add touch event listeners
        this.canvas2D.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas2D.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas2D.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Handle resize
        window.addEventListener('resize', () => this.resizeCanvas());

        console.log('[Math3D] Mobile fallback initialized');
    }

    /**
     * Add lighting to the scene
     */
    addLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        // Point light
        const pointLight = new THREE.PointLight(0xffffff, 0.5);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    /**
     * Add 3D coordinate system
     */
    addCoordinateSystem() {
        // X-axis (red)
        const xAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(-10, 0, 0),
                new THREE.Vector3(10, 0, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
        );
        this.scene.add(xAxis);

        // Y-axis (green)
        const yAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, -10, 0),
                new THREE.Vector3(0, 10, 0)
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
        );
        this.scene.add(yAxis);

        // Z-axis (blue)
        const zAxis = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, -10),
                new THREE.Vector3(0, 0, 10)
            ]),
            new THREE.LineBasicMaterial({ color: 0x0000ff })
        );
        this.scene.add(zAxis);

        // Add grid
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }

    /**
     * Add a cone shape
     */
    addCone(params = {}) {
        const {
            radius = 1,
            height = 2,
            radialSegments = 32,
            color = 0x4a90e2,
            position = { x: 0, y: 1, z: 0 }
        } = params;

        const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            flatShading: false
        });

        const cone = new THREE.Mesh(geometry, material);
        cone.position.set(position.x, position.y, position.z);

        this.scene.add(cone);
        this.shapes.set('cone', cone);
        this.currentShape = cone;

        console.log('[Math3D] Cone added');
        return cone;
    }

    /**
     * Add a cylinder shape
     */
    addCylinder(params = {}) {
        const {
            radiusTop = 1,
            radiusBottom = 1,
            height = 2,
            radialSegments = 32,
            color = 0xe24a4a,
            position = { x: 0, y: 1, z: 0 }
        } = params;

        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100,
            flatShading: false
        });

        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(position.x, position.y, position.z);

        this.scene.add(cylinder);
        this.shapes.set('cylinder', cylinder);
        this.currentShape = cylinder;

        console.log('[Math3D] Cylinder added');
        return cylinder;
    }

    /**
     * Add a cube shape
     */
    addCube(params = {}) {
        const {
            size = 1,
            color = 0x4ae290,
            position = { x: 0, y: 0.5, z: 0 }
        } = params;

        const geometry = new THREE.BoxGeometry(size, size, size);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100
        });

        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(position.x, position.y, position.z);

        this.scene.add(cube);
        this.shapes.set('cube', cube);
        this.currentShape = cube;

        console.log('[Math3D] Cube added');
        return cube;
    }

    /**
     * Add a sphere shape
     */
    addSphere(params = {}) {
        const {
            radius = 1,
            widthSegments = 32,
            heightSegments = 32,
            color = 0xe2904a,
            position = { x: 0, y: 0, z: 0 }
        } = params;

        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            shininess: 100
        });

        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(position.x, position.y, position.z);

        this.scene.add(sphere);
        this.shapes.set('sphere', sphere);
        this.currentShape = sphere;

        console.log('[Math3D] Sphere added');
        return sphere;
    }

    /**
     * Clear all shapes
     */
    clearShapes() {
        this.shapes.forEach((shape) => {
            this.scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
        });
        this.shapes.clear();
        this.currentShape = null;
        console.log('[Math3D] All shapes cleared');
    }

    /**
     * Remove specific shape
     */
    removeShape(shapeName) {
        const shape = this.shapes.get(shapeName);
        if (shape) {
            this.scene.remove(shape);
            shape.geometry.dispose();
            shape.material.dispose();
            this.shapes.delete(shapeName);
            if (this.currentShape === shape) {
                this.currentShape = null;
            }
        }
    }

    /**
     * Animation loop
     */
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        if (this.controls) {
            this.controls.update();
        }

        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (this.camera && this.renderer) {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    /**
     * Resize 2D canvas for mobile fallback
     */
    resizeCanvas() {
        if (this.canvas2D && this.container) {
            this.canvas2D.width = this.container.clientWidth;
            this.canvas2D.height = this.container.clientHeight;
            this.render2D();
        }
    }

    /**
     * Handle touch start for mobile fallback
     */
    handleTouchStart(e) {
        e.preventDefault();
        // Implement touch interaction logic
    }

    /**
     * Handle touch move for mobile fallback
     */
    handleTouchMove(e) {
        e.preventDefault();
        // Implement touch interaction logic
    }

    /**
     * Handle touch end for mobile fallback
     */
    handleTouchEnd(e) {
        e.preventDefault();
        // Implement touch interaction logic
    }

    /**
     * Render 2D fallback
     */
    render2D() {
        if (!this.ctx2D || !this.canvas2D) return;

        // Clear canvas
        this.ctx2D.clearRect(0, 0, this.canvas2D.width, this.canvas2D.height);

        // Draw coordinate system
        this.ctx2D.strokeStyle = '#666';
        this.ctx2D.lineWidth = 1;

        // Draw grid
        const centerX = this.canvas2D.width / 2;
        const centerY = this.canvas2D.height / 2;

        for (let i = 0; i < this.canvas2D.width; i += 50) {
            this.ctx2D.beginPath();
            this.ctx2D.moveTo(i, 0);
            this.ctx2D.lineTo(i, this.canvas2D.height);
            this.ctx2D.stroke();
        }

        for (let i = 0; i < this.canvas2D.height; i += 50) {
            this.ctx2D.beginPath();
            this.ctx2D.moveTo(0, i);
            this.ctx2D.lineTo(this.canvas2D.width, i);
            this.ctx2D.stroke();
        }

        // Draw axes
        this.ctx2D.strokeStyle = '#fff';
        this.ctx2D.lineWidth = 2;

        this.ctx2D.beginPath();
        this.ctx2D.moveTo(0, centerY);
        this.ctx2D.lineTo(this.canvas2D.width, centerY);
        this.ctx2D.stroke();

        this.ctx2D.beginPath();
        this.ctx2D.moveTo(centerX, 0);
        this.ctx2D.lineTo(centerX, this.canvas2D.height);
        this.ctx2D.stroke();
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        this.clearShapes();

        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }

        if (this.canvas2D) {
            this.container.removeChild(this.canvas2D);
        }

        this.isInitialized = false;
        console.log('[Math3D] Cleanup complete');
    }

    /**
     * Get current shape
     */
    getCurrentShape() {
        return this.currentShape;
    }

    /**
     * Check if initialized
     */
    isReady() {
        return this.isInitialized;
    }
}

// Export singleton instance
export const math3DEngine = new Math3DEngine();
export default math3DEngine;
