export class IELTSExam {
    private container: HTMLElement | null = null
    private currentModule: 'reading' | 'listening' | 'speaking' = 'reading'
    private audioPlayed: boolean = false
    private prepTime: number = 30
    private recording: boolean = false
    private mediaRecorder: MediaRecorder | null = null
    private audioChunks: Blob[] = []

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)
    }

    initialize() {
        if (!this.container) return

        this.renderInterface()
        this.setupEventListeners()
    }

    private renderInterface() {
        if (!this.container) return

        this.container.innerHTML = `
            <div class="w-full h-full bg-ielts-gray flex flex-col">
                <!-- Header -->
                <div class="bg-ielts-red text-white px-6 py-3 flex items-center justify-between">
                    <h1 class="text-xl font-semibold">IELTS Academic</h1>
                    <div class="flex items-center space-x-2">
                        <button onclick="ieltsExam.switchModule('reading')" class="px-4 py-2 ${this.currentModule === 'reading' ? 'bg-white text-ielts-red' : 'bg-white/20'} rounded">Reading</button>
                        <button onclick="ieltsExam.switchModule('listening')" class="px-4 py-2 ${this.currentModule === 'listening' ? 'bg-white text-ielts-red' : 'bg-white/20'} rounded">Listening</button>
                        <button onclick="ieltsExam.switchModule('speaking')" class="px-4 py-2 ${this.currentModule === 'speaking' ? 'bg-white text-ielts-red' : 'bg-white/20'} rounded">Speaking</button>
                    </div>
                </div>

                <!-- Module Content -->
                <div id="module-content" class="flex-1 overflow-hidden">
                    ${this.renderCurrentModule()}
                </div>
            </div>
        `

        // Expose to window for onclick handlers
        (window as any).ieltsExam = this
    }

    private renderCurrentModule(): string {
        switch (this.currentModule) {
            case 'reading':
                return this.renderReadingModule()
            case 'listening':
                return this.renderListeningModule()
            case 'speaking':
                return this.renderSpeakingModule()
            default:
                return ''
        }
    }

    private renderReadingModule(): string {
        return `
            <div class="flex h-full">
                <!-- Reading Passage -->
                <div class="w-1/2 p-6 overflow-y-auto bg-white border-r border-gray-300">
                    <h2 class="text-2xl font-bold mb-4 text-ielts-dark">The Impact of Climate Change on Biodiversity</h2>
                    <div class="prose prose-lg text-gray-700 leading-relaxed">
                        <p class="mb-4">Climate change represents one of the most significant threats to global biodiversity. Rising temperatures, shifting precipitation patterns, and extreme weather events are disrupting ecosystems worldwide, forcing species to adapt, migrate, or face extinction.</p>
                        <p class="mb-4">Research indicates that approximately one million species are at risk of extinction due to climate change. Coral reefs, which support 25% of marine life, are particularly vulnerable. Even a 1.5°C increase in global temperature could result in the loss of 70-90% of coral reefs.</p>
                        <p class="mb-4">Terrestrial ecosystems are equally affected. Mountain species are being forced to move to higher elevations as their habitats warm, while polar species like polar bears and penguins face habitat loss as ice sheets melt.</p>
                        <p class="mb-4">Conservation efforts must focus on creating climate-resilient protected areas, establishing wildlife corridors to facilitate species migration, and reducing non-climate stressors such as habitat destruction and pollution.</p>
                        <p>International cooperation is essential, as climate change transcends national boundaries. The Paris Agreement represents a crucial step toward coordinated global action to mitigate climate impacts on biodiversity.</p>
                    </div>
                </div>

                <!-- Questions -->
                <div class="w-1/2 p-6 overflow-y-auto bg-gray-50">
                    <h3 class="text-xl font-semibold mb-4 text-ielts-dark">Questions 1-5</h3>
                    <p class="text-sm text-gray-600 mb-4">Do the following statements agree with the information given in the passage?</p>
                    <p class="text-sm text-gray-600 mb-6"><strong>TRUE</strong> if the statement agrees with the information<br><strong>FALSE</strong> if the statement contradicts the information<br><strong>NOT GIVEN</strong> if there is no information on this</p>

                    <div class="space-y-4">
                        ${this.renderReadingQuestion(1, 'Climate change affects only marine ecosystems.')}
                        ${this.renderReadingQuestion(2, 'Coral reefs support a quarter of marine life.')}
                        ${this.renderReadingQuestion(3, 'Mountain species are moving to lower elevations.')}
                        ${this.renderReadingQuestion(4, 'Polar bears are losing their habitat due to melting ice.')}
                        ${this.renderReadingQuestion(5, 'The Paris Agreement aims to protect biodiversity directly.')}
                    </div>

                    <h3 class="text-xl font-semibold mt-8 mb-4 text-ielts-dark">Questions 6-10</h3>
                    <p class="text-sm text-gray-600 mb-4">Complete the sentences below. Choose <strong>ONE WORD ONLY</strong> from the text.</p>

                    <div class="space-y-4">
                        ${this.renderFillBlank(6, 'Climate change is forcing species to adapt, migrate, or face _______.')}
                        ${this.renderFillBlank(7, 'Coral reefs support _______ of marine life.')}
                        ${this.renderFillBlank(8, 'Mountain species are moving to higher _______.')}
                        ${this.renderFillBlank(9, 'Conservation efforts should create climate-resilient _______ areas.')}
                        ${this.renderFillBlank(10, 'International cooperation is essential because climate change transcends national _______.')}
                    </div>
                </div>
            </div>
        `
    }

    private renderReadingQuestion(num: number, text: string): string {
        return `
            <div class="bg-white p-4 rounded-lg shadow">
                <p class="font-medium mb-3">${num}. ${text}</p>
                <div class="flex space-x-4">
                    <label class="flex items-center space-x-2">
                        <input type="radio" name="reading-${num}" value="true" class="w-4 h-4">
                        <span>TRUE</span>
                    </label>
                    <label class="flex items-center space-x-2">
                        <input type="radio" name="reading-${num}" value="false" class="w-4 h-4">
                        <span>FALSE</span>
                    </label>
                    <label class="flex items-center space-x-2">
                        <input type="radio" name="reading-${num}" value="not-given" class="w-4 h-4">
                        <span>NOT GIVEN</span>
                    </label>
                </div>
            </div>
        `
    }

    private renderFillBlank(num: number, text: string): string {
        return `
            <div class="bg-white p-4 rounded-lg shadow">
                <p class="font-medium mb-3">${num}. ${text.replace('_______', '<input type="text" class="border-b-2 border-gray-400 px-2 py-1 w-32 focus:outline-none focus:border-ielts-red">')}</p>
            </div>
        `
    }

    private renderListeningModule(): string {
        return `
            <div class="flex flex-col h-full p-6">
                <div class="bg-white rounded-lg shadow p-6 mb-4">
                    <h2 class="text-2xl font-bold mb-4 text-ielts-dark">Listening Section</h2>
                    
                    ${this.audioPlayed ? `
                        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p class="text-red-700 font-medium">⚠️ Audio can only be played once</p>
                        </div>
                    ` : `
                        <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p class="text-blue-700">Preparation time: <span id="prep-timer" class="font-bold">${this.prepTime}</span> seconds</p>
                        </div>
                        <button id="play-audio" class="mb-4 px-6 py-3 bg-ielts-red hover:bg-red-700 text-white rounded-lg font-medium">
                            ▶ Play Audio
                        </button>
                    `}

                    <div class="mb-4">
                        <audio id="audio-player" controls class="w-full" ${this.audioPlayed ? 'disabled' : ''}>
                            <source src="/audio/listening-sample.mp3" type="audio/mpeg">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                </div>

                <div class="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
                    <h3 class="text-xl font-semibold mb-4 text-ielts-dark">Questions 1-4</h3>
                    <p class="text-sm text-gray-600 mb-4">Complete the notes below. Write <strong>ONE WORD AND/OR A NUMBER</strong> for each answer.</p>

                    <div class="space-y-4">
                        ${this.renderFillBlank(1, 'The lecture discusses the impact of _______ on urban planning.')}
                        ${this.renderFillBlank(2, 'By 2050, _______ percent of the population will live in cities.')}
                        ${this.renderFillBlank(3, 'Smart cities use _______ to improve efficiency.')}
                        ${this.renderFillBlank(4, 'The speaker mentions _______ as a key challenge for urban development.')}
                    </div>
                </div>
            </div>
        `
    }

    private renderSpeakingModule(): string {
        return `
            <div class="flex flex-col h-full p-6">
                <div class="bg-white rounded-lg shadow p-6 mb-4">
                    <h2 class="text-2xl font-bold mb-4 text-ielts-dark">Speaking Section</h2>
                    
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2">Part 1: Introduction</h3>
                        <p class="text-gray-700 mb-4">The examiner will ask you questions about yourself, your work/studies, and familiar topics.</p>
                        
                        <div class="bg-blue-50 p-4 rounded mb-4">
                            <p class="font-medium text-blue-800">Sample Question:</p>
                            <p class="text-gray-700">"Tell me about your hometown."</p>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-2">Part 2: Cue Card</h3>
                        <div class="bg-yellow-50 p-4 rounded mb-4 border border-yellow-200">
                            <p class="font-medium text-yellow-800 mb-2">Describe a book you have read recently.</p>
                            <p class="text-sm text-gray-600">You should say:</p>
                            <ul class="text-sm text-gray-600 list-disc list-inside">
                                <li>What the book was about</li>
                                <li>Why you chose to read it</li>
                                <li>What you learned from it</li>
                                <li>And explain whether you would recommend it</li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-lg font-semibold mb-2">Part 3: Discussion</h3>
                        <p class="text-gray-700">The examiner will ask more abstract questions related to the topic in Part 2.</p>
                    </div>
                </div>

                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-xl font-semibold mb-4 text-ielts-dark">Practice Recording</h3>
                    
                    <div class="flex items-center space-x-4 mb-4">
                        <button id="start-recording" class="px-6 py-3 bg-ielts-red hover:bg-red-700 text-white rounded-lg font-medium">
                            🎤 Start Recording
                        </button>
                        <button id="stop-recording" class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium" disabled>
                            ⏹ Stop Recording
                        </button>
                    </div>

                    <div id="recording-status" class="mb-4 text-gray-600">
                        Click "Start Recording" to begin
                    </div>

                    <div id="audio-playback" class="hidden">
                        <audio id="recorded-audio" controls class="w-full"></audio>
                    </div>

                    <div class="mt-4 p-4 bg-gray-50 rounded">
                        <h4 class="font-semibold mb-2">AI Speech Analysis</h4>
                        <p class="text-sm text-gray-600">Your recording will be analyzed for:</p>
                        <ul class="text-sm text-gray-600 list-disc list-inside">
                            <li>Pronunciation accuracy</li>
                            <li>Fluency and coherence</li>
                            <li>Grammatical range</li>
                            <li>Vocabulary resource</li>
                        </ul>
                    </div>
                </div>
            </div>
        `
    }

    private setupEventListeners() {
        // Audio playback for listening
        const playButton = document.getElementById('play-audio')
        const audioPlayer = document.getElementById('audio-player')

        playButton?.addEventListener('click', () => {
            if (!this.audioPlayed && audioPlayer) {
                this.startPrepTimer()
            }
        })

        audioPlayer?.addEventListener('ended', () => {
            this.audioPlayed = true
            audioPlayer.disabled = true
            this.renderInterface()
        })

        // Recording for speaking
        const startRecording = document.getElementById('start-recording')
        const stopRecording = document.getElementById('stop-recording')

        startRecording?.addEventListener('click', () => this.startRecording())
        stopRecording?.addEventListener('click', () => this.stopRecording())
    }

    private startPrepTimer() {
        const timerElement = document.getElementById('prep-timer')
        const playButton = document.getElementById('play-audio')

        const interval = setInterval(() => {
            this.prepTime--
            if (timerElement) {
                timerElement.textContent = this.prepTime.toString()
            }

            if (this.prepTime <= 0) {
                clearInterval(interval)
                const audioPlayer = document.getElementById('audio-player')
                if (audioPlayer) {
                    audioPlayer.play()
                }
                if (playButton) {
                    playButton.disabled = true
                    playButton.textContent = 'Audio Playing...'
                }
            }
        }, 1000)
    }

    private async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            this.mediaRecorder = new MediaRecorder(stream)
            this.audioChunks = []

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data)
            }

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' })
                const audioUrl = URL.createObjectURL(audioBlob)
                const audioPlayback = document.getElementById('recorded-audio') as HTMLAudioElement
                const playbackContainer = document.getElementById('audio-playback')

                if (audioPlayback) {
                    audioPlayback.src = audioUrl
                }
                if (playbackContainer) {
                    playbackContainer.classList.remove('hidden')
                }

                // Analyze speech (placeholder for Web Speech API integration)
                this.analyzeSpeech(audioBlob)
            }

            this.mediaRecorder.start()
            this.recording = true

            const startButton = document.getElementById('start-recording') as HTMLButtonElement
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement
            const status = document.getElementById('recording-status')

            if (startButton) startButton.disabled = true
            if (stopButton) stopButton.disabled = false
            if (status) status.textContent = '🔴 Recording...'

        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('Could not access microphone. Please ensure you have granted permission.')
        }
    }

    private stopRecording() {
        if (this.mediaRecorder && this.recording) {
            this.mediaRecorder.stop()
            this.recording = false

            const startButton = document.getElementById('start-recording') as HTMLButtonElement
            const stopButton = document.getElementById('stop-recording') as HTMLButtonElement
            const status = document.getElementById('recording-status')

            if (startButton) startButton.disabled = false
            if (stopButton) stopButton.disabled = true
            if (status) status.textContent = 'Recording stopped. Processing...'
        }
    }

    private async analyzeSpeech(audioBlob: Blob) {
        // Placeholder for Web Speech API integration
        // In production, this would use the Web Speech API for speech-to-text
        // and analyze the transcript against IELTS criteria

        const status = document.getElementById('recording-status')
        if (status) {
            status.textContent = 'Analysis complete. Scores: Pronunciation: 7.0, Fluency: 6.5, Grammar: 7.0, Vocabulary: 6.5'
        }
    }

    switchModule(module: 'reading' | 'listening' | 'speaking') {
        this.currentModule = module
        this.renderInterface()
        this.setupEventListeners()
    }
}
