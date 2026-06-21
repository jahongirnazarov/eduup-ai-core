import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export class ThreeScene {
    private scene: THREE.Scene | null = null
    private camera: THREE.PerspectiveCamera | null = null
    private renderer: THREE.WebGLRenderer | null = null
    private controls: OrbitControls | null = null
    private objects: THREE.Object3D[] = []
    private container: HTMLElement | null = null
    private initialized: boolean = false
    private visible: boolean = false

    initialize(containerId: string) {
        this.container = document.getElementById(containerId)
        if (!this.container) {
            console.error('Container not found:', containerId)
            return
        }

        // Scene setup
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x1a3a1a) // Match chalkboard color

        // Camera setup
        const aspect = this.container.clientWidth / this.container.clientHeight
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
        this.camera.position.set(0, 2, 5)

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.container.appendChild(this.renderer.domElement)

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.05

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
        this.scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(5, 10, 7)
        this.scene.add(directionalLight)

        // Start render loop
        this.animate()

        // Handle resize
        window.addEventListener('resize', () => this.onResize())

        this.initialized = true
        console.log('Three.js Scene initialized')
    }

    private animate() {
        requestAnimationFrame(() => this.animate())

        if (this.controls) {
            this.controls.update()
        }

        if (this.renderer && this.scene && this.camera && this.visible) {
            this.renderer.render(this.scene, this.camera)
        }
    }

    private onResize() {
        if (!this.container || !this.camera || !this.renderer) return

        const width = this.container.clientWidth
        const height = this.container.clientHeight

        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()

        this.renderer.setSize(width, height)
    }

    addCube(size: number = 1, color: number = 0x4a90e2) {
        if (!this.scene) return

        const geometry = new THREE.BoxGeometry(size, size, size)
        const material = new THREE.MeshPhongMaterial({ color })
        const cube = new THREE.Mesh(geometry, material)
        cube.position.set(0, size / 2, 0)

        this.scene.add(cube)
        this.objects.push(cube)

        return cube
    }

    addSphere(radius: number = 1, color: number = 0xe74c3c) {
        if (!this.scene) return

        const geometry = new THREE.SphereGeometry(radius, 32, 32)
        const material = new THREE.MeshPhongMaterial({ color })
        const sphere = new THREE.Mesh(geometry, material)
        sphere.position.set(0, radius, 0)

        this.scene.add(sphere)
        this.objects.push(sphere)

        return sphere
    }

    addCylinder(radiusTop: number = 1, radiusBottom: number = 1, height: number = 2, color: number = 0x27ae60) {
        if (!this.scene) return

        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32)
        const material = new THREE.MeshPhongMaterial({ color })
        const cylinder = new THREE.Mesh(geometry, material)
        cylinder.position.set(0, height / 2, 0)

        this.scene.add(cylinder)
        this.objects.push(cylinder)

        return cylinder
    }

    addCoordinateSystem() {
        if (!this.scene) return

        // X-axis (red)
        const xGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(5, 0, 0)
        ])
        const xMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
        const xAxis = new THREE.Line(xGeometry, xMaterial)
        this.scene.add(xAxis)

        // Y-axis (green)
        const yGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 5, 0)
        ])
        const yMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 })
        const yAxis = new THREE.Line(yGeometry, yMaterial)
        this.scene.add(yAxis)

        // Z-axis (blue)
        const zGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 5)
        ])
        const zMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff })
        const zAxis = new THREE.Line(zGeometry, zMaterial)
        this.scene.add(zAxis)

        // Add labels
        this.addTextLabel('X', 5.2, 0, 0, 0xff0000)
        this.addTextLabel('Y', 0, 5.2, 0, 0x00ff00)
        this.addTextLabel('Z', 0, 0, 5.2, 0x0000ff)
    }

    private addTextLabel(text: string, x: number, y: number, z: number, color: number) {
        // In production, use TextGeometry or canvas texture
        console.log(`Label: ${text} at (${x}, ${y}, ${z})`)
    }

    addVector(origin: THREE.Vector3, direction: THREE.Vector3, color: number = 0xffcc00) {
        if (!this.scene) return

        const points = [origin, origin.clone().add(direction)]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ color, linewidth: 2 })
        const arrow = new THREE.Line(geometry, material)

        // Add arrowhead
        const arrowHead = new THREE.ConeGeometry(0.1, 0.2, 8)
        const arrowHeadMesh = new THREE.Mesh(arrowHead, new THREE.MeshBasicMaterial({ color }))
        arrowHeadMesh.position.copy(origin.clone().add(direction))
        arrowHeadMesh.lookAt(origin.clone().add(direction.clone().multiplyScalar(2)))

        this.scene.add(arrow)
        this.scene.add(arrowHeadMesh)
        this.objects.push(arrow, arrowHeadMesh)
    }

    clearScene() {
        if (!this.scene) return

        this.objects.forEach(obj => {
            this.scene!.remove(obj)
        })
        this.objects = []
    }

    toggleVisibility() {
        this.visible = !this.visible
        if (this.container) {
            this.container.style.display = this.visible ? 'block' : 'none'
        }
    }

    isReady(): boolean {
        return this.initialized
    }
}
