import * as webllm from '@mlc-ai/web-llm'

export class WebLLMEngine {
    private engine: any = null
    private initialized: boolean = false

    async initialize() {
        console.log('Initializing WebLLM engine...')

        const selectedModel = 'Llama-3-8B-Instruct-q4f16_1-MLC'

        const initProgressCallback = (report: any) => {
            console.log(`WebLLM loading: ${report.text}`)
        }

        this.engine = await webllm.CreateMLCEngine(
            selectedModel,
            {
                initProgressCallback: initProgressCallback,
                allowedModels: [selectedModel]
            }
        )

        this.initialized = true
        console.log('WebLLM engine initialized successfully')
    }

    async generateResponse(prompt: string): Promise<string> {
        if (!this.initialized || !this.engine) {
            throw new Error('WebLLM engine not initialized')
        }

        const messages = [
            { role: 'system', content: 'You are a helpful educational assistant. Provide clear, concise explanations suitable for students.' },
            { role: 'user', content: prompt }
        ]

        const reply = await this.engine.chat.completions.create({ messages })
        return reply.choices[0].message.content
    }

    async generateLesson(topic: string, level: string = 'intermediate'): Promise<any> {
        const prompt = `Create a lesson about ${topic} for ${level} level students. Include:
1. A clear title
2. A brief explanation
3. 3-5 key examples
4. Practice questions

Format as JSON with keys: title, explanation, examples, questions`

        const response = await this.generateResponse(prompt)
        
        try {
            return JSON.parse(response)
        } catch (error) {
            console.error('Failed to parse lesson JSON:', error)
            return {
                title: topic,
                explanation: response,
                examples: [],
                questions: []
            }
        }
    }

    isReady(): boolean {
        return this.initialized
    }
}
