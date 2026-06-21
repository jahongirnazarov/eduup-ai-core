export class Router {
    private currentView: string = 'classroom'

    constructor() {
        this.setupEventListeners()
    }

    private setupEventListeners() {
        window.addEventListener('popstate', (event) => {
            if (event.state) {
                this.navigate(event.state.view, false)
            }
        })
    }

    navigate(view: string, pushState: boolean = true) {
        // Hide all views
        const classroomView = document.getElementById('classroom-view')
        const satView = document.getElementById('sat-view')
        const ieltsView = document.getElementById('ielts-view')

        if (classroomView) classroomView.classList.add('hidden')
        if (satView) satView.classList.add('hidden')
        if (ieltsView) ieltsView.classList.add('hidden')

        // Show selected view
        switch (view) {
            case 'classroom':
                if (classroomView) classroomView.classList.remove('hidden')
                break
            case 'sat':
                if (satView) satView.classList.remove('hidden')
                this.loadSATModule()
                break
            case 'ielts':
                if (ieltsView) ieltsView.classList.remove('hidden')
                this.loadIELTSModule()
                break
        }

        this.currentView = view

        if (pushState) {
            history.pushState({ view }, '', `#${view}`)
        }
    }

    private async loadSATModule() {
        const { SATExam } = await import('./../exams/sat/sat-exam')
        const satExam = new SATExam('sat-container')
        satExam.initialize()
    }

    private async loadIELTSModule() {
        const { IELTSExam } = await import('./../exams/ielts/ielts-exam')
        const ieltsExam = new IELTSExam('ielts-container')
        ieltsExam.initialize()
    }

    getCurrentView(): string {
        return this.currentView
    }
}
