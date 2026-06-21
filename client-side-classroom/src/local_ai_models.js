/**
 * EduUpAI - Client-Side Neural Networks
 * Local AI models using Hugging Face Transformers.js (Xenova)
 * 100% FREE AI processing - Whisper-Tiny for STT, MiniLM for semantic analysis
 */

import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to use local cache
env.allowLocalModels = false;
env.useBrowserCache = true;

class LocalAIModels {
    constructor() {
        this.whisperModel = null;
        this.minilmModel = null;
        this.isInitialized = false;
        this.initProgress = 0;
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Initialize Whisper-Tiny for speech-to-text
            this.initProgress = 10;
            console.log('Loading Whisper-Tiny model...');
            this.whisperModel = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        this.initProgress = 10 + (progress.progress * 40);
                        this.updateLoadingScreen();
                    }
                }
            });
            
            // Initialize MiniLM for semantic analysis
            this.initProgress = 50;
            console.log('Loading MiniLM model...');
            this.minilmModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
                progress_callback: (progress) => {
                    if (progress.status === 'progress') {
                        this.initProgress = 50 + (progress.progress * 50);
                        this.updateLoadingScreen();
                    }
                }
            });
            
            this.isInitialized = true;
            this.initProgress = 100;
            this.updateLoadingScreen();
            console.log('Local AI models initialized successfully');
            
            // Hide loading screen
            setTimeout(() => {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => loadingScreen.remove(), 500);
                }
            }, 500);
            
        } catch (error) {
            console.error('Failed to initialize AI models:', error);
            this.initProgress = 0;
            // Fallback to server-side API if local models fail
            this.useFallback = true;
        }
    }
    
    updateLoadingScreen() {
        const progressBar = document.getElementById('loading-progress');
        const progressText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${this.initProgress}%`;
        }
        
        if (progressText) {
            if (this.initProgress < 50) {
                progressText.textContent = 'Ovoz modeli yuklanmoqda...';
            } else if (this.initProgress < 100) {
                progressText.textContent = 'Semantik tahlil modeli yuklanmoqda...';
            } else {
                progressText.textContent = 'Tayyor!';
            }
        }
    }
    
    async transcribeAudio(audioBlob) {
        if (!this.isInitialized && !this.useFallback) {
            await this.initialize();
        }
        
        if (this.useFallback) {
            return this.fallbackTranscribe(audioBlob);
        }
        
        try {
            // Convert audio blob to array buffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            
            // Get audio data
            const audioData = audioBuffer.getChannelData(0);
            
            // Transcribe using Whisper
            const result = await this.whisperModel(audioData, {
                language: 'english',
                task: 'transcribe',
                chunk_length_s: 30,
                stride_length_s: 5
            });
            
            return result;
            
        } catch (error) {
            console.error('Transcription error:', error);
            return this.fallbackTranscribe(audioBlob);
        }
    }
    
    async fallbackTranscribe(audioBlob) {
        // Fallback: Use Web Speech API (browser built-in)
        return new Promise((resolve, reject) => {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                reject(new Error('Speech recognition not supported'));
                return;
            }
            
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                resolve(transcript);
            };
            
            recognition.onerror = (event) => {
                reject(event.error);
            };
            
            recognition.onend = () => {
                // If no result, return empty string
                resolve('');
            };
            
            // Create audio element from blob
            const audio = new Audio(URL.createObjectURL(audioBlob));
            audio.play();
            
            recognition.start();
        });
    }
    
    async compareTextSimilarity(text1, text2) {
        if (!this.isInitialized && !this.useFallback) {
            await this.initialize();
        }
        
        if (this.useFallback) {
            return this.fallbackSimilarity(text1, text2);
        }
        
        try {
            // Get embeddings for both texts
            const embedding1 = await this.minilmModel(text1, {
                pooling: 'mean',
                normalize: true
            });
            
            const embedding2 = await this.minilmModel(text2, {
                pooling: 'mean',
                normalize: true
            });
            
            // Calculate cosine similarity
            const similarity = this.cosineSimilarity(embedding1.data, embedding2.data);
            
            return similarity;
            
        } catch (error) {
            console.error('Similarity calculation error:', error);
            return this.fallbackSimilarity(text1, text2);
        }
    }
    
    cosineSimilarity(vec1, vec2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);
        
        return dotProduct / (norm1 * norm2);
    }
    
    fallbackSimilarity(text1, text2) {
        // Simple word overlap as fallback
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }
    
    async gradeEssay(studentEssay, modelAnswer) {
        // Grade essay using semantic similarity and other metrics
        const similarity = await this.compareTextSimilarity(studentEssay, modelAnswer);
        
        const studentWords = studentEssay.split(/\s+/).length;
        const modelWords = modelAnswer.split(/\s+/).length;
        
        // Calculate various metrics
        const lengthRatio = Math.min(studentWords / modelWords, 2);
        const lengthScore = lengthRatio > 0.5 ? 1 : lengthRatio * 2;
        
        const semanticScore = similarity;
        
        // Vocabulary diversity (unique words / total words)
        const uniqueWords = new Set(studentEssay.toLowerCase().split(/\s+/)).size;
        const vocabularyScore = uniqueWords / studentWords;
        
        // Grammar check (simple heuristic - sentence length variance)
        const sentences = studentEssay.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
        const grammarScore = avgSentenceLength > 5 && avgSentenceLength < 30 ? 1 : 0.5;
        
        // Calculate overall score (0-9 band scale for IELTS)
        const overallScore = (semanticScore * 0.4 + lengthScore * 0.2 + vocabularyScore * 0.2 + grammarScore * 0.2) * 9;
        
        return {
            overall: Math.round(overallScore * 2) / 2, // Round to nearest 0.5
            task_achievement: Math.round(lengthScore * 9 * 2) / 2,
            coherence_cohesion: Math.round(semanticScore * 9 * 2) / 2,
            lexical_resource: Math.round(vocabularyScore * 9 * 2) / 2,
            grammatical_accuracy: Math.round(grammarScore * 9 * 2) / 2,
            word_count: studentWords,
            feedback: this.generateEssayFeedback(overallScore, semanticScore, vocabularyScore)
        };
    }
    
    generateEssayFeedback(score, semanticScore, vocabularyScore) {
        const feedback = [];
        
        if (score >= 7.0) {
            feedback.push('Excellent essay! Strong coherence and vocabulary.');
        } else if (score >= 6.0) {
            feedback.push('Good essay with clear structure.');
        } else if (score >= 5.0) {
            feedback.push('Adequate response, but could be improved.');
        } else {
            feedback.push('Needs significant improvement in structure and vocabulary.');
        }
        
        if (semanticScore < 0.5) {
            feedback.push('Try to stay more focused on the topic.');
        }
        
        if (vocabularyScore < 0.4) {
            feedback.push('Use more varied vocabulary to express your ideas.');
        }
        
        return feedback;
    }
    
    async gradeSpeaking(transcript) {
        // Grade speaking based on transcript analysis
        const words = transcript.split(/\s+/);
        const wordCount = words.length;
        
        // Fluency: words per minute (assuming 2-minute speaking task)
        const fluencyScore = Math.min(wordCount / 100, 1);
        
        // Vocabulary diversity
        const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
        const vocabularyScore = uniqueWords / wordCount;
        
        // Grammar: simple heuristic - check for common errors
        const grammarErrors = this.detectGrammarErrors(transcript);
        const grammarScore = Math.max(0, 1 - (grammarErrors / wordCount));
        
        // Pronunciation: can't detect without audio analysis, use average
        const pronunciationScore = 0.7;
        
        // Calculate overall band score
        const overall = (fluencyScore * 0.25 + vocabularyScore * 0.25 + grammarScore * 0.25 + pronunciationScore * 0.25) * 9;
        
        return {
            overall: Math.round(overall * 2) / 2,
            fluency: Math.round(fluencyScore * 9 * 2) / 2,
            lexical_resource: Math.round(vocabularyScore * 9 * 2) / 2,
            grammatical_accuracy: Math.round(grammarScore * 9 * 2) / 2,
            pronunciation: Math.round(pronunciationScore * 9 * 2) / 2,
            word_count: wordCount,
            feedback: this.generateSpeakingFeedback(overall, fluencyScore, grammarScore)
        };
    }
    
    detectGrammarErrors(text) {
        // Simple grammar error detection
        let errors = 0;
        
        // Check for double spaces
        errors += (text.match(/  +/g) || []).length;
        
        // Check for sentence fragments (very basic)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentences.forEach(sentence => {
            if (sentence.trim().length > 0 && !sentence.trim()[0].match(/[A-Z]/)) {
                errors++;
            }
        });
        
        return errors;
    }
    
    generateSpeakingFeedback(score, fluencyScore, grammarScore) {
        const feedback = [];
        
        if (score >= 7.0) {
            feedback.push('Fluent speaking with good grammar and vocabulary.');
        } else if (score >= 6.0) {
            feedback.push('Clear communication with minor errors.');
        } else if (score >= 5.0) {
            feedback.push('Adequate response, but work on fluency.');
        } else {
            feedback.push('Needs more practice with fluency and grammar.');
        }
        
        if (fluencyScore < 0.5) {
            feedback.push('Try to speak more fluently without long pauses.');
        }
        
        if (grammarScore < 0.6) {
            feedback.push('Pay attention to grammar and sentence structure.');
        }
        
        return feedback;
    }
    
    async generateExplanation(question, studentAnswer, correctAnswer) {
        // Generate step-by-step explanation using local LLM if available
        // For now, return a template-based explanation
        
        return `
            <div class="explanation">
                <h4>Savol:</h4>
                <p>${question}</p>
                
                <h4>Sizning javobingiz:</h4>
                <p class="incorrect">${studentAnswer}</p>
                
                <h4>To'g'ri javob:</h4>
                <p class="correct">${correctAnswer}</p>
                
                <h4>Tushuntirish:</h4>
                <p>Bu savolni hal qilish uchun quyidagi qadamlarni bajaring:</p>
                <ol>
                    <li>Savolni diqqat bilan o'qing</li>
                    <li>Berilgan ma'lumotlarni aniqlang</li>
                    <li>Mos formulani tanlang</li>
                    <li>Hisob-kitoblarni bajaring</li>
                    <li>Javobni tekshiring</li>
                </ol>
                
                <button class="practice-btn" onclick="classroom.startLesson()">
                    Malika bilan mashq qiling
                </button>
            </div>
        `;
    }
}

// Export singleton instance
const localAI = new LocalAIModels();
export default localAI;
