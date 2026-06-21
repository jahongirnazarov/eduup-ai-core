export class TTSEngine {
    private synthesis: SpeechSynthesis | null = null
    private voices: SpeechSynthesisVoice[] = []
    private initialized: boolean = false

    // Language to voice preference mapping
    private LANGUAGE_VOICES: Record<string, string> = {
        'uz': 'Microsoft Madina', // Uzbek
        'en': 'Microsoft Aria', // English
        'ru': 'Microsoft Svetlana', // Russian
        'de': 'Microsoft Katja', // German
        'ko': 'Microsoft SunHi', // Korean
        'ar': 'Microsoft Fatima' // Arabic
    }

    async initialize() {
        console.log('Initializing TTS Engine...')

        this.synthesis = window.speechSynthesis

        // Wait for voices to load
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => {
                this.voices = this.synthesis!.getVoices()
                console.log(`Loaded ${this.voices.length} voices`)
            }
        }

        // Initial voice load
        this.voices = this.synthesis.getVoices()

        this.initialized = true
        console.log('TTS Engine initialized')
    }

    speak(text: string, language: string = 'en', onEnd?: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not available'))
                return
            }

            // Cancel any ongoing speech
            this.synthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = this.getLanguageCode(language)
            utterance.rate = 0.9 // Slightly slower for teaching
            utterance.pitch = 1.0

            // Select appropriate voice
            const voice = this.selectVoice(language)
            if (voice) {
                utterance.voice = voice
            }

            utterance.onend = () => {
                if (onEnd) onEnd()
                resolve()
            }

            utterance.onerror = (error) => {
                console.error('Speech synthesis error:', error)
                reject(error)
            }

            this.synthesis.speak(utterance)
        })
    }

    private selectVoice(language: string): SpeechSynthesisVoice | null {
        const preferredName = this.LANGUAGE_VOICES[language] || this.LANGUAGE_VOICES['en']

        // Try to find preferred voice
        let voice = this.voices.find(v => 
            v.name.includes(preferredName) || 
            v.lang.startsWith(this.getLanguageCode(language))
        )

        // Fallback to any voice for the language
        if (!voice) {
            voice = this.voices.find(v => v.lang.startsWith(this.getLanguageCode(language)))
        }

        // Final fallback to first available voice
        if (!voice && this.voices.length > 0) {
            voice = this.voices[0]
        }

        return voice || null
    }

    private getLanguageCode(language: string): string {
        const codes: Record<string, string> = {
            'uz': 'uz-UZ',
            'en': 'en-US',
            'ru': 'ru-RU',
            'de': 'de-DE',
            'ko': 'ko-KR',
            'ar': 'ar-AE'
        }
        return codes[language] || 'en-US'
    }

    stop() {
        if (this.synthesis) {
            this.synthesis.cancel()
        }
    }

    isSpeaking(): boolean {
        return this.synthesis ? this.synthesis.speaking : false
    }

    getAvailableVoices(): SpeechSynthesisVoice[] {
        return this.voices
    }

    isReady(): boolean {
        return this.initialized
    }
}
