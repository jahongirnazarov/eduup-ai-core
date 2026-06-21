/**
 * Synchronized Blackboard Writing System
 * ======================================
 * Real-time chalk writing animation synchronized with speech:
 * - Parses markdown-like lecture files
 * - Renders text and formulas based on timing marks
 * - Chalk-style font and animation effects
 */

class ChalkWriter {
    constructor() {
        this.boardElement = null;
        this.isWriting = false;
        this.currentText = '';
        this.writingQueue = [];
        this.currentCharIndex = 0;
        this.writingSpeed = 50; // ms per character
        this.animationFrame = null;

        // Chalk style settings
        this.chalkColor = '#ffffff';
        this.chalkSize = 24;
        this.chalkFont = 'Chalkboard SE, Comic Sans MS, cursive';

        // Timing synchronization
        this.startTime = 0;
        this.timingMarks = [];

        console.log('[ChalkWriter] Blackboard writing system initialized');
    }

    /**
     * Set blackboard element
     * @param {HTMLElement} element - Blackboard DOM element
     */
    setBoardElement(element) {
        this.boardElement = element;
        console.log('[ChalkWriter] Board element set');
    }

    /**
     * Set chalk style
     * @param {Object} style - Style options
     */
    setChalkStyle(style) {
        if (style.color) this.chalkColor = style.color;
        if (style.size) this.chalkSize = style.size;
        if (style.font) this.chalkFont = style.font;
        console.log('[ChalkWriter] Chalk style updated:', style);
    }

    /**
     * Set writing speed
     * @param {number} speed - Speed in ms per character
     */
    setWritingSpeed(speed) {
        this.writingSpeed = Math.max(10, Math.min(200, speed));
    }

    /**
     * Parse markdown-like lecture content
     * @param {string} content - Lecture content with timing marks
     * @returns {Array} Parsed segments with timing
     */
    parseLectureContent(content) {
        const segments = [];
        const lines = content.split('\n');
        let currentTime = 0;

        for (const line of lines) {
            if (line.trim() === '') continue;

            // Check for timing mark [time:ms]
            const timingMatch = line.match(/\[time:(\d+)\]/);
            if (timingMatch) {
                currentTime = parseInt(timingMatch[1]);
                continue;
            }

            // Check for formula mark [formula]
            const isFormula = line.includes('[formula]');

            // Clean the line
            const cleanLine = line
                .replace(/\[time:\d+\]/g, '')
                .replace(/\[formula\]/g, '')
                .trim();

            if (cleanLine) {
                segments.push({
                    text: cleanLine,
                    isFormula: isFormula,
                    time: currentTime,
                    duration: cleanLine.length * this.writingSpeed
                });

                currentTime += cleanLine.length * this.writingSpeed + 500;
            }
        }

        this.timingMarks = segments;
        console.log('[ChalkWriter] Parsed', segments.length, 'segments');
        return segments;
    }

    /**
     * Start synchronized writing
     * @param {string} content - Lecture content
     * @param {number} delay - Initial delay in ms
     */
    async startWriting(content, delay = 0) {
        if (!this.boardElement) {
            console.error('[ChalkWriter] Board element not set');
            return;
        }

        // Clear previous content
        this.clearBoard();

        // Parse content
        const segments = this.parseLectureContent(content);

        // Wait for delay
        if (delay > 0) {
            await this.sleep(delay);
        }

        this.isWriting = true;
        this.startTime = performance.now();

        // Write each segment
        for (const segment of segments) {
            if (!this.isWriting) break;

            await this.writeSegment(segment);
        }

        this.isWriting = false;
        console.log('[ChalkWriter] Writing complete');
    }

    /**
     * Write a single segment
     * @param {Object} segment - Segment object
     */
    async writeSegment(segment) {
        const text = segment.text;
        const isFormula = segment.isFormula;

        // Create container for this segment
        const segmentContainer = document.createElement('div');
        segmentContainer.className = 'chalk-segment';
        segmentContainer.style.cssText = `
            margin-bottom: 20px;
            font-family: ${this.chalkFont};
            font-size: ${this.chalkSize}px;
            color: ${this.chalkColor};
            white-space: pre-wrap;
            line-height: 1.4;
        `;

        if (isFormula) {
            segmentContainer.style.fontStyle = 'italic';
            segmentContainer.style.fontWeight = 'bold';
        }

        this.boardElement.appendChild(segmentContainer);

        // Write character by character
        for (let i = 0; i < text.length; i++) {
            if (!this.isWriting) break;

            const char = text[i];
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.opacity = '0';
            charSpan.style.transition = 'opacity 0.1s ease-in';
            segmentContainer.appendChild(charSpan);

            // Trigger reflow
            charSpan.offsetHeight;

            // Fade in
            charSpan.style.opacity = '1';

            // Add chalk dust effect
            if (Math.random() > 0.7) {
                this.addChalkDust(segmentContainer);
            }

            // Wait for next character
            await this.sleep(this.writingSpeed);
        }
    }

