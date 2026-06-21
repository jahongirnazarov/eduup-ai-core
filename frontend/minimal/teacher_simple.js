/**
 * 🎓 MINIMAL 2D TEACHER - Malika (Human-like with Blackboard)
 * Simple, lightweight teacher for minimal version
 * No external dependencies, works immediately
 */

class SimpleTeacher {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentEmotion = 'neutral';
        this.isSpeaking = false;
        this.blackboardText = '';
        
        this.emotions = {
            neutral: { skin: '#f5d0c5', eyes: 'normal', mouth: 'normal' },
            happy: { skin: '#f5d0c5', eyes: 'happy', mouth: 'smile' },
            thinking: { skin: '#f5d0c5', eyes: 'thinking', mouth: 'neutral' },
            explaining: { skin: '#f5d0c5', eyes: 'normal', mouth: 'talking' },
            confused: { skin: '#f5d0c5', eyes: 'confused', mouth: 'neutral' }
        };
    }

    /**
     * Initialize teacher
     */
    initialize() {
        this.render();
        console.log('[SimpleTeacher] Initialized');
    }

    /**
     * Render teacher SVG with blackboard
     */
    render() {
        this.container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 15px;">
                <!-- Blackboard -->
                <div style="background: #2d5a27; border: 8px solid #8B4513; border-radius: 5px; padding: 15px; width: 280px; height: 120px; position: relative; box-shadow: 0 4px 8px rgba(0,0,0,0.3);">
                    <div style="color: white; font-family: 'Comic Sans MS', cursive; font-size: 14px; line-height: 1.6;" id="blackboard-text">
                        Assalomu alaykum! Men Malika. Bugun IELTS va SAT tayyorlovini o'rganamiz.
                    </div>
                    <!-- Chalk -->
                    <div style="position: absolute; bottom: -15px; right: 10px; width: 8px; height: 40px; background: linear-gradient(to bottom, #ffffff, #f0f0f0); border-radius: 4px; transform: rotate(-15deg); box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
                
                <!-- Teacher (Malika) -->
                <div style="width: 220px; height: 320px; margin: 0 auto;">
                    <svg viewBox="0 0 220 320" id="teacher-svg">
                        <!-- Hair (more natural) -->
                        <ellipse cx="110" cy="60" rx="60" ry="50" fill="#1a0f0a" />
                        <path d="M 50 60 Q 50 25 110 25 Q 170 25 170 60" fill="#1a0f0a" />
                        <!-- Hair strands -->
                        <path d="M 55 60 Q 50 80 55 100" stroke="#1a0f0a" stroke-width="8" fill="none" />
                        <path d="M 165 60 Q 170 80 165 100" stroke="#1a0f0a" stroke-width="8" fill="none" />
                        
                        <!-- Face (more natural shape) -->
                        <ellipse cx="110" cy="85" rx="48" ry="55" fill="${this.emotions.neutral.skin}" id="face-bg" />
                        
                        <!-- Ears -->
                        <ellipse cx="62" cy="90" rx="8" ry="12" fill="${this.emotions.neutral.skin}" />
                        <ellipse cx="158" cy="90" rx="8" ry="12" fill="${this.emotions.neutral.skin}" />
                        
                        <!-- Eyes (more detailed) -->
                        <g id="eyes">
                            <!-- Left eye -->
                            <ellipse cx="85" cy="80" rx="14" ry="10" fill="white" />
                            <circle cx="85" cy="80" r="6" fill="#1a0f0a" id="left-pupil" />
                            <circle cx="87" cy="78" r="2" fill="white" opacity="0.8" />
                            
                            <!-- Right eye -->
                            <ellipse cx="135" cy="80" rx="14" ry="10" fill="white" />
                            <circle cx="135" cy="80" r="6" fill="#1a0f0a" id="right-pupil" />
                            <circle cx="137" cy="78" r="2" fill="white" opacity="0.8" />
                            
                            <!-- Eyelashes -->
                            <path d="M 71 75 Q 75 72 79 75" stroke="#1a0f0a" stroke-width="1.5" fill="none" />
                            <path d="M 141 75 Q 145 72 149 75" stroke="#1a0f0a" stroke-width="1.5" fill="none" />
                            
                            <!-- Eyebrows (more natural) -->
                            <path d="M 72 68 Q 85 64 98 68" stroke="#1a0f0a" stroke-width="2.5" fill="none" id="left-brow" stroke-linecap="round" />
                            <path d="M 122 68 Q 135 64 148 68" stroke="#1a0f0a" stroke-width="2.5" fill="none" id="right-brow" stroke-linecap="round" />
                        </g>
                        
                        <!-- Nose (more detailed) -->
                        <path d="M 110 85 L 110 105 Q 110 112 105 115" stroke="#d4a89a" stroke-width="2.5" fill="none" stroke-linecap="round" />
                        <ellipse cx="105" cy="115" rx="4" ry="3" fill="#e8c4b8" opacity="0.5" />
                        
                        <!-- Mouth (more natural) -->
                        <path d="M 95 130 Q 110 142 125 130" stroke="#c44536" stroke-width="3.5" fill="none" id="mouth" stroke-linecap="round" />
                        
                        <!-- Lips -->
                        <path d="M 95 130 Q 110 138 125 130" stroke="#d44536" stroke-width="2" fill="none" opacity="0.5" />
                        
                        <!-- Blush (more natural) -->
                        <ellipse cx="75" cy="110" rx="12" ry="7" fill="#ffb6c1" opacity="0.35" />
                        <ellipse cx="145" cy="110" rx="12" ry="7" fill="#ffb6c1" opacity="0.35" />
                        
                        <!-- Neck -->
                        <path d="M 95 140 L 95 155 L 125 155 L 125 140" fill="${this.emotions.neutral.skin}" />
                        
                        <!-- Body (Teacher outfit - more detailed) -->
                        <path d="M 55 155 L 165 155 L 155 260 L 65 260 Z" fill="#667eea" />
                        <path d="M 55 155 L 110 180 L 165 155" fill="#764ba2" />
                        
                        <!-- Collar -->
                        <path d="M 95 155 L 110 175 L 125 155" fill="#ffffff" />
                        
                        <!-- Arms (more natural) -->
                        <path d="M 55 155 L 35 210 L 50 218 L 70 165" fill="#667eea" />
                        <path d="M 165 155 L 185 210 L 170 218 L 150 165" fill="#667eea" />
                        
                        <!-- Hands (more detailed) -->
                        <ellipse cx="42" cy="214" rx="10" ry="12" fill="${this.emotions.neutral.skin}" />
                        <ellipse cx="178" cy="214" rx="10" ry="12" fill="${this.emotions.neutral.skin}" />
                        
                        <!-- Fingers -->
                        <path d="M 35 205 L 38 200" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        <path d="M 40 203 L 43 198" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        <path d="M 45 203 L 48 198" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        
                        <path d="M 185 205 L 182 200" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        <path d="M 180 203 L 177 198" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        <path d="M 175 203 L 172 198" stroke="${this.emotions.neutral.skin}" stroke-width="3" stroke-linecap="round" />
                        
                        <!-- Speech bubble -->
                        <g id="speech-bubble" style="display: none;">
                            <rect x="170" y="35" width="140" height="55" rx="12" fill="white" stroke="#667eea" stroke-width="2.5" filter="url(#shadow)" />
                            <polygon points="170,62 150,72 170,82" fill="white" stroke="#667eea" stroke-width="2.5" />
                            <text x="240" y="67" text-anchor="middle" font-size="12" fill="#333" id="speech-text">Salom!</text>
                        </g>
                        
                        <!-- Shadow filter -->
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
                            </filter>
                        </defs>
                    </svg>
                </div>
                
                <div style="text-align: center;">
                    <p style="color: #666; font-size: 14px; font-weight: bold;">👩‍🏫 Malika O'qituvchi</p>
                    <p style="color: #999; font-size: 12px;" id="teacher-status">Tayyor</p>
                </div>
            </div>
        `;
    }

    /**
     * Set emotion
     */
    setEmotion(emotion) {
        if (!this.emotions[emotion]) {
            console.warn(`[SimpleTeacher] Unknown emotion: ${emotion}`);
            return;
        }
        
        this.currentEmotion = emotion;
        const emotionData = this.emotions[emotion];
        
        // Update face color
        const faceBg = document.getElementById('face-bg');
        if (faceBg) {
            faceBg.setAttribute('fill', emotionData.color);
        }
        
        // Update eyes
        this.updateEyes(emotionData.eyes);
        
        // Update mouth
        this.updateMouth(emotionData.mouth);
        
        // Update status
        const status = document.getElementById('teacher-status');
        if (status) {
            status.textContent = this.getEmotionLabel(emotion);
        }
    }

    /**
     * Update eyes based on emotion
     */
    updateEyes(eyeType) {
        const leftPupil = document.getElementById('left-pupil');
        const rightPupil = document.getElementById('right-pupil');
        
        if (!leftPupil || !rightPupil) return;
        
        switch (eyeType) {
            case 'happy':
                leftPupil.setAttribute('cy', '78');
                rightPupil.setAttribute('cy', '78');
                break;
            case 'thinking':
                leftPupil.setAttribute('cy', '82');
                rightPupil.setAttribute('cy', '78');
                break;
            case 'confused':
                leftPupil.setAttribute('cy', '78');
                rightPupil.setAttribute('cy', '82');
                break;
            default:
                leftPupil.setAttribute('cy', '80');
                rightPupil.setAttribute('cy', '80');
        }
    }

    /**
     * Update mouth based on emotion
     */
    updateMouth(mouthType) {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        switch (mouthType) {
            case 'smile':
                mouth.setAttribute('d', 'M 70 125 Q 100 155 130 125');
                break;
            case 'talking':
                mouth.setAttribute('d', 'M 70 130 Q 100 145 130 130');
                break;
            case 'neutral':
            default:
                mouth.setAttribute('d', 'M 70 130 Q 100 150 130 130');
        }
    }

    /**
     * Get emotion label in Uzbek
     */
    getEmotionLabel(emotion) {
        const labels = {
            neutral: 'Tayyor',
            happy: 'Xursand',
            thinking: 'O\'ylayotgan',
            explaining: 'Tushuntirayotgan',
            confused: 'Qiziq'
        };
        return labels[emotion] || emotion;
    }

    /**
     * Show speech bubble
     */
    speak(text) {
        const speechBubble = document.getElementById('speech-bubble');
        const speechText = document.getElementById('speech-text');
        
        if (speechBubble && speechText) {
            speechText.textContent = text;
            speechBubble.style.display = 'block';
            this.isSpeaking = true;
            
            // Hide after 3 seconds
            setTimeout(() => {
                speechBubble.style.display = 'none';
                this.isSpeaking = false;
            }, 3000);
        }
    }

    /**
     * Hide speech bubble
     */
    hideSpeech() {
        const speechBubble = document.getElementById('speech-bubble');
        if (speechBubble) {
            speechBubble.style.display = 'none';
            this.isSpeaking = false;
        }
    }

    /**
     * Animate talking
     */
    animateTalking(duration = 2000) {
        const mouth = document.getElementById('mouth');
        if (!mouth) return;
        
        let toggle = true;
        const interval = setInterval(() => {
            if (toggle) {
                mouth.setAttribute('d', 'M 70 130 Q 100 145 130 130');
            } else {
                mouth.setAttribute('d', 'M 70 135 Q 100 150 130 135');
            }
            toggle = !toggle;
        }, 200);
        
        setTimeout(() => {
            clearInterval(interval);
            mouth.setAttribute('d', 'M 70 130 Q 100 150 130 130');
        }, duration);
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            emotion: this.currentEmotion,
            isSpeaking: this.isSpeaking
        };
    }
}

// Export
const simpleTeacher = new SimpleTeacher('teacher-container');
