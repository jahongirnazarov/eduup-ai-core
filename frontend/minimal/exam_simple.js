/**
 * 📝 MINIMAL EXAM SYSTEM
 * Simple deterministic exam system with JSON questions
 * No AI, 100% accurate grading
 */

class SimpleExam {
    constructor() {
        this.currentExam = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.examResults = null;
        
        // Sample question bank
        this.questionBank = {
            IELTS: {
                reading: [
                    {
                        questionId: 'ielts-r1',
                        question: 'IELTS Reading: "The Industrial Revolution began in which country?"',
                        options: ['United States', 'United Kingdom', 'Germany', 'France'],
                        correctAnswer: 'United Kingdom',
                        type: 'multiple_choice'
                    },
                    {
                        questionId: 'ielts-r2',
                        question: 'IELTS Reading: "What is the main idea of the passage about climate change?"',
                        options: ['Climate change is natural', 'Human activities cause climate change', 'Climate change is not real', 'Animals cause climate change'],
                        correctAnswer: 'Human activities cause climate change',
                        type: 'multiple_choice'
                    },
                    {
                        questionId: 'ielts-r3',
                        question: 'IELTS Reading: "According to the text, what percentage of energy comes from renewable sources?"',
                        options: ['10%', '25%', '50%', '75%'],
                        correctAnswer: '25%',
                        type: 'multiple_choice'
                    }
                ],
                listening: [
                    {
                        questionId: 'ielts-l1',
                        question: 'IELTS Listening: "What time does the lecture start?"',
                        options: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
                        correctAnswer: '10:00 AM',
                        type: 'multiple_choice'
                    },
                    {
                        questionId: 'ielts-l2',
                        question: 'IELTS Listening: "Where is the speaker from?"',
                        options: ['Australia', 'Canada', 'New Zealand', 'UK'],
                        correctAnswer: 'Australia',
                        type: 'multiple_choice'
                    }
                ],
                writing: [
                    {
                        questionId: 'ielts-w1',
                        question: 'IELTS Writing: "Write an essay about the advantages and disadvantages of remote work."',
                        type: 'essay',
                        minWords: 250
                    }
                ],
                speaking: [
                    {
                        questionId: 'ielts-s1',
                        question: 'IELTS Speaking Part 1: "Tell me about your hometown. What do you like about living there?"',
                        type: 'speaking',
                        maxDuration: 120 // 2 minutes
                    },
                    {
                        questionId: 'ielts-s2',
                        question: 'IELTS Speaking Part 2: "Describe a book you have read recently. You should say: what the book was, why you read it, what you learned from it, and whether you would recommend it."',
                        type: 'speaking',
                        maxDuration: 180 // 3 minutes
                    },
                    {
                        questionId: 'ielts-s3',
                        question: 'IELTS Speaking Part 3: "Do you think reading is important for education? Why or why not?"',
                        type: 'speaking',
                        maxDuration: 120 // 2 minutes
                    }
                ]
            },
            SAT: {
                math: [
                    {
                        questionId: 'sat-m1',
                        question: 'SAT Math: "If x + 5 = 12, what is x?"',
                        options: ['5', '6', '7', '8'],
                        correctAnswer: '7',
                        type: 'multiple_choice'
                    },
                    {
                        questionId: 'sat-m2',
                        question: 'SAT Math: "What is 15% of 200?"',
                        options: ['25', '30', '35', '40'],
                        correctAnswer: '30',
                        type: 'multiple_choice'
                    },
                    {
                        questionId: 'sat-m3',
                        question: 'SAT Math: "Solve for x: 2x - 3 = 7"',
                        options: ['4', '5', '6', '7'],
                        correctAnswer: '5',
                        type: 'multiple_choice'
                    }
                ],
                reading: [
                    {
                        questionId: 'sat-r1',
                        question: 'SAT Reading: "What is the main theme of the passage?"',
                        options: ['Love', 'War', 'Nature', 'Technology'],
                        correctAnswer: 'Nature',
                        type: 'multiple_choice'
                    }
                ]
            }
        };
    }

