export class SATExam {
    private container: HTMLElement | null = null
    private calculator: any = null
    private currentQuestion: number = 0
    private markedQuestions: Set<number> = new Set()
    private timeRemaining: number = 1800 // 30 minutes in seconds
    private timerInterval: number | null = null
    private highlightedText: Set<string> = new Set()

    constructor(containerId: string) {
        this.container = document.getElementById(containerId)
    }

    initialize() {
        if (!this.container) return

        this.renderInterface()
        this.loadDesmosCalculator()
        this.startTimer()
        this.setupEventListeners()
    }

    private renderInterface() {
        if (!this.container) return

        this.container.innerHTML = `
            <div class="w-full h-full bg-bluebook-background flex flex-col">
                <!-- Header -->
                <div class="bg-bluebook-blue text-white px-6 py-3 flex items-center justify-between">
                    <h1 class="text-xl font-semibold">Digital SAT - Math Section</h1>
                    <div class="flex items-center space-x-4">
                        <button id="reference-btn" class="px-4 py-2 bg-white/20 hover:bg-white/30 rounded">Reference Sheet</button>
                        <div id="timer" class="text-lg font-mono">30:00</div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="flex flex-1 overflow-hidden">
                    <!-- Question Panel -->
                    <div class="flex-1 p-6 overflow-y-auto">
                        <div id="question-container" class="max-w-3xl mx-auto">
                            <!-- Questions will be rendered here -->
                        </div>
                    </div>

                    <!-- Calculator Panel -->
                    <div class="w-96 bg-white border-l border-gray-300">
                        <div id="calculator" class="w-full h-full"></div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="bg-gray-100 border-t border-gray-300 px-6 py-3 flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <button id="prev-btn" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Previous</button>
                        <button id="next-btn" class="px-4 py-2 bg-bluebook-blue hover:bg-bluebook-light text-white rounded">Next</button>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="mark-btn" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded">Mark for Review</button>
                        <button id="submit-btn" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded">Submit</button>
                    </div>
                </div>

                <!-- Reference Sheet Modal -->
                <div id="reference-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50">
                    <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
                        <h2 class="text-2xl font-bold mb-4">Math Reference Sheet</h2>
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-semibold">Area</h3>
                                <p>Triangle: A = ½bh</p>
                                <p>Rectangle: A = lw</p>
                                <p>Circle: A = πr²</p>
                            </div>
                            <div>
                                <h3 class="font-semibold">Volume</h3>
                                <p>Rectangular Prism: V = lwh</p>
                                <p>Cylinder: V = πr²h</p>
                                <p>Sphere: V = (4/3)πr³</p>
                            </div>
                            <div>
                                <h3 class="font-semibold">Pythagorean Theorem</h3>
                                <p>a² + b² = c²</p>
                            </div>
                            <div>
                                <h3 class="font-semibold">Special Right Triangles</h3>
                                <p>45-45-90: legs = x, hypotenuse = x√2</p>
                                <p>30-60-90: short leg = x, long leg = x√3, hypotenuse = 2x</p>
                            </div>
                        </div>
                        <button id="close-reference" class="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">Close</button>
                    </div>
                </div>
            </div>
        `

        this.renderQuestions()
    }

