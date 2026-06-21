import { webLLM } from '../main'
import { tts } from '../audio/tts-engine'
import { avatar } from '../avatar/avatar-system'
import { chalkWriter } from './chalk-writer'
import { threeScene } from '../3d/three-scene'

export class ClassroomManager {
    private currentLesson: any = null
    private isTeaching: boolean = false

    initialize() {
        console.log('Classroom Manager initialized')
    }

    async startLesson(topic: string = 'geometry') {
        if (this.isTeaching) {
            console.log('Lesson already in progress')
            return
        }

        this.isTeaching = true

        try {
            // Generate lesson using WebLLM
            console.log(`Generating lesson about: ${topic}`)
            this.currentLesson = await webLLM.generateLesson(topic)

            // Display lesson title
            await this.displayTitle(this.currentLesson.title)

            // Teach explanation with synchronized writing and speech
            await this.teachExplanation(this.currentLesson.explanation)

            // Show examples
            if (this.currentLesson.examples && this.currentLesson.examples.length > 0) {
                await this.showExamples(this.currentLesson.examples)
            }

            // Display practice questions
            if (this.currentLesson.questions && this.currentLesson.questions.length > 0) {
                await this.showQuestions(this.currentLesson.questions)
            }

        } catch (error) {
            console.error('Lesson error:', error)
        } finally {
            this.isTeaching = false
        }
    }

    private async displayTitle(title: string) {
        avatar.setExpression('smile')
        await chalkWriter.writeText(title, 100)
        await this.delay(1000)
        chalkWriter.clear()
    }

    private async teachExplanation(explanation: string) {
        avatar.setExpression('neutral')

        // Split explanation into sentences for synchronized delivery
        const sentences = explanation.match(/[^.!?]+[.!?]+/g) || [explanation]

        for (const sentence of sentences) {
            await this.deliverSentence(sentence.trim())
        }
    }

    private async deliverSentence(sentence: string) {
        // Start speaking
        const speakPromise = tts.speak(sentence, 'en')

        // Start chalk writing (synchronized with speech)
        const writePromise = chalkWriter.writeText(sentence, 50)

        // Wait for both to complete
        await Promise.all([speakPromise, writePromise])

        // Pause before next sentence
        await this.delay(500)
        chalkWriter.clear()
    }

    private async showExamples(examples: string[]) {
        avatar.setExpression('encouraging')

        await chalkWriter.writeText('Examples:', 80)
        await this.delay(1000)

        for (const example of examples) {
            await this.deliverSentence(example)
            await this.delay(500)
        }

        chalkWriter.clear()
    }

    private async showQuestions(questions: string[]) {
        avatar.setExpression('thinking')

        await chalkWriter.writeText('Practice Questions:', 80)
        await this.delay(1000)

        for (const question of questions) {
            await chalkWriter.writeText(question, 60)
            await this.delay(2000)
            chalkWriter.clear()
        }
    }

    async demonstrate3DGeometry() {
        // Show 3D geometric shapes
        threeScene.clearScene()
        threeScene.toggleVisibility()

        // Add coordinate system
        threeScene.addCoordinateSystem()
        await this.delay(2000)

        // Add various shapes
        threeScene.addCube(1, 0x4a90e2)
        await this.delay(1000)

        threeScene.addSphere(0.8, 0xe74c3c)
        await this.delay(1000)

        threeScene.addCylinder(0.5, 0.5, 1.5, 0x27ae60)
        await this.delay(1000)

        // Add vector
        threeScene.addVector(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(2, 1, 0),
            0xffcc00
        )
    }

    toggle3D() {
        threeScene.toggleVisibility()
    }

    clearBoard() {
        chalkWriter.clear()
        tts.stop()
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    getCurrentLesson(): any {
        return this.currentLesson
    }

    isCurrentlyTeaching(): boolean {
        return this.isTeaching
    }
}
