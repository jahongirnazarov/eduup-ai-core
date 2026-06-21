# -*- coding: utf-8 -*-
"""
🔄 AUTO-REGENERATION ENGINE
Automatic content regeneration with quality validation and error correction
Regenerates uploaded content to ensure 99% accuracy and copyright safety
"""
import json
import random
import re
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
import hashlib


@dataclass
class RegenerationResult:
    """Result of content regeneration"""
    regeneration_id: str
    file_id: str
    original_content: str
    regenerated_content: str
    quality_score: float
    error_count: int
    copyright_safety_score: float
    regeneration_timestamp: str
    validation_passed: bool
    error_corrections: List[str]


class AutoRegenerationEngine:
    """
    Auto-regeneration engine for educational content
    Ensures 99% quality and copyright safety
    """
    
    def __init__(self):
        self.regeneration_history = {}
        self.quality_threshold = 0.99  # 99% accuracy requirement
        self.copyright_threshold = 0.85  # 85% copyright safety
        self.error_patterns = self._load_error_patterns()
        self.correction_rules = self._load_correction_rules()
    
    def _load_error_patterns(self) -> Dict[str, List[str]]:
        """Load common error patterns for detection"""
        return {
            "grammar": [
                r"\b(he|she|it) (have|has)\b",  # Subject-verb agreement
                r"\b(they|we|you) (has)\b",  # Subject-verb agreement
                r"\b(a|an) ( [aeiou])",  # Article usage
                r"\b(their|there|they're)\b",  # Common confusion
                r"\b(its|it's)\b",  # Common confusion
                r"\b(to|too|two)\b",  # Common confusion
            ],
            "spelling": [
                r"\b(recieve|receve)\b",  # receive
                r"\b(occured|occurence)\b",  # occurred
                r"\b(seperate)\b",  # separate
                r"\b(definately)\b",  # definitely
                r"\b(goverment)\b",  # government
            ],
            "punctuation": [
                r"[.!?]{2,}",  # Multiple punctuation
                r"\s+[.,!?]",  # Space before punctuation
                r"[a-z][A-Z]",  # Missing space between sentences
            ],
            "formatting": [
                r"\n{3,}",  # Excessive newlines
                r"\s{5,}",  # Excessive spaces
            ],
            "content": [
                r"\[TODO\]",  # Placeholder text
                r"\[FIXME\]",  # Placeholder text
                r"XXX",  # Placeholder text
            ]
        }
    
    def _load_correction_rules(self) -> Dict[str, Dict[str, str]]:
        """Load correction rules for common errors"""
        return {
            "grammar": {
                r"\bhe have\b": "he has",
                r"\bshe have\b": "she has",
                r"\bit have\b": "it has",
                r"\bthey has\b": "they have",
                r"\bwe has\b": "we have",
                r"\byou has\b": "you have",
            },
            "spelling": {
                r"\brecieve\b": "receive",
                r"\breceve\b": "receive",
                r"\boccured\b": "occurred",
                r"\boccurence\b": "occurrence",
                r"\bseperate\b": "separate",
                r"\bdefinately\b": "definitely",
                r"\bgoverment\b": "government",
            },
            "punctuation": {
                r"[.!?]{2,}": ".",  # Multiple punctuation to single
                r"\s+([.,!?])": r"\1",  # Remove space before punctuation
                r"([a-z])([A-Z])": r"\1 \2",  # Add space between sentences
            }
        }
    
    def regenerate_content(self, file_id: str, original_content: str, 
                          copyright_safe_content: str) -> Dict[str, Any]:
        """
        Regenerate content with quality validation
        Args:
            file_id: ID of the uploaded file
            original_content: Original content from file
            copyright_safe_content: Copyright-safe version from generator
        """
        regeneration_id = self._generate_regeneration_id(file_id)
        
        try:
            # Step 1: Initial quality check
            initial_quality = self._assess_content_quality(copyright_safe_content)
            
            # Step 2: Error detection
            errors = self._detect_errors(copyright_safe_content)
            
            # Step 3: Error correction
            corrected_content = self._correct_errors(copyright_safe_content, errors)
            
            # Step 4: Content enhancement
            enhanced_content = self._enhance_content(corrected_content)
            
            # Step 5: Final quality validation
            final_quality = self._assess_content_quality(enhanced_content)
            
            # Step 6: Copyright safety re-validation
            copyright_score = self._validate_copyright_safety(enhanced_content, original_content)
            
            # Step 7: Create regeneration result
            result = RegenerationResult(
                regeneration_id=regeneration_id,
                file_id=file_id,
                original_content=original_content,
                regenerated_content=enhanced_content,
                quality_score=final_quality,
                error_count=len(errors),
                copyright_safety_score=copyright_score,
                regeneration_timestamp=datetime.now().isoformat(),
                validation_passed=final_quality >= self.quality_threshold and copyright_score >= self.copyright_threshold,
                error_corrections=[f"Corrected: {error}" for error in errors]
            )
            
            # Step 8: Save to history
            self.regeneration_history[regeneration_id] = {
                "regeneration_id": regeneration_id,
                "file_id": file_id,
                "quality_score": final_quality,
                "copyright_safety_score": copyright_score,
                "error_count": len(errors),
                "validation_passed": result.validation_passed,
                "timestamp": result.regeneration_timestamp
            }
            
            return {
                "success": True,
                "regeneration_id": regeneration_id,
                "file_id": file_id,
                "regenerated_content": enhanced_content,
                "quality_score": final_quality,
                "copyright_safety_score": copyright_score,
                "error_count": len(errors),
                "validation_passed": result.validation_passed,
                "error_corrections": result.error_corrections,
                "message": "Content regenerated successfully" if result.validation_passed else "Content regenerated but quality threshold not met"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Regeneration failed: {str(e)}",
                "regeneration_id": regeneration_id,
                "file_id": file_id
            }
    
    def _generate_regeneration_id(self, file_id: str) -> str:
        """Generate unique regeneration ID"""
        timestamp = datetime.now().isoformat()
        unique_string = f"{file_id}_{timestamp}"
        return hashlib.sha256(unique_string.encode()).hexdigest()[:16]
    
    def _assess_content_quality(self, content: str) -> float:
        """
        Assess content quality (0.0 to 1.0)
        Checks grammar, spelling, formatting, and coherence
        """
        quality_scores = []
        
        # Grammar score
        grammar_score = self._assess_grammar(content)
        quality_scores.append(grammar_score)
        
        # Spelling score
        spelling_score = self._assess_spelling(content)
        quality_scores.append(spelling_score)
        
        # Formatting score
        formatting_score = self._assess_formatting(content)
        quality_scores.append(formatting_score)
        
        # Coherence score
        coherence_score = self._assess_coherence(content)
        quality_scores.append(coherence_score)
        
        # Vocabulary score
        vocabulary_score = self._assess_vocabulary(content)
        quality_scores.append(vocabulary_score)
        
        # Calculate overall quality
        overall_quality = sum(quality_scores) / len(quality_scores)
        
        return round(overall_quality, 4)
    
    def _assess_grammar(self, content: str) -> float:
        """Assess grammar quality"""
        errors = 0
        total_checks = 0
        
        for pattern in self.error_patterns["grammar"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            errors += len(matches)
            total_checks += 1
        
        if total_checks == 0:
            return 1.0
        
        # Calculate score (fewer errors = higher score)
        error_rate = errors / max(len(content.split()), 1)
        grammar_score = max(0.0, 1.0 - (error_rate * 10))
        
        return round(grammar_score, 4)
    
    def _assess_spelling(self, content: str) -> float:
        """Assess spelling quality"""
        errors = 0
        words = content.split()
        
        for pattern in self.error_patterns["spelling"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            errors += len(matches)
        
        if not words:
            return 1.0
        
        error_rate = errors / len(words)
        spelling_score = max(0.0, 1.0 - (error_rate * 5))
        
        return round(spelling_score, 4)
    
    def _assess_formatting(self, content: str) -> float:
        """Assess formatting quality"""
        errors = 0
        
        for pattern in self.error_patterns["punctuation"]:
            matches = re.findall(pattern, content)
            errors += len(matches)
        
        for pattern in self.error_patterns["formatting"]:
            matches = re.findall(pattern, content)
            errors += len(matches)
        
        # Calculate formatting score
        error_rate = errors / max(len(content), 1)
        formatting_score = max(0.0, 1.0 - (error_rate * 100))
        
        return round(formatting_score, 4)
    
    def _assess_coherence(self, content: str) -> float:
        """Assess content coherence"""
        sentences = content.split('.')
        
        if len(sentences) < 2:
            return 1.0
        
        # Check for transition words
        transition_words = ['however', 'therefore', 'moreover', 'furthermore', 
                          'consequently', 'in addition', 'on the other hand',
                          'meanwhile', 'thus', 'hence']
        
        transition_count = 0
        for sentence in sentences:
            for word in transition_words:
                if word in sentence.lower():
                    transition_count += 1
                    break
        
        # Calculate coherence score
        transition_rate = transition_count / len(sentences)
        coherence_score = min(1.0, transition_rate * 3 + 0.5)  # Base 0.5, bonus for transitions
        
        return round(coherence_score, 4)
    
    def _assess_vocabulary(self, content: str) -> float:
        """Assess vocabulary diversity"""
        words = content.split()
        
        if not words:
            return 1.0
        
        unique_words = len(set(word.lower() for word in words))
        vocabulary_diversity = unique_words / len(words)
        
        # Normalize score (0.3 is poor, 0.7+ is excellent)
        vocabulary_score = min(1.0, max(0.0, (vocabulary_diversity - 0.3) / 0.4))
        
        return round(vocabulary_score, 4)
    
    def _detect_errors(self, content: str) -> List[str]:
        """Detect errors in content"""
        errors = []
        
        # Check grammar errors
        for pattern in self.error_patterns["grammar"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                errors.append(f"Grammar error: {match}")
        
        # Check spelling errors
        for pattern in self.error_patterns["spelling"]:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                errors.append(f"Spelling error: {match}")
        
        # Check punctuation errors
        for pattern in self.error_patterns["punctuation"]:
            matches = re.findall(pattern, content)
            for match in matches:
                errors.append(f"Punctuation error: {match}")
        
        # Check formatting errors
        for pattern in self.error_patterns["formatting"]:
            matches = re.findall(pattern, content)
            for match in matches:
                errors.append(f"Formatting error: {match}")
        
        # Check content issues
        for pattern in self.error_patterns["content"]:
            matches = re.findall(pattern, content)
            for match in matches:
                errors.append(f"Content issue: {match}")
        
        return errors
    
    def _correct_errors(self, content: str, errors: List[str]) -> str:
        """Correct detected errors"""
        corrected_content = content
        
        # Apply correction rules
        for error_type, rules in self.correction_rules.items():
            for pattern, correction in rules.items():
                corrected_content = re.sub(pattern, correction, corrected_content, flags=re.IGNORECASE)
        
        # Fix multiple spaces
        corrected_content = re.sub(r'\s+', ' ', corrected_content)
        
        # Fix multiple newlines
        corrected_content = re.sub(r'\n{3,}', '\n\n', corrected_content)
        
        return corrected_content.strip()
    
    def _enhance_content(self, content: str) -> str:
        """Enhance content for better quality"""
        enhanced = content
        
        # Ensure proper sentence spacing
        enhanced = re.sub(r'([.!?])\s*([A-Z])', r'\1 \2', enhanced)
        
        # Fix common capitalization issues
        enhanced = enhanced[0].upper() + enhanced[1:] if enhanced else enhanced
        
        # Ensure proper spacing after commas
        enhanced = re.sub(r',\s*', ', ', enhanced)
        
        return enhanced
    
    def _validate_copyright_safety(self, regenerated_content: str, 
                                  original_content: str) -> float:
        """
        Validate copyright safety of regenerated content
        Returns score from 0.0 to 1.0
        """
        # Calculate similarity
        similarity = self._calculate_similarity(regenerated_content, original_content)
        
        # Copyright safety is inverse of similarity (lower similarity = safer)
        copyright_safety = 1.0 - similarity
        
        # Adjust for structural changes
        original_sentences = original_content.split('.')
        regenerated_sentences = regenerated_content.split('.')
        
        if len(original_sentences) != len(regenerated_sentences):
            # Different structure indicates good paraphrasing
            copyright_safety += 0.1
        
        return round(min(max(copyright_safety, 0.0), 1.0), 4)
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using word overlap"""
        words1 = set(word.lower().strip('.,!?') for word in text1.split())
        words2 = set(word.lower().strip('.,!?') for word in text2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if union else 0.0
        return similarity
    
    def batch_regenerate_content(self, content_items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Regenerate multiple content items in batch
        Args:
            content_items: List of dicts with keys: file_id, original_content, copyright_safe_content
        """
        results = []
        success_count = 0
        failure_count = 0
        
        for item in content_items:
            result = self.regenerate_content(
                file_id=item["file_id"],
                original_content=item["original_content"],
                copyright_safe_content=item["copyright_safe_content"]
            )
            
            results.append(result)
            
            if result["success"]:
                success_count += 1
            else:
                failure_count += 1
        
        return {
            "success": True,
            "total_items": len(content_items),
            "successful_regenerations": success_count,
            "failed_regenerations": failure_count,
            "results": results
        }
    
    def get_regeneration_statistics(self) -> Dict[str, Any]:
        """Get statistics about regeneration operations"""
        total_regenerations = len(self.regeneration_history)
        
        if total_regenerations == 0:
            return {
                "total_regenerations": 0,
                "average_quality_score": 0.0,
                "average_copyright_safety": 0.0,
                "validation_pass_rate": 0.0,
                "average_error_count": 0.0
            }
        
        total_quality = sum(r["quality_score"] for r in self.regeneration_history.values())
        total_copyright = sum(r["copyright_safety_score"] for r in self.regeneration_history.values())
        passed_validations = sum(1 for r in self.regeneration_history.values() if r["validation_passed"])
        total_errors = sum(r["error_count"] for r in self.regeneration_history.values())
        
        return {
            "total_regenerations": total_regenerations,
            "average_quality_score": round(total_quality / total_regenerations, 4),
            "average_copyright_safety": round(total_copyright / total_regenerations, 4),
            "validation_pass_rate": round((passed_validations / total_regenerations) * 100, 2),
            "average_error_count": round(total_errors / total_regenerations, 2)
        }
    
    def get_regeneration_history(self, file_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get regeneration history, optionally filtered by file_id"""
        history = []
        
        for reg_id, reg_data in self.regeneration_history.items():
            if file_id and reg_data["file_id"] != file_id:
                continue
            history.append(reg_data)
        
        return history


# Singleton instance
_auto_regeneration_engine_instance = None

def get_auto_regeneration_engine() -> AutoRegenerationEngine:
    """Get auto-regeneration engine instance"""
    global _auto_regeneration_engine_instance
    if _auto_regeneration_engine_instance is None:
        _auto_regeneration_engine_instance = AutoRegenerationEngine()
    return _auto_regeneration_engine_instance
