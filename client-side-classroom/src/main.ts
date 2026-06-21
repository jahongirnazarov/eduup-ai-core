import { Router } from './core/router'
import { WebLLMEngine } from './ai/webllm-engine'
import { AvatarSystem } from './avatar/avatar-system'
import { ClassroomManager } from './classroom/classroom-manager'
import { TTSEngine } from './audio/tts-engine'
import { ChalkWriter } from './classroom/chalk-writer'
import { ThreeScene } from './3d/three-scene'
import { localAIModels } from './ai/local_ai_models'
import { adaptiveBrain } from './ai/adaptive_brain'
import { lipSyncSystem } from './avatar/lip-sync'
import { satExamSimulator } from './exams/sat-exam'
import { ieltsExamSimulator } from './exams/ielts-exam'

// Global instances
export const router = new Router()
export const webLLM = new WebLLMEngine()
export const avatar = new AvatarSystem()
export const tts = new TTSEngine()
export const chalkWriter = new ChalkWriter()
export const threeScene = new ThreeScene()
export const classroom = new ClassroomManager()
export const aiModels = localAIModels
export const adaptiveSystem = adaptiveBrain
export const lipSync = lipSyncSystem
export const satExam = satExamSimulator
export const ieltsExam = ieltsExamSimulator

// Initialize application
async function init() {
    console.log('Initializing EduUp Zero-Cost Classroom...')
    
    // Check WebGPU support
    const gpuStatus = document.getElementById('gpu-status')
    if (navigator.gpu) {
        gpuStatus.textContent = '✓ WebGPU Supported'
        gpuStatus.className = 'text-sm text-green-400'
    } else {
        gpuStatus.textContent = '✗ WebGPU Not Supported'
        gpuStatus.className = 'text-sm text-red-400'
    }

    // Initialize Local AI Models (Whisper, MiniLM, WebLLM)
    try {
        await aiModels.initialize()
        const llmStatus = document.getElementById('llm-status')
        llmStatus.textContent = '✓ AI Models Ready'
        llmStatus.className = 'text-sm text-green-400'
        console.log('[Init] Local AI models loaded successfully')
    } catch (error) {
        console.error('[Init] AI models initialization failed:', error)
        const llmStatus = document.getElementById('llm-status')
        llmStatus.textContent = '✗ AI Models Failed'
        llmStatus.className = 'text-sm text-red-400'
    }

    // Initialize lip-sync system
    try {
        await lipSync.initialize()
        console.log('[Init] Lip-sync system initialized')
    } catch (error) {
        console.error('[Init] Lip-sync initialization failed:', error)
    }

    // Initialize avatar system
    await avatar.initialize()

    // Initialize TTS
    await tts.initialize()

    // Initialize 3D scene
    threeScene.initialize('three-canvas')

    // Initialize chalk writer
    chalkWriter.initialize('chalk-content')

    // Start classroom
    classroom.initialize()

    // Initialize exam simulators
    console.log('[Init] Exam simulators ready')

    console.log('EduUp Classroom initialized successfully!')
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}

// Expose to window for HTML button handlers
(window as any).router = router
(window as any).classroom = classroom
(window as any).satExam = satExam
(window as any).ieltsExam = ieltsExam
(window as any).adaptiveSystem = adaptiveSystem
(window as any).aiModels = aiModels
(window as any).lipSync = lipSync
