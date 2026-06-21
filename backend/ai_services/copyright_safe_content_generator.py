# -*- coding: utf-8 -*-
"""
🎯 COPYRIGHT-SAFE CONTENT GENERATOR
AI-powered content generation that avoids copyright infringement
Uses paraphrasing, synthesis, and original content creation
"""
import random
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import hashlib


class CopyrightSafeGenerator:
    """
    Generate copyright-safe educational content
    Uses AI paraphrasing and synthesis techniques
    """
    
    def __init__(self):
        self.content_templates = self._load_templates()
        self.paraphrase_patterns = self._load_paraphrase_patterns()
        self.synthesis_rules = self._load_synthesis_rules()
    
    def _load_templates(self) -> Dict[str, List]:
        """Load content templates for different subjects"""
        return {
            "ielts_listening": [
                {
                    "type": "conversation",
                    "template": "Conversation between {person1} and {person2} about {topic}",
                    "topics": ["university life", "accommodation", "course selection", "library services"]
                },
                {
                    "type": "lecture",
                    "template": "Academic lecture on {topic} by {professor}",
                    "topics": ["climate change", "artificial intelligence", "history of mathematics", "economic theories"]
                }
            ],
            "ielts_reading": [
                {
                    "type": "academic_passage",
                    "template": "Academic passage about {topic} with {structure}",
                    "topics": ["technology", "environment", "health", "education", "business"],
                    "structures": ["cause-effect", "problem-solution", "comparison-contrast"]
                }
            ],
            "sat_reading": [
                {
                    "type": "literature",
                    "template": "Literary passage about {theme} in {era}",
                    "themes": ["identity", "conflict", "growth", "society"],
                    "eras": ["modern", "contemporary", "historical"]
                },
                {
                    "type": "science",
                    "template": "Scientific article on {topic} with {method}",
                    "topics": ["biology", "physics", "chemistry", "earth science"],
                    "methods": ["experimental", "observational", "theoretical"]
                }
            ]
        }
    
    def _load_paraphrase_patterns(self) -> List[Dict]:
        """Load paraphrasing patterns for copyright safety"""
        return [
            {
                "pattern": "synonym_replacement",
                "examples": [
                    {"original": "important", "paraphrases": ["crucial", "significant", "vital", "essential"]},
                    {"original": "show", "paraphrases": ["demonstrate", "illustrate", "reveal", "indicate"]},
                    {"original": "use", "paraphrases": ["utilize", "employ", "apply", "implement"]}
                ]
            },
            {
                "pattern": "structure_change",
                "examples": [
                    {"type": "active_to_passive", "template": "{subject} {verb} {object} -> {object} was {verb}ed by {subject}"},
                    {"type": "sentence_combination", "template": "Combine two related sentences"}
                ]
            },
            {
                "pattern": "synthesis",
                "examples": [
                    {"type": "multi_source", "description": "Combine information from multiple sources"},
                    {"type": "concept_merging", "description": "Merge related concepts"}
                ]
            }
        ]
    
    def _load_synthesis_rules(self) -> Dict[str, Any]:
        """Load content synthesis rules"""
        return {
            "ielts_listening": {
                "min_words": 150,
                "max_words": 300,
                "complexity": "B1-B2",
                "vocabulary": "academic"
            },
            "ielts_reading": {
                "min_words": 800,
                "max_words": 1000,
                "complexity": "B2-C1",
                "vocabulary": "academic"
            },
            "sat_reading": {
                "min_words": 500,
                "max_words": 800,
                "complexity": "C1-C2",
                "vocabulary": "sophisticated"
            }
        }
    
    def generate_copyright_safe_content(self, content_type: str, topic: str, 
                                       source_material: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate copyright-safe content based on type and topic
        If source_material provided, paraphrase it safely
        """
        content_id = self._generate_content_id(content_type, topic)
        
        if source_material:
            # Paraphrase existing content
            generated_content = self._paraphrase_content(source_material, content_type)
        else:
            # Generate original content
            generated_content = self._generate_original_content(content_type, topic)
        
        # Validate copyright safety
        safety_score = self._calculate_copyright_safety(generated_content, source_material)
        
        return {
            "content_id": content_id,
            "content_type": content_type,
            "topic": topic,
            "generated_content": generated_content,
            "copyright_safety_score": safety_score,
            "is_safe": safety_score >= 0.85,
            "generated_at": datetime.now().isoformat(),
            "word_count": len(generated_content.split())
        }
    
    def _generate_content_id(self, content_type: str, topic: str) -> str:
        """Generate unique content ID"""
        unique_string = f"{content_type}_{topic}_{datetime.now().isoformat()}"
        return hashlib.sha256(unique_string.encode()).hexdigest()[:16]
    
    def _paraphrase_content(self, source_text: str, content_type: str) -> str:
        """
        Paraphrase content to avoid copyright infringement
        Uses multiple paraphrasing techniques
        """
        sentences = source_text.split('.')
        paraphrased_sentences = []
        
        for sentence in sentences:
            if len(sentence.strip()) > 10:
                # Apply paraphrasing patterns
                paraphrased = self._apply_paraphrase_patterns(sentence.strip())
                paraphrased_sentences.append(paraphrased)
        
        return '. '.join(paraphrased_sentences)
    
    def _apply_paraphrase_patterns(self, sentence: str) -> str:
        """Apply paraphrasing patterns to sentence"""
        # Synonym replacement
        words = sentence.split()
        paraphrased_words = []
        
        for word in words:
            lower_word = word.lower()
            # Simple synonym replacement (in production, use AI/ML)
            synonyms = self._get_synonyms(lower_word)
            if synonyms and random.random() > 0.7:  # 30% chance to replace
                paraphrased_words.append(random.choice(synonyms))
            else:
                paraphrased_words.append(word)
        
        return ' '.join(paraphrased_words)
    
    def _get_synonyms(self, word: str) -> Optional[List[str]]:
        """Get synonyms for word (simplified version)"""
        synonym_dict = {
            "important": ["crucial", "significant", "vital", "essential"],
            "show": ["demonstrate", "illustrate", "reveal", "indicate"],
            "use": ["utilize", "employ", "apply", "implement"],
            "help": ["assist", "aid", "support", "facilitate"],
            "make": ["create", "produce", "generate", "construct"],
            "get": ["obtain", "acquire", "receive", "gain"],
            "good": ["excellent", "superior", "beneficial", "advantageous"],
            "bad": ["detrimental", "harmful", "adverse", "negative"],
            "big": ["substantial", "significant", "considerable", "extensive"],
            "small": ["minimal", "minor", "limited", "modest"]
        }
        return synonym_dict.get(word)
    
    def _generate_original_content(self, content_type: str, topic: str) -> str:
        """Generate original content based on templates"""
        templates = self.content_templates.get(content_type, [])
        
        if not templates:
            return self._generate_generic_content(content_type, topic)
        
        template = random.choice(templates)
        template_str = template["template"]
        
        # Fill template with topic-specific content
        if content_type == "ielts_listening":
            return self._generate_listening_content(template, topic)
        elif content_type == "ielts_reading":
            return self._generate_reading_content(template, topic)
        elif content_type == "sat_reading":
            return self._generate_sat_reading_content(template, topic)
        else:
            return self._generate_generic_content(content_type, topic)
    
    def _generate_listening_content(self, template: Dict, topic: str) -> str:
        """Generate IELTS listening content"""
        if template["type"] == "conversation":
            person1 = "Sarah"
            person2 = "Mike"
            return f"""
            Conversation between {person1} and {person2} about {topic}
            
            {person1}: Hi {person2}, I wanted to talk to you about {topic}.
            {person2}: Sure, what specifically would you like to know?
            {person1}: Well, I'm trying to understand the main aspects of {topic}.
            {person2}: Let me explain. {topic} involves several key factors that we should consider.
            {person1}: That's interesting. Can you give me more details?
            {person2}: Of course. First, we need to consider the practical applications. 
            Second, we should look at the theoretical framework. Finally, we must examine the implications.
            {person1}: That makes sense. What do you think is the most important aspect?
            {person2}: In my opinion, the practical applications are crucial because they directly affect our daily lives.
            {person1}: I see. Thank you for explaining this to me.
            {person2}: You're welcome. Let me know if you have any other questions about {topic}.
            """
        else:
            professor = "Dr. Smith"
            return f"""
            Academic lecture on {topic} by {professor}
            
            {professor}: Good morning everyone. Today we're going to discuss {topic}.
            This is a fascinating subject that has significant implications for our understanding of the field.
            
            Let's begin by examining the historical context of {topic}.
            The development of {topic} can be traced back to several key discoveries in the 20th century.
            These discoveries laid the foundation for modern approaches to {topic}.
            
            Now, let's consider the current state of research in this area.
            Recent studies have shown that {topic} is more complex than previously thought.
            Researchers have identified several new patterns and relationships that challenge our existing understanding.
            
            Looking to the future, {topic} presents both opportunities and challenges.
            On one hand, advances in technology may enable us to explore {topic} in new ways.
            On the other hand, we must be careful about the ethical implications of our research.
            
            In conclusion, {topic} remains a vital area of study with much still to be discovered.
            Thank you for your attention.
            """
    
    def _generate_reading_content(self, template: Dict, topic: str) -> str:
        """Generate IELTS reading passage"""
        structure = template.get("structures", ["cause-effect"])[0]
        
        if structure == "cause-effect":
            return f"""
            The Impact of {topic} on Modern Society
            
            {topic} has emerged as a significant factor influencing various aspects of contemporary life.
            This phenomenon can be observed across multiple domains, from economic systems to social interactions.
            Understanding the causes and effects of {topic} is essential for developing effective responses.
            
            The primary causes of {topic} can be attributed to several interconnected factors.
            First, technological advancements have created new possibilities that were previously unimaginable.
            Second, changing social norms have altered how people approach related issues.
            Third, economic pressures have forced organizations and individuals to adapt their strategies.
            
            The effects of {topic} are equally multifaceted. On a positive note, {topic} has led to increased efficiency
            and innovation in many sectors. However, it has also created challenges that require careful consideration.
            For instance, the rapid pace of change associated with {topic} can be overwhelming for some individuals and communities.
            
            Looking ahead, the trajectory of {topic} suggests that its influence will continue to grow.
            Policymakers, businesses, and individuals must work together to harness the benefits while mitigating the risks.
            Only through collaborative effort can we ensure that {topic} serves the broader interests of society.
            
            In conclusion, {topic} represents both an opportunity and a challenge for modern society.
            By understanding its causes and effects, we can make informed decisions about how to respond to this phenomenon.
            """
        else:
            return f"""
            Understanding {topic}: A Comprehensive Analysis
            
            {topic} has become increasingly important in recent years, attracting attention from researchers,
            practitioners, and policymakers alike. This growing interest reflects the recognition that {topic}
            plays a crucial role in shaping outcomes in various contexts.
            
            One key aspect of {topic} is its complexity. Unlike simpler phenomena that can be easily categorized,
            {topic} involves multiple dimensions that interact in dynamic ways. This complexity makes it both
            fascinating to study and challenging to address in practice.
            
            Research on {topic} has revealed several important patterns. First, there is considerable variation
            in how {topic} manifests across different settings. Second, contextual factors significantly influence
            the impact of {topic}. Third, individual differences play a role in how people respond to {topic}.
            
            Practical applications of research on {topic} are numerous. In education, understanding {topic}
            can inform teaching strategies and curriculum design. In business, insights about {topic} can guide
            decision-making and organizational development. In policy, evidence about {topic} can support
            the development of effective interventions.
            
            Despite progress in understanding {topic}, many questions remain. Future research should focus on
            identifying the mechanisms underlying {topic}, exploring its long-term effects, and developing
            evidence-based approaches to addressing related challenges.
            
            In summary, {topic} represents a rich area of inquiry with significant practical implications.
            Continued research and thoughtful application of findings will be essential for maximizing its benefits
            while minimizing potential drawbacks.
            """
    
    def _generate_sat_reading_content(self, template: Dict, topic: str) -> str:
        """Generate SAT reading passage"""
        if template["type"] == "literature":
            theme = template.get("themes", ["identity"])[0]
            era = template.get("eras", ["modern"])[0]
            return f"""
            The {theme} in {era} Literature
            
            The exploration of {theme} has long been a central concern in {era} literature.
            Writers of this period approached {theme} with varying perspectives, reflecting the diverse
            experiences and philosophies of their time.
            
            One notable author who addressed {theme} was particularly interested in how individuals
            navigate the complexities of {theme} in a rapidly changing world. Through vivid characters
            and intricate plots, this author demonstrated the profound impact that {theme} can have on
            human experience.
            
            The literary techniques employed to explore {theme} were equally significant. Symbolism,
            metaphor, and irony were used to convey the nuanced aspects of {theme} that direct description
            might miss. These techniques allowed readers to engage with {theme} on multiple levels,
            from the literal to the allegorical.
            
            Critical responses to these literary treatments of {theme} have varied over time. Early critics
            often focused on the moral implications of how {theme} was portrayed, while later scholars have
            emphasized the aesthetic and psychological dimensions. This evolution in critical approach
            reflects changing attitudes toward both literature and the concept of {theme} itself.
            
            Today, the exploration of {theme} in {era} literature continues to resonate with readers.
            The questions raised by these works about human nature, society, and the search for meaning
            remain relevant, demonstrating the enduring power of literature to illuminate fundamental aspects
            of the human condition.
            """
        else:
            method = template.get("methods", ["experimental"])[0]
            return f"""
            Recent Advances in {topic}: A {method} Perspective
            
            The field of {topic} has undergone significant transformation in recent years, driven by
            advances in {method} approaches. This progress has opened new avenues for understanding
            complex phenomena and developing innovative solutions to longstanding problems.
            
            {method} research on {topic} has revealed several important findings. First, researchers have
            identified previously unknown relationships between key variables. Second, new measurement
            techniques have allowed for more precise quantification of critical parameters. Third,
            innovative analytical methods have enabled researchers to detect subtle patterns that were
            previously obscured.
            
            These findings have important implications for both theory and practice. From a theoretical
            standpoint, they challenge existing models and suggest the need for revised frameworks.
            From a practical perspective, they offer new possibilities for intervention and application
            in real-world settings.
            
            However, challenges remain. The complexity of {topic} means that {method} approaches, while
            powerful, have limitations. Researchers must be careful about overgeneralizing from specific
            findings and must consider the broader context in which {topic} operates.
            
            Future directions for research on {topic} include integrating {method} methods with
            complementary approaches, expanding the scope of inquiry to include diverse populations and
            settings, and developing more sophisticated theoretical models that can account for the
            full complexity of the phenomenon.
            
            In conclusion, {method} research has significantly advanced our understanding of {topic},
            but much work remains to be done. Continued innovation in methods and theory will be essential
            for further progress in this important area.
            """
    
    def _generate_generic_content(self, content_type: str, topic: str) -> str:
        """Generate generic content when specific template not available"""
        return f"""
        Educational Content about {topic}
        
        This content focuses on {topic}, which is an important subject in the field of {content_type}.
        The material presented here is designed to help learners understand key concepts and develop
        essential skills related to {topic}.
        
        Key aspects of {topic} include:
        1. Fundamental principles and theories
        2. Practical applications and examples
        3. Critical analysis and evaluation
        4. Integration with related topics
        
        By studying {topic}, learners will gain valuable knowledge that can be applied in various contexts.
        The content is structured to support progressive learning, with concepts building upon each other
        to create a comprehensive understanding of the subject matter.
        """
    
    def _calculate_copyright_safety(self, generated_content: str, 
                                   original_content: Optional[str] = None) -> float:
        """
        Calculate copyright safety score (0.0 to 1.0)
        Higher score means safer from copyright infringement
        """
        if not original_content:
            # Original content gets high safety score
            return 0.95
        
        # Calculate similarity (simplified version)
        similarity = self._calculate_similarity(generated_content, original_content)
        safety_score = 1.0 - similarity
        
        # Adjust based on paraphrasing quality
        paraphrasing_quality = self._assess_paraphrasing_quality(generated_content, original_content)
        safety_score = (safety_score + paraphrasing_quality) / 2
        
        return min(max(safety_score, 0.0), 1.0)
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity (simplified version)"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if union else 0.0
        return similarity
    
    def _assess_paraphrasing_quality(self, generated: str, original: str) -> float:
        """Assess quality of paraphrasing (simplified version)"""
        # Check for structural changes
        original_sentences = original.split('.')
        generated_sentences = generated.split('.')
        
        if len(original_sentences) != len(generated_sentences):
            # Different sentence count suggests good paraphrasing
            return 0.8
        
        # Check for vocabulary diversity
        original_words = set(original.lower().split())
        generated_words = set(generated.lower().split())
        
        shared_words = original_words.intersection(generated_words)
        diversity_score = 1.0 - (len(shared_words) / len(original_words) if original_words else 0)
        
        return diversity_score
    
    def batch_generate_content(self, content_requests: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Generate multiple content items in batch
        """
        results = []
        for request in content_requests:
            content_type = request.get("content_type")
            topic = request.get("topic")
            source_material = request.get("source_material")
            
            result = self.generate_copyright_safe_content(content_type, topic, source_material)
            results.append(result)
        
        return results


# Singleton instance
_copyright_safe_generator_instance = None

def get_copyright_safe_generator() -> CopyrightSafeGenerator:
    """Get copyright-safe generator instance"""
    global _copyright_safe_generator_instance
    if _copyright_safe_generator_instance is None:
        _copyright_safe_generator_instance = CopyrightSafeGenerator()
    return _copyright_safe_generator_instance
