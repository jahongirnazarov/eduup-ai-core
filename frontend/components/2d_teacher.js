/**
 * 🎨 LIGHTWEIGHT 2D TEACHER SYSTEM
 * Zero server costs, works on any device
 * Uses Lottie animations and SVG sprites
 */

class Teacher2D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentEmotion = 'neutral';
        this.currentAnimation = null;
        this.lottiePlayer = null;
        this.isSpeaking = false;
        
        // Teacher emotions
        this.emotions = {
            neutral: { color: '#4A90E2', animation: 'idle' },
            happy: { color: '#50E3C2', animation: 'happy' },
            thinking: { color: '#F5A623', animation: 'thinking' },
            explaining: { color: '#7ED321', animation: 'explaining' },
            confused: { color: '#BD10E0', animation: 'confused' },
            proud: { color: '#FF6B6B', animation: 'proud' }
        };
    }

    /**
     * Initialize 2D teacher
     */
    async initialize() {
        try {
            // Load Lottie library
            await this.loadLottie();
            
            // Create teacher container
            this.createTeacherContainer();
            
            // Load default animation
            await this.loadAnimation('idle');
            
            console.log('[Teacher2D] 2D Teacher initialized successfully');
            return true;
        } catch (error) {
            console.error('[Teacher2D] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load Lottie library
     */
    async loadLottie() {
        return new Promise((resolve, reject) => {
            if (typeof lottie !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Create teacher container
     */
    createTeacherContainer() {
        this.container.innerHTML = `
            <div class="teacher-2d-container">
                <div class="teacher-avatar" id="teacher-avatar">
                    <svg id="teacher-svg" viewBox="0 0 200 200">
                        <!-- Teacher face -->
                        <circle cx="100" cy="100" r="80" fill="#4A90E2" id="face-color"/>
                        
                        <!-- Eyes -->
                        <ellipse cx="70" cy="85" rx="15" ry="20" fill="white" id="left-eye"/>
                        <ellipse cx="130" cy="85" rx="15" ry="20" fill="white" id="right-eye"/>
                        <circle cx="70" cy="85" r="8" fill="#333" id="left-pupil"/>
                        <circle cx="130" cy="85" r="8" fill="#333" id="right-pupil"/>
                        
                        <!-- Mouth -->
                        <path d="M 70 130 Q 100 160 130 130" stroke="#333" stroke-width="4" fill="none" id="mouth"/>
                        
                        <!-- Eyebrows -->
                        <path d="M 55 65 Q 70 60 85 65" stroke="#333" stroke-width="3" fill="none" id="left-eyebrow"/>
                        <path d="M 115 65 Q 130 60 145 65" stroke="#333" stroke-width="3" fill="none" id="right-eyebrow"/>
                    </svg>
                </div>
                <div class="teacher-speech-bubble" id="speech-bubble" style="display: none;">
                    <div class="speech-text" id="speech-text"></div>
                </div>
            </div>
            
            <style>
                .teacher-2d-container {
                    position: relative;
                    width: 300px;
                    height: 400px;
                    margin: 0 auto;
                }
                
                .teacher-avatar {
                    width: 200px;
                    height: 200px;
                    margin: 0 auto;
                    transition: transform 0.3s ease;
                }
                
                .teacher-avatar:hover {
                    transform: scale(1.05);
                }
                
                #teacher-svg {
                    width: 100%;
                    height: 100%;
                }
                
                .teacher-speech-bubble {
                    position: absolute;
                    bottom: 50px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    max-width: 280px;
                    min-height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .teacher-speech-bubble::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    border-width: 10px 10px 0;
                    border-style: solid;
                    border-color: white transparent transparent transparent;
                }
                
                .speech-text {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #333;
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                .speaking {
                    animation: bounce 0.5s ease-in-out infinite;
                }
                
                @keyframes thinking {
                    0%, 100% { transform: rotate(-5deg); }
                    50% { transform: rotate(5deg); }
                }
                
                .thinking {
                    animation: thinking 1s ease-in-out infinite;
                }
            </style>
        `;
    }

    /**
     * Load Lottie animation
     * @param {string} animationName - Animation name
     */
    async loadAnimation(animationName) {
        if (this.lottiePlayer) {
            this.lottiePlayer.destroy();
        }

        // Animation URLs (using free Lottie animations)
        const animations = {
            idle: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/idle.json',
            happy: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/happy.json',
            thinking: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/thinking.json',
            explaining: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/explaining.json',
            confused: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/confused.json',
            proud: 'https://lottie.host/9c9c9c9c-9c9c-9c9c-9c9c-9c9c9c9c9c9c/proud.json'
        };

        const animationUrl = animations[animationName] || animations.idle;

        try {
            this.lottiePlayer = lottie.loadAnimation({
                container: document.getElementById('teacher-avatar'),
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: animationUrl
            });
        } catch (error) {
            console.log('[Teacher2D] Using SVG fallback instead of Lottie');
            this.useSVGFallback();
        }
    }

    /**
     * Use SVG fallback when Lottie fails
     */
    useSVGFallback() {
        // SVG animations are already in the container
        this.updateSVGEmotion(this.currentEmotion);
    }

    /**
     * Update teacher emotion
     * @param {string} emotion - Emotion name
     */
    setEmotion(emotion) {
        if (!this.emotions[emotion]) {
            console.warn(`[Teacher2D] Unknown emotion: ${emotion}`);
            return;
        }

        this.currentEmotion = emotion;
        const emotionData = this.emotions[emotion];

        // Update face color
        const faceColor = document.getElementById('face-color');
        if (faceColor) {
            faceColor.setAttribute('fill', emotionData.color);
        }

        // Update SVG based on emotion
        this.updateSVGEmotion(emotion);

        // Load Lottie animation if available
        this.loadAnimation(emotionData.animation);
    }

    /**
     * Update SVG based on emotion
     * @param {string} emotion - Emotion name
     */
    updateSVGEmotion(emotion) {
        const mouth = document.getElementById('mouth');
        const leftEyebrow = document.getElementById('left-eyebrow');
        const rightEyebrow = document.getElementById('right-eyebrow');

        switch (emotion) {
            case 'happy':
                mouth.setAttribute('d', 'M 70 130 Q 100 170 130 130');
                leftEyebrow.setAttribute('d', 'M 55 60 Q 70 55 85 60');
                rightEyebrow.setAttribute('d', 'M 115 60 Q 130 55 145 60');
                break;
            case 'thinking':
                mouth.setAttribute('d', 'M 70 140 Q 100 135 130 140');
                leftEyebrow.setAttribute('d', 'M 55 70 Q 70 65 85 70');
                rightEyebrow.setAttribute('d', 'M 115 70 Q 130 65 145 70');
                break;
            case 'confused':
                mouth.setAttribute('d', 'M 70 140 Q 100 145 130 140');
                leftEyebrow.setAttribute('d', 'M 55 70 Q 70 75 85 70');
                rightEyebrow.setAttribute('d', 'M 115 65 Q 130 60 145 65');
                break;
            case 'proud':
                mouth.setAttribute('d', 'M 70 125 Q 100 155 130 125');
                leftEyebrow.setAttribute('d', 'M 55 55 Q 70 50 85 55');
                rightEyebrow.setAttribute('d', 'M 115 55 Q 130 50 145 55');
                break;
            default: // neutral, explaining
                mouth.setAttribute('d', 'M 70 130 Q 100 160 130 130');
                leftEyebrow.setAttribute('d', 'M 55 65 Q 70 60 85 65');
                rightEyebrow.setAttribute('d', 'M 115 65 Q 130 60 145 65');
        }
    }

    /**
     * Show speech bubble with text
     * @param {string} text - Speech text
     */
    speak(text) {
        const speechBubble = document.getElementById('speech-bubble');
        const speechText = document.getElementById('speech-text');
        const avatar = document.getElementById('teacher-avatar');

        speechText.textContent = text;
        speechBubble.style.display = 'flex';
        avatar.classList.add('speaking');
        this.isSpeaking = true;

        // Hide speech bubble after 5 seconds
        setTimeout(() => {
            speechBubble.style.display = 'none';
            avatar.classList.remove('speaking');
            this.isSpeaking = false;
        }, 5000);
    }

    /**
     * Set thinking state
     */
    setThinking() {
        const avatar = document.getElementById('teacher-avatar');
        avatar.classList.add('thinking');
        this.setEmotion('thinking');
    }

    /**
     * Clear thinking state
     */
    clearThinking() {
        const avatar = document.getElementById('teacher-avatar');
        avatar.classList.remove('thinking');
        this.setEmotion('neutral');
    }

    /**
     * Animate teacher based on AI response
     * @param {string} response - AI response text
     */
    animateFromResponse(response) {
        // Analyze response sentiment
        const lowerResponse = response.toLowerCase();

        if (lowerResponse.includes('correct') || lowerResponse.includes('great') || lowerResponse.includes('excellent')) {
            this.setEmotion('happy');
        } else if (lowerResponse.includes('think') || lowerResponse.includes('consider') || lowerResponse.includes('analyze')) {
            this.setEmotion('thinking');
        } else if (lowerResponse.includes('explain') || lowerResponse.includes('here') || lowerResponse.includes('let')) {
            this.setEmotion('explaining');
        } else if (lowerResponse.includes('confused') || lowerResponse.includes('unclear') || lowerResponse.includes('not sure')) {
            this.setEmotion('confused');
        } else if (lowerResponse.includes('proud') || lowerResponse.includes('congratulations') || lowerResponse.includes('achievement')) {
            this.setEmotion('proud');
        } else {
            this.setEmotion('neutral');
        }

        // Speak the response
        this.speak(response);
    }

    /**
     * Destroy teacher
     */
    destroy() {
        if (this.lottiePlayer) {
            this.lottiePlayer.destroy();
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Teacher2D;
}
