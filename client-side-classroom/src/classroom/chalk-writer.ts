export class ChalkWriter {
    private element: HTMLElement | null = null
    private currentText: string = ''
    private currentIndex: number = 0
    private writingInterval: number | null = null
    private writingSpeed: number = 50 // ms per character

    initialize(elementId: string) {
        this.element = document.getElementById(elementId)
        console.log('Chalk Writer initialized')
    }

    writeText(text: string, speed: number = 50): Promise<void> {
        return new Promise((resolve) => {
            this.clear()
            this.currentText = text
            this.currentIndex = 0
            this.writingSpeed = speed

            this.writingInterval = window.setInterval(() => {
                if (this.currentIndex < this.currentText.length) {
                    this.currentIndex++
                    this.updateDisplay()
                } else {
                    this.stopWriting()
                    resolve()
                }
            }, this.writingSpeed)
        })
    }

    private updateDisplay() {
        if (!this.element) return

        const textToShow = this.currentText.substring(0, this.currentIndex)
        this.element.textContent = textToShow

        // Add chalk texture effect
        this.element.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3), 0 0 10px rgba(255,255,255,0.1)'
    }

    writeMath(math: string): Promise<void> {
        // Convert LaTeX-like notation to Unicode math symbols
        const converted = this.convertMathSymbols(math)
        return this.writeText(converted, 80)
    }

    private convertMathSymbols(text: string): string {
        const conversions: Record<string, string> = {
            'pi': 'π',
            'theta': 'θ',
            'alpha': 'α',
            'beta': 'β',
            'gamma': 'γ',
            'delta': 'δ',
            'sqrt': '√',
            '^2': '²',
            '^3': '³',
            'infinity': '∞',
            'sum': '∑',
            'integral': '∫',
            'partial': '∂',
            'nabla': '∇'
        }

        let result = text
        for (const [key, value] of Object.entries(conversions)) {
            result = result.replace(new RegExp(key, 'gi'), value)
        }

        return result
    }

    stopWriting() {
        if (this.writingInterval) {
            clearInterval(this.writingInterval)
            this.writingInterval = null
        }
    }

    clear() {
        this.stopWriting()
        if (this.element) {
            this.element.textContent = ''
        }
        this.currentText = ''
        this.currentIndex = 0
    }

    pause() {
        if (this.writingInterval) {
            clearInterval(this.writingInterval)
            this.writingInterval = null
        }
    }

    resume() {
        if (!this.writingInterval && this.currentIndex < this.currentText.length) {
            this.writingInterval = window.setInterval(() => {
                if (this.currentIndex < this.currentText.length) {
                    this.currentIndex++
                    this.updateDisplay()
                } else {
                    this.stopWriting()
                }
            }, this.writingSpeed)
        }
    }
}
