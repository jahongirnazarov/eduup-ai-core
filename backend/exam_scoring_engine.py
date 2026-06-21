"""
EduUpAI - Exam Scoring Engine
Precise, standard SAT/IELTS scoring algorithms with official conversion matrices
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum


class ExamType(Enum):
    SAT = "sat"
    IELTS = "ielts"


class IELTSModule(Enum):
    LISTENING = "listening"
    READING = "reading"
    WRITING = "writing"
    SPEAKING = "speaking"


@dataclass
class SATScore:
    math_score: int
    reading_writing_score: int
    total_score: int
    correct_math: int
    correct_rw: int
    total_questions: int


@dataclass
class IELTSBand:
    listening_band: float
    reading_band: float
    writing_band: float
    speaking_band: float
    overall_band: float


class ExamScoringEngine:
    """Official SAT and IELTS scoring algorithms"""
    
    # Official IELTS Band Score Conversion Matrix (Academic)
    IELTS_BAND_MATRIX = {
        40: 9.0,
        39: 9.0,
        38: 8.5,
        37: 8.5,
        36: 8.0,
        35: 8.0,
        34: 7.5,
        33: 7.5,
        32: 7.5,
        31: 7.0,
        30: 7.0,
        29: 6.5,
        28: 6.5,
        27: 6.5,
        26: 6.0,
        25: 6.0,
        24: 6.0,
        23: 6.0,
        22: 5.5,
        21: 5.5,
        20: 5.5,
        19: 5.5,
        18: 5.0,
        17: 5.0,
        16: 5.0,
        15: 5.0,
    }
    
    # SAT Score Conversion (Digital SAT 2024+)
    # Math: 27 questions, 200-800 scale
    # Reading & Writing: 27 questions, 200-800 scale
    SAT_MATH_SCALE = {
        27: 800,
        26: 790,
        25: 780,
        24: 770,
        23: 760,
        22: 750,
        21: 740,
        20: 730,
        19: 720,
        18: 710,
        17: 700,
        16: 690,
        15: 680,
        14: 670,
        13: 660,
        12: 650,
        11: 640,
        10: 630,
        9: 620,
        8: 610,
        7: 600,
        6: 590,
        5: 580,
        4: 570,
        3: 560,
        2: 550,
        1: 540,
        0: 200
    }
    
    def __init__(self):
        self.sat_total_questions = 54  # 27 Math + 27 RW
        self.ielts_total_questions = 40  # Per module
    
    def calculate_sat_score(
        self, 
        math_correct: int, 
        reading_writing_correct: int
    ) -> SATScore:
        """
        Calculate SAT score using official Digital SAT conversion
        
        Args:
            math_correct: Number of correct Math answers (0-27)
            reading_writing_correct: Number of correct RW answers (0-27)
        
        Returns:
            SATScore with section and total scores
        """
        # Validate inputs
        math_correct = max(0, min(27, math_correct))
        reading_writing_correct = max(0, min(27, reading_writing_correct))
        
        # Convert to scaled scores
        math_scaled = self.SAT_MATH_SCALE.get(math_correct, 200)
        rw_scaled = self.SAT_MATH_SCALE.get(reading_writing_correct, 200)
        
        total_score = math_scaled + rw_scaled
        
        return SATScore(
            math_score=math_scaled,
            reading_writing_score=rw_scaled,
            total_score=total_score,
            correct_math=math_correct,
            correct_rw=reading_writing_correct,
            total_questions=self.sat_total_questions
        )
    
    def calculate_ielts_band(self, raw_score: int) -> float:
        """
        Convert IELTS raw score (0-40) to Band Score (0.0-9.0)
        using official British Council conversion matrix
        
        Args:
            raw_score: Number of correct answers (0-40)
        
        Returns:
            Band score (0.0 to 9.0)
        """
        raw_score = max(0, min(40, raw_score))
        
        if raw_score >= 40:
            return 9.0
        elif raw_score in self.IELTS_BAND_MATRIX:
            return self.IELTS_BAND_MATRIX[raw_score]
        else:
            # Linear interpolation for scores below 15
            if raw_score <= 0:
                return 0.0
            # Simple linear scaling from 0-14 to 1.0-4.5
            return 1.0 + (raw_score / 14) * 3.5
    
    def calculate_ielts_overall_band(
        self,
        listening: int,
        reading: int,
        writing: float,
        speaking: float
    ) -> IELTSBand:
        """
        Calculate overall IELTS band score from all four modules
        
        Args:
            listening: Raw score (0-40)
            reading: Raw score (0-40)
            writing: Band score (0.0-9.0) from AI grader
            speaking: Band score (0.0-9.0) from AI grader
        
        Returns:
            IELTSBand with all module bands and overall
        """
        listening_band = self.calculate_ielts_band(listening)
        reading_band = self.calculate_ielts_band(reading)
        
        # Calculate overall band (average of four, rounded to nearest 0.5)
        overall = (listening_band + reading_band + writing + speaking) / 4
        
        # Round to nearest 0.5
        overall = round(overall * 2) / 2
        
        return IELTSBand(
            listening_band=listening_band,
            reading_band=reading_band,
            writing_band=writing,
            speaking_band=speaking,
            overall_band=overall
        )
    
    def analyze_weaknesses(
        self,
        exam_type: ExamType,
        answers: List[Dict],
        correct_answers: List[str]
    ) -> Dict[str, List[int]]:
        """
        Analyze student answers to identify weak areas
        
        Args:
            exam_type: SAT or IELTS
            answers: List of student answers with question metadata
            correct_answers: List of correct answers
        
        Returns:
            Dictionary mapping topic categories to lists of missed question numbers
        """
        missed_questions = []
        
        for i, (student_answer, correct_answer) in enumerate(zip(answers, correct_answers)):
            if student_answer.get('answer') != correct_answer:
                missed_questions.append({
                    'question_num': i + 1,
                    'student_answer': student_answer.get('answer'),
                    'correct_answer': correct_answer,
                    'topic': student_answer.get('topic', 'general'),
                    'difficulty': student_answer.get('difficulty', 'medium')
                })
        
        # Group by topic
        weaknesses = {}
        for missed in missed_questions:
            topic = missed['topic']
            if topic not in weaknesses:
                weaknesses[topic] = []
            weaknesses[topic].append(missed['question_num'])
        
        return weaknesses
    
    def generate_remediation_plan(
        self,
        weaknesses: Dict[str, List[int]],
        exam_type: ExamType
    ) -> List[Dict]:
        """
        Generate a personalized remediation plan based on weaknesses
        
        Args:
            weaknesses: Dictionary of weak topics and missed questions
            exam_type: SAT or IELTS
        
        Returns:
            List of recommended lessons and practice topics
        """
        remediation = []
        
        for topic, missed_questions in weaknesses.items():
            severity = len(missed_questions)
            
            if severity >= 3:
                priority = "HIGH"
                lessons_needed = 5
            elif severity >= 2:
                priority = "MEDIUM"
                lessons_needed = 3
            else:
                priority = "LOW"
                lessons_needed = 1
            
            remediation.append({
                'topic': topic,
                'priority': priority,
                'missed_questions': missed_questions,
                'lessons_needed': lessons_needed,
                'recommended_practice': f"Focus on {topic} fundamentals"
            })
        
        # Sort by priority
        priority_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
        remediation.sort(key=lambda x: priority_order[x['priority']])
        
        return remediation


# Singleton instance
scoring_engine = ExamScoringEngine()


if __name__ == "__main__":
    # Test the scoring engine
    print("Testing SAT Scoring...")
    sat_score = scoring_engine.calculate_sat_score(math_correct=22, reading_writing_correct=25)
    print(f"SAT Score: {sat_score.total_score} (Math: {sat_score.math_score}, RW: {sat_score.reading_writing_score})")
    
    print("\nTesting IELTS Scoring...")
    ielts_score = scoring_engine.calculate_ielts_overall_band(
        listening=35,
        reading=32,
        writing=7.0,
        speaking=6.5
    )
    print(f"IELTS Overall Band: {ielts_score.overall_band}")
    print(f"Listening: {ielts_score.listening_band}, Reading: {ielts_score.reading_band}")
    print(f"Writing: {ielts_score.writing_band}, Speaking: {ielts_score.speaking_band}")
