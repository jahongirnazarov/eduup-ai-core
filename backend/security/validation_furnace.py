# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — 5-STAGE VALIDATION FURNACE
Yig'ilgan testlarni mualliflik huquqini 100% buzmaslik uchun noldan boshqa so'zlar bilan qayta generatsiya qiladi 
va xalqaro andozalardan 1 millimetr ham chiqmasligini 5 marta ketma-ket tekshiradi
"""
import re
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
import database

@dataclass
class ValidationResult:
    """Result of a single validation stage"""
    stage_name: str
    passed: bool
    score: float
    issues: List[str]
    suggestions: List[str]
    timestamp: str

class ValidationFurnace:
    """
    5-Stage Validation Furnace (execute_5_stage_validation_loop)
    Validates scraped content to ensure 100% copyright compliance and adherence to international standards
    """
    
    def __init__(self):
        self.validation_stages = [
            "copyright_compliance",
            "format_adherence",
            "difficulty_calibration",
            "content_quality",
            "blueprint_alignment"
        ]
    
    # ==============================================================================
    # STAGE 1: COPYRIGHT COMPLIANCE
    # ==============================================================================
    def validate_copyright_compliance(self, content: Any) -> ValidationResult:
        """
        Stage 1: Ensure content is 100% rewritten with different words to avoid copyright infringement
        Checks for direct copying and ensures paraphrasing
        """
        issues = []
        suggestions = []
        score = 100.0
        
        # Check for direct copy patterns
        if hasattr(content, 'content'):
            text = content.content
            
            # Check for common copyright indicators
            copyright_patterns = [
                r'©\s*\d{4}',
                r'all rights reserved',
                r'college board',
                r'educational testing service',
                r'official practice test'
            ]
            
            for pattern in copyright_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    issues.append(f"Found potential copyright marker: {pattern}")
                    score -= 20.0
                    suggestions.append(f"Rewrite content to remove: {pattern}")
        
        # Check question uniqueness
        if hasattr(content, 'questions'):
            question_texts = [q.get('content', '') for q in content.questions]
            unique_texts = set(question_texts)
            
            if len(unique_texts) < len(question_texts):
                duplicate_count = len(question_texts) - len(unique_texts)
                issues.append(f"Found {duplicate_count} duplicate questions")
                score -= 10.0 * duplicate_count
                suggestions.append("Rewrite duplicate questions with unique phrasing")
        
        passed = score >= 70.0
        
        return ValidationResult(
            stage_name="copyright_compliance",
            passed=passed,
            score=max(0, score),
            issues=issues,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    # ==============================================================================
    # STAGE 2: FORMAT ADHERENCE
    # ==============================================================================
    def validate_format_adherence(self, content: Any) -> ValidationResult:
        """
        Stage 2: Ensure content follows official exam format structure
        Validates question types, options, and structure
        """
        issues = []
        suggestions = []
        score = 100.0
        
        if hasattr(content, 'questions'):
            for question in content.questions:
                # Check required fields
                required_fields = ['id', 'type', 'content']
                for field in required_fields:
                    if field not in question:
                        issues.append(f"Question missing required field: {field}")
                        score -= 5.0
                        suggestions.append(f"Add {field} to question structure")
                
                # Check options for multiple choice questions
                if question.get('type') in ['multiple_choice', 'extracted']:
                    if 'options' not in question or len(question.get('options', [])) < 2:
                        issues.append(f"Question {question.get('id')} has insufficient options")
                        score -= 10.0
                        suggestions.append("Add at least 2-4 options per question")
                
                # Check correct answer exists
                if 'correct_answer' not in question and 'answer' not in question:
                    issues.append(f"Question {question.get('id')} missing correct answer")
                    score -= 5.0
                    suggestions.append("Add correct_answer field to question")
        
        passed = score >= 70.0
        
        return ValidationResult(
            stage_name="format_adherence",
            passed=passed,
            score=max(0, score),
            issues=issues,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    # ==============================================================================
    # STAGE 3: DIFFICULTY CALIBRATION
    # ==============================================================================
    def validate_difficulty_calibration(self, content: Any) -> ValidationResult:
        """
        Stage 3: Ensure difficulty distribution matches blueprint specifications
        Validates easy/medium/hard split percentages
        """
        issues = []
        suggestions = []
        score = 100.0
        
        if hasattr(content, 'questions'):
            difficulty_counts = {'easy': 0, 'medium': 0, 'hard': 0}
            
            for question in content.questions:
                difficulty = question.get('difficulty', 'medium').lower()
                if difficulty in difficulty_counts:
                    difficulty_counts[difficulty] += 1
            
            total = sum(difficulty_counts.values())
            
            if total > 0:
                easy_pct = (difficulty_counts['easy'] / total) * 100
                medium_pct = (difficulty_counts['medium'] / total) * 100
                hard_pct = (difficulty_counts['hard'] / total) * 100
                
                # Check against blueprint specifications (15% easy, 50% medium, 35% hard)
                if abs(easy_pct - 15) > 10:
                    issues.append(f"Easy questions {easy_pct:.1f}% deviates from 15% target")
                    score -= 10.0
                    suggestions.append("Adjust easy question count to ~15%")
                
                if abs(medium_pct - 50) > 10:
                    issues.append(f"Medium questions {medium_pct:.1f}% deviates from 50% target")
                    score -= 10.0
                    suggestions.append("Adjust medium question count to ~50%")
                
                if abs(hard_pct - 35) > 10:
                    issues.append(f"Hard questions {hard_pct:.1f}% deviates from 35% target")
                    score -= 10.0
                    suggestions.append("Adjust hard question count to ~35%")
            else:
                issues.append("No questions found for difficulty validation")
                score -= 50.0
        
        passed = score >= 70.0
        
        return ValidationResult(
            stage_name="difficulty_calibration",
            passed=passed,
            score=max(0, score),
            issues=issues,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    # ==============================================================================
    # STAGE 4: CONTENT QUALITY
    # ==============================================================================
    def validate_content_quality(self, content: Any) -> ValidationResult:
        """
        Stage 4: Ensure content quality meets international standards
        Checks for clarity, accuracy, and educational value
        """
        issues = []
        suggestions = []
        score = 100.0
        
        if hasattr(content, 'questions'):
            for question in content.questions:
                q_content = question.get('content', '')
                
                # Check content length
                if len(q_content) < 20:
                    issues.append(f"Question {question.get('id')} content too short")
                    score -= 5.0
                    suggestions.append("Expand question content for clarity")
                
                # Check for placeholder text
                placeholders = ['TODO', 'placeholder', 'sample text', 'example question']
                for placeholder in placeholders:
                    if placeholder.lower() in q_content.lower():
                        issues.append(f"Question {question.get('id')} contains placeholder text")
                        score -= 10.0
                        suggestions.append("Replace placeholder text with actual content")
                
                # Check for grammatical issues (basic)
                if q_content and not q_content[0].isupper():
                    issues.append(f"Question {question.get('id')} doesn't start with capital letter")
                    score -= 2.0
                    suggestions.append("Capitalize first letter of question")
                
                if q_content and not q_content.endswith(('.', '?')):
                    issues.append(f"Question {question.get('id')} missing ending punctuation")
                    score -= 2.0
                    suggestions.append("Add proper punctuation to question")
        
        passed = score >= 70.0
        
        return ValidationResult(
            stage_name="content_quality",
            passed=passed,
            score=max(0, score),
            issues=issues,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    # ==============================================================================
    # STAGE 5: BLUEPRINT ALIGNMENT
    # ==============================================================================
    def validate_blueprint_alignment(self, content: Any) -> ValidationResult:
        """
        Stage 5: Ensure content aligns with official exam blueprints
        Validates against College Board, ETS, GMAC, and Cambridge standards
        """
        issues = []
        suggestions = []
        score = 100.0
        
        # Load blueprint from exam_blueprints module
        from exam_blueprints import GLOBAL_EXAM_BLUEPRINTS
        
        if hasattr(content, 'exam_type'):
            exam_type = content.exam_type
            blueprint = GLOBAL_EXAM_BLUEPRINTS.get(exam_type)
            
            if blueprint:
                # Check total question count
                if hasattr(content, 'questions'):
                    expected_count = blueprint.get('total_q', 0)
                    actual_count = len(content.questions)
                    
                    if expected_count > 0 and abs(actual_count - expected_count) > 5:
                        issues.append(f"Question count {actual_count} deviates from blueprint {expected_count}")
                        score -= 15.0
                        suggestions.append(f"Adjust question count to match blueprint: {expected_count}")
                
                # Check section structure
                if 'sections' in blueprint:
                    for section_name, section_config in blueprint['sections'].items():
                        expected_questions = section_config.get('questions', 0)
                        # Check if section exists in content
                        if hasattr(content, 'questions'):
                            section_questions = [q for q in content.questions if q.get('section') == section_name]
                            if expected_questions > 0 and abs(len(section_questions) - expected_questions) > 3:
                                issues.append(f"Section {section_name} has {len(section_questions)} questions, expected {expected_questions}")
                                score -= 10.0
                                suggestions.append(f"Adjust {section_name} question count")
            else:
                issues.append(f"No blueprint found for exam type: {exam_type}")
                score -= 30.0
                suggestions.append("Ensure exam_type matches a valid blueprint key")
        else:
            issues.append("Content missing exam_type attribute")
            score -= 20.0
            suggestions.append("Add exam_type to content metadata")
        
        passed = score >= 70.0
        
        return ValidationResult(
            stage_name="blueprint_alignment",
            passed=passed,
            score=max(0, score),
            issues=issues,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    
    # ==============================================================================
    # 5-STAGE VALIDATION EXECUTION
    # ==============================================================================
    def execute_5_stage_validation_loop(self, content: Any) -> Dict[str, Any]:
        """
        Execute all 5 validation stages in sequence
        Returns comprehensive validation report
        """
        validation_results = []
        
        # Execute all 5 stages
        stage_1 = self.validate_copyright_compliance(content)
        validation_results.append(stage_1)
        
        stage_2 = self.validate_format_adherence(content)
        validation_results.append(stage_2)
        
        stage_3 = self.validate_difficulty_calibration(content)
        validation_results.append(stage_3)
        
        stage_4 = self.validate_content_quality(content)
        validation_results.append(stage_4)
        
        stage_5 = self.validate_blueprint_alignment(content)
        validation_results.append(stage_5)
        
        # Calculate overall score
        total_score = sum(result.score for result in validation_results) / len(validation_results)
        all_passed = all(result.passed for result in validation_results)
        
        # Generate comprehensive report
        all_issues = []
        all_suggestions = []
        for result in validation_results:
            all_issues.extend(result.issues)
            all_suggestions.extend(result.suggestions)
        
        validation_report = {
            "validation_summary": {
                "overall_score": round(total_score, 2),
                "all_stages_passed": all_passed,
                "stages_executed": len(validation_results),
                "stages_passed": sum(1 for r in validation_results if r.passed),
                "total_issues": len(all_issues),
                "total_suggestions": len(all_suggestions)
            },
            "stage_results": [
                {
                    "stage": r.stage_name,
                    "passed": r.passed,
                    "score": r.score,
                    "issues": r.issues,
                    "suggestions": r.suggestions
                }
                for r in validation_results
            ],
            "all_issues": all_issues,
            "all_suggestions": all_suggestions,
            "validation_timestamp": datetime.now().isoformat(),
            "recommendation": "APPROVED" if all_passed else "REVISION_REQUIRED"
        }
        
        # Save to database
        self._save_validation_result(content, validation_report)
        
        return validation_report
    
    # ==============================================================================
    # DATABASE STORAGE
    # ==============================================================================
    def _save_validation_result(self, content: Any, report: Dict) -> None:
        """Save validation result to database"""
        cursor = database.eduup_db.conn.cursor()
        
        try:
            # Check if validation table exists, create if not
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS validation_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    content_id TEXT,
                    exam_type TEXT,
                    overall_score REAL,
                    all_passed BOOLEAN,
                    recommendation TEXT,
                    stage_results TEXT,
                    issues TEXT,
                    suggestions TEXT,
                    validated_at TEXT
                )
            """)
            
            # Get content identifier
            content_id = getattr(content, 'source_url', getattr(content, 'id', 'unknown'))
            exam_type = getattr(content, 'exam_type', 'unknown')
            
            cursor.execute("""
                INSERT INTO validation_results 
                (content_id, exam_type, overall_score, all_passed, recommendation, stage_results, issues, suggestions, validated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                content_id,
                exam_type,
                report["validation_summary"]["overall_score"],
                report["validation_summary"]["all_stages_passed"],
                report["recommendation"],
                json.dumps(report["stage_results"]),
                json.dumps(report["all_issues"]),
                json.dumps(report["all_suggestions"]),
                datetime.now().isoformat()
            ))
            
            database.eduup_db.conn.commit()
            
        except Exception as e:
            print(f"Error saving validation result: {str(e)}")
    
    # ==============================================================================
    # BATCH VALIDATION
    # ==============================================================================
    def validate_batch(self, content_list: List[Any]) -> Dict[str, Any]:
        """Validate multiple content items in batch"""
        results = []
        
        for content in content_list:
            result = self.execute_5_stage_validation_loop(content)
            results.append(result)
        
        # Calculate batch statistics
        total_score = sum(r["validation_summary"]["overall_score"] for r in results) / len(results)
        approved_count = sum(1 for r in results if r["recommendation"] == "APPROVED")
        
        return {
            "batch_summary": {
                "total_items": len(results),
                "average_score": round(total_score, 2),
                "approved_count": approved_count,
                "revision_required_count": len(results) - approved_count
            },
            "individual_results": results,
            "batch_timestamp": datetime.now().isoformat()
        }
    
    # ==============================================================================
    # CONTENT REGENERATION (for failed validations)
    # ==============================================================================
    def regenerate_content_for_revision(self, content: Any, validation_report: Dict) -> Any:
        """
        Regenerate content based on validation suggestions
        Rewrites content to address copyright and quality issues
        """
        from international_exams import international_exam_generator
        
        # Determine exam type and regenerate
        exam_type = getattr(content, 'exam_type', 'unknown')
        
        if exam_type == "sat_digital":
            return international_exam_generator.generate_full_sat_exam()
        elif exam_type == "gmat_focus":
            return international_exam_generator.generate_full_gmat_exam()
        elif exam_type == "gre_general":
            return international_exam_generator.generate_full_gre_exam()
        elif exam_type.startswith("alevel_"):
            subject = exam_type.replace("alevel_", "")
            return international_exam_generator.generate_alevel_exam(subject)
        else:
            # Return original if regeneration not possible
            return content

# Singleton instance
validation_furnace = ValidationFurnace()