    /**
     * Start exam
     */
    startExam(examType, subject) {
        const questions = this.questionBank[examType]?.[subject];
        
        if (!questions || questions.length === 0) {
            throw new Error(`No questions found for ${examType} ${subject}`);
        }

        this.currentExam = {
            examType,
            subject,
            questions: [...questions], // Copy array
            totalQuestions: questions.length
        };
        
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.examResults = null;

        console.log(`[SimpleExam] Started ${examType} ${subject} exam`);
        return this.currentExam;
    }

    /**
     * Get current question
     */
    getCurrentQuestion() {
        if (!this.currentExam) {
            throw new Error('No exam in progress');
        }

        if (this.currentQuestionIndex >= this.currentExam.questions.length) {
            return null; // Exam complete
        }

        return {
            question: this.currentExam.questions[this.currentQuestionIndex],
            index: this.currentQuestionIndex,
            total: this.currentExam.totalQuestions
        };
    }

    /**
     * Submit answer
     */
    submitAnswer(questionId, answer) {
        if (!this.currentExam) {
            throw new Error('No exam in progress');
        }

        const question = this.currentExam.questions.find(q => q.questionId === questionId);
        if (!question) {
            throw new Error('Question not found');
        }

        this.userAnswers[questionId] = answer;

        console.log(`[SimpleExam] Submitted answer for ${questionId}: ${answer}`);
        return true;
    }

    /**
     * Next question
     */
    nextQuestion() {
        if (!this.currentExam) {
            throw new Error('No exam in progress');
        }

        this.currentQuestionIndex++;
        return this.getCurrentQuestion();
    }

    /**
     * Complete exam
     */
    completeExam() {
        if (!this.currentExam) {
            throw new Error('No exam in progress');
        }

        let correctCount = 0;
        const results = [];

        for (const question of this.currentExam.questions) {
            const userAnswer = this.userAnswers[question.questionId];
            const isCorrect = userAnswer === question.correctAnswer;
            
            if (isCorrect) {
                correctCount++;
            }

            results.push({
                questionId: question.questionId,
                question: question.question,
                userAnswer: userAnswer || 'No answer',
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect
            });
        }

        const percentage = (correctCount / this.currentExam.totalQuestions) * 100;
        const passingScore = 60; // 60% to pass

        this.examResults = {
            examType: this.currentExam.examType,
            subject: this.currentExam.subject,
            totalQuestions: this.currentExam.totalQuestions,
            correctAnswers: correctCount,
            percentage: percentage,
            passed: percentage >= passingScore,
            results: results,
            completedAt: new Date().toISOString()
        };

        console.log(`[SimpleExam] Exam completed: ${percentage}% (${correctCount}/${this.currentExam.totalQuestions})`);
        return this.examResults;
    }

    /**
     * Get exam results
     */
    getResults() {
        return this.examResults;
    }

    /**
     * Reset exam
     */
    resetExam() {
        this.currentExam = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.examResults = null;
    }

    /**
     * Get available exams
     */
    getAvailableExams() {
        const exams = [];
        
        for (const examType in this.questionBank) {
            for (const subject in this.questionBank[examType]) {
                exams.push({
                    examType,
                    subject,
                    questionCount: this.questionBank[examType][subject].length
                });
            }
        }

        return exams;
    }

    /**
     * Add custom question
     */
    addQuestion(examType, subject, questionData) {
        if (!this.questionBank[examType]) {
            this.questionBank[examType] = {};
        }
        
        if (!this.questionBank[examType][subject]) {
            this.questionBank[examType][subject] = [];
        }

        const question = {
            questionId: questionData.questionId || this.generateQuestionId(),
            question: questionData.question,
            options: questionData.options || [],
            correctAnswer: questionData.correctAnswer,
            type: questionData.type || 'multiple_choice',
            ...questionData
        };

        this.questionBank[examType][subject].push(question);
        return question;
    }

    /**
     * Generate question ID
     */
    generateQuestionId() {
        return `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get exam status
     */
    getStatus() {
        return {
            hasExam: this.currentExam !== null,
            currentQuestionIndex: this.currentQuestionIndex,
            totalQuestions: this.currentExam?.totalQuestions || 0,
            answeredCount: Object.keys(this.userAnswers).length,
            hasResults: this.examResults !== null
        };
    }
}

// Export singleton
const simpleExam = new SimpleExam();