    private renderQuestions() {
        const questions = this.getSampleQuestions()
        const container = document.getElementById('question-container')
        if (!container) return

        container.innerHTML = questions.map((q, index) => `
            <div class="question-block mb-8 p-4 bg-white rounded-lg shadow" data-question="${index}">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-lg font-semibold text-bluebook-blue">Question ${index + 1}</span>
                    ${this.markedQuestions.has(index) ? '<span class="text-yellow-600 font-semibold">★ Marked for Review</span>' : ''}
                </div>
                <p class="text-gray-800 mb-4 leading-relaxed" id="question-text-${index}">${q.text}</p>
                <div class="space-y-2">
                    ${q.options.map((opt, optIndex) => `
                        <div class="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer option-item" data-option="${optIndex}">
                            <input type="radio" name="q${index}" value="${optIndex}" class="w-4 h-4">
                            <span class="text-gray-700">${String.fromCharCode(65 + optIndex)}. ${opt}</span>
                            <button class="ml-auto text-red-500 hover:text-red-700 strikethrough-btn" data-option="${optIndex}">✗</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')

        this.currentQuestion = 0
        this.highlightCurrentQuestion()
    }

    private getSampleQuestions() {
        return [
            {
                text: 'If f(x) = 2x² - 3x + 1, what is the value of f(3)?',
                options: ['10', '13', '16', '19']
            },
            {
                text: 'A circle has an area of 36π. What is the circumference of the circle?',
                options: ['6π', '12π', '18π', '24π']
            },
            {
                text: 'What is the slope of the line that passes through points (2, 4) and (6, 10)?',
                options: ['1.5', '2', '2.5', '3']
            }
        ]
    }

    private loadDesmosCalculator() {
        // Load Desmos API
        const script = document.createElement('script')
        script.src = 'https://www.desmos.com/api/v1.9/calculator.js'
        script.onload = () => {
            const calculatorElement = document.getElementById('calculator')
            if (calculatorElement && (window as any).Desmos) {
                this.calculator = (window as any).Desmos.GraphingCalculator(calculatorElement, {
                    keypad: true,
                    expressions: true,
                    settingsMenu: true,
                    zoomButtons: true,
                    expressionsTopbar: true
                })
            }
        }
        document.head.appendChild(script)
    }

    private startTimer() {
        this.timerInterval = window.setInterval(() => {
            this.timeRemaining--
            this.updateTimerDisplay()

            if (this.timeRemaining <= 0) {
                this.stopTimer()
                alert('Time is up! Submitting exam...')
                this.submitExam()
            }
        }, 1000)
    }

    private updateTimerDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60)
        const seconds = this.timeRemaining % 60
        const timerElement = document.getElementById('timer')
        if (timerElement) {
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
    }

    private stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval)
            this.timerInterval = null
        }
    }

    private setupEventListeners() {
        // Reference sheet modal
        const referenceBtn = document.getElementById('reference-btn')
        const referenceModal = document.getElementById('reference-modal')
        const closeReference = document.getElementById('close-reference')

        referenceBtn?.addEventListener('click', () => {
            referenceModal?.classList.remove('hidden')
            referenceModal?.classList.add('flex')
        })

        closeReference?.addEventListener('click', () => {
            referenceModal?.classList.add('hidden')
            referenceModal?.classList.remove('flex')
        })

        // Navigation
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousQuestion())
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextQuestion())

        // Mark for review
        document.getElementById('mark-btn')?.addEventListener('click', () => this.toggleMark())

        // Submit
        document.getElementById('submit-btn')?.addEventListener('click', () => this.submitExam())

        // Text highlighting
        this.setupTextHighlighting()

        // Strikethrough
        this.setupStrikethrough()
    }

    private setupTextHighlighting() {
        document.addEventListener('mouseup', () => {
            const selection = window.getSelection()
            if (selection && selection.toString().trim()) {
                const range = selection.getRangeAt(0)
                const span = document.createElement('span')
                span.className = 'bg-yellow-300'
                span.textContent = selection.toString()
                range.deleteContents()
                range.insertNode(span)
                selection.removeAllRanges()
            }
        })
    }

    private setupStrikethrough() {
        document.querySelectorAll('.strikethrough-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const optionIndex = (e.target as HTMLElement).dataset.option
                const optionElement = (e.target as HTMLElement).parentElement
                if (optionElement) {
                    optionElement.classList.toggle('line-through')
                    optionElement.classList.toggle('opacity-50')
                }
            })
        })
    }

    private previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--
            this.highlightCurrentQuestion()
        }
    }

    private nextQuestion() {
        const questions = this.getSampleQuestions()
        if (this.currentQuestion < questions.length - 1) {
            this.currentQuestion++
            this.highlightCurrentQuestion()
        }
    }

    private highlightCurrentQuestion() {
        document.querySelectorAll('.question-block').forEach((block, index) => {
            if (index === this.currentQuestion) {
                block.classList.add('ring-2', 'ring-bluebook-blue')
                block.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                block.classList.remove('ring-2', 'ring-bluebook-blue')
            }
        })
    }

    private toggleMark() {
        if (this.markedQuestions.has(this.currentQuestion)) {
            this.markedQuestions.delete(this.currentQuestion)
        } else {
            this.markedQuestions.add(this.currentQuestion)
        }
        this.renderQuestions()
    }

    private submitExam() {
        this.stopTimer()
        const answers = this.collectAnswers()
        console.log('Exam submitted with answers:', answers)
        alert('Exam submitted successfully!')
    }

    private collectAnswers() {
        const answers: Record<number, number> = {}
        document.querySelectorAll('input[type="radio"]:checked').forEach(input => {
            const name = (input as HTMLInputElement).name
            const questionIndex = parseInt(name.replace('q', ''))
            answers[questionIndex] = parseInt((input as HTMLInputElement).value)
        })
        return answers
    }
}