    /**
     * Add chalk dust effect
     * @param {HTMLElement} container - Container element
     */
    addChalkDust(container) {
        const dust = document.createElement('span');
        dust.textContent = '.';
        dust.style.cssText = `
            position: absolute;
            color: rgba(255, 255, 255, 0.3);
            font-size: 4px;
            pointer-events: none;
            animation: dustFade 0.5s ease-out forwards;
        `;

        // Random position
        const rect = container.getBoundingClientRect();
        const x = Math.random() * rect.width;
        const y = Math.random() * rect.height;
        dust.style.left = x + 'px';
        dust.style.top = y + 'px';

        container.style.position = 'relative';
        container.appendChild(dust);

        // Remove after animation
        setTimeout(() => dust.remove(), 500);
    }

    /**
     * Write mathematical formula with special formatting
     * @param {string} formula - Mathematical formula
     */
    async writeFormula(formula) {
        if (!this.boardElement) return;

        const formulaContainer = document.createElement('div');
        formulaContainer.className = 'chalk-formula';
        formulaContainer.style.cssText = `
            margin: 20px 0;
            padding: 15px;
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            font-family: ${this.chalkFont};
            font-size: ${this.chalkSize + 4}px;
            color: ${this.chalkColor};
            font-style: italic;
            font-weight: bold;
            text-align: center;
        `;

        this.boardElement.appendChild(formulaContainer);

        // Write formula character by character
        for (let i = 0; i < formula.length; i++) {
            if (!this.isWriting) break;

            const char = formula[i];
            const charSpan = document.createElement('span');
            charSpan.textContent = char;
            charSpan.style.opacity = '0';
            charSpan.style.transition = 'opacity 0.15s ease-in';
            formulaContainer.appendChild(charSpan);

            charSpan.offsetHeight;
            charSpan.style.opacity = '1';

            await this.sleep(this.writingSpeed * 1.2); // Slower for formulas
        }
    }

    /**
     * Write text instantly (no animation)
     * @param {string} text - Text to write
     */
    writeInstant(text) {
        if (!this.boardElement) return;

        const textContainer = document.createElement('div');
        textContainer.className = 'chalk-instant';
        textContainer.style.cssText = `
            margin-bottom: 20px;
            font-family: ${this.chalkFont};
            font-size: ${this.chalkSize}px;
            color: ${this.chalkColor};
            white-space: pre-wrap;
            line-height: 1.4;
        `;
        textContainer.textContent = text;

        this.boardElement.appendChild(textContainer);
    }

    /**
     * Clear the blackboard
     */
    clearBoard() {
        if (this.boardElement) {
            this.boardElement.innerHTML = '';
        }
        this.isWriting = false;
        console.log('[ChalkWriter] Board cleared');
    }

    /**
     * Stop writing
     */
    stopWriting() {
        this.isWriting = false;
        console.log('[ChalkWriter] Writing stopped');
    }

    /**
     * Erase specific portion of the board
     * @param {number} lines - Number of lines to erase from end
     */
    eraseLines(lines) {
        if (!this.boardElement) return;

        const segments = this.boardElement.querySelectorAll('.chalk-segment, .chalk-formula, .chalk-instant');
        const toRemove = Math.min(lines, segments.length);

        for (let i = 0; i < toRemove; i++) {
            segments[segments.length - 1 - i].remove();
        }

        console.log('[ChalkWriter] Erased', toRemove, 'lines');
    }

    /**
     * Add a drawing to the board
     * @param {string} svg - SVG string
     */
    addDrawing(svg) {
        if (!this.boardElement) return;

        const drawingContainer = document.createElement('div');
        drawingContainer.className = 'chalk-drawing';
        drawingContainer.style.cssText = `
            margin: 20px 0;
            text-align: center;
        `;
        drawingContainer.innerHTML = svg;

        this.boardElement.appendChild(drawingContainer);
    }

    /**
     * Add a highlight to existing text
     * @param {string} text - Text to highlight
     */
    highlightText(text) {
        if (!this.boardElement) return;

        const segments = this.boardElement.querySelectorAll('.chalk-segment, .chalk-instant');
        segments.forEach(segment => {
            if (segment.textContent.includes(text)) {
                segment.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
                segment.style.padding = '2px 4px';
                segment.style.borderRadius = '4px';
            }
        });
    }

    /**
     * Get current board content
     * @returns {string} Current board text
     */
    getBoardContent() {
        if (!this.boardElement) return '';
        return this.boardElement.textContent;
    }

    /**
     * Check if currently writing
     * @returns {boolean} Writing status
     */
    isActive() {
        return this.isWriting;
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Add CSS animation for chalk dust
     */
    addChalkDustAnimation() {
        if (!document.getElementById('chalk-dust-style')) {
            const style = document.createElement('style');
            style.id = 'chalk-dust-style';
            style.textContent = `
                @keyframes dustFade {
                    0% {
                        opacity: 0.5;
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(10px, -10px) scale(0.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Export singleton instance
export const chalkWriter = new ChalkWriter();
export default chalkWriter;
