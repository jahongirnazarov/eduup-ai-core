"""
Zero-Cost Security Implementation
Uses built-in Python libraries and simple techniques
No expensive security services or external dependencies
"""

import re
import html
import json
import secrets
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import hashlib

class ZeroCostSecurity:
    """
    Zero-cost security using built-in Python features
    - Input validation
    - XSS prevention
    - SQL injection prevention (parameterized queries)
    - Rate limiting (already in auth_zero_cost.py)
    """
    
    # Common attack patterns
    SQL_INJECTION_PATTERNS = [
        r"(\bOR\b|\bAND\b).*=.*=.*",
        r"(\bOR\b|\bAND\b).*\d.*=.*\d",
        r"'.*'.*'.*'",
        r";\s*(DROP|DELETE|INSERT|UPDATE|ALTER)",
        r"--",
        r"/\*.*\*/",
        r"xp_cmdshell",
        r"sp_executesql"
    ]
    
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"on\w+\s*=",
        r"<iframe",
        r"<object",
        r"<embed",
        r"eval\s*\(",
        r"document\.",
        r"window\.",
        r"alert\s*\("
    ]
    
    def __init__(self):
        self.blocked_ips = {}  # {ip: blocked_until}
        self.suspicious_activities = {}  # {ip: activity_count}
    
    def validate_input(self, input_data: str, max_length: int = 1000) -> tuple:
        """
        Validate input data
        Returns: (is_valid, error_message)
        """
        if not input_data:
            return True, None
        
        # Check length
        if len(input_data) > max_length:
            return False, f"Input too long (max {max_length} characters)"
        
        # Check for SQL injection
        for pattern in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                return False, "Potential SQL injection detected"
        
        # Check for XSS
        for pattern in self.XSS_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                return False, "Potential XSS attack detected"
        
        # Check for null bytes
        if "\x00" in input_data:
            return False, "Null bytes not allowed"
        
        return True, None
    
    def sanitize_output(self, output_data: str) -> str:
        """
        Sanitize output to prevent XSS
        """
        if not output_data:
            return output_data
        
        # HTML escape
        sanitized = html.escape(output_data)
        
        return sanitized
    
    def sanitize_json_output(self, data: Dict) -> Dict:
        """
        Sanitize JSON output
        """
        if isinstance(data, dict):
            return {k: self.sanitize_json_output(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [self.sanitize_json_output(item) for item in data]
        elif isinstance(data, str):
            return self.sanitize_output(data)
        else:
            return data
    
    def validate_email(self, email: str) -> bool:
        """
        Validate email format
        """
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def validate_username(self, username: str) -> bool:
        """
        Validate username format
        """
        # Alphanumeric, underscore, hyphen, 3-30 characters
        pattern = r'^[a-zA-Z0-9_-]{3,30}$'
        return re.match(pattern, username) is not None
    
    def validate_password_strength(self, password: str) -> tuple:
        """
        Validate password strength
        Returns: (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain digit"
        
        return True, None
    
    def block_ip(self, ip: str, duration_minutes: int = 60):
        """
        Block IP address for specified duration
        """
        blocked_until = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.blocked_ips[ip] = blocked_until
    
    def is_ip_blocked(self, ip: str) -> bool:
        """
        Check if IP is blocked
        """
        if ip not in self.blocked_ips:
            return False
        
        # Check if block expired
        if datetime.utcnow() > self.blocked_ips[ip]:
            del self.blocked_ips[ip]
            return False
        
        return True
    
    def report_suspicious_activity(self, ip: str):
        """
        Report suspicious activity from IP
        """
        if ip not in self.suspicious_activities:
            self.suspicious_activities[ip] = 0
        
        self.suspicious_activities[ip] += 1
        
        # Block if too many suspicious activities
        if self.suspicious_activities[ip] >= 10:
            self.block_ip(ip, duration_minutes=120)
    
    def get_security_headers(self) -> Dict[str, str]:
        """
        Get security headers for HTTP responses
        Zero-cost: standard headers, no external services
        """
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
    
    def generate_csrf_token(self, user_id: int) -> str:
        """
        Generate CSRF token
        Zero-cost: hash-based token
        """
        timestamp = datetime.utcnow().isoformat()
        data = f"{user_id}:{timestamp}"
        token = hashlib.sha256(data.encode()).hexdigest()
        return f"{token}:{timestamp}"
    
    def validate_csrf_token(self, token: str, user_id: int) -> bool:
        """
        Validate CSRF token
        """
        try:
            token_hash, timestamp = token.split(":")
            token_time = datetime.fromisoformat(timestamp)
            
            # Check if token is too old (1 hour)
            if datetime.utcnow() - token_time > timedelta(hours=1):
                return False
            
            # Regenerate and compare
            data = f"{user_id}:{timestamp}"
            expected_hash = hashlib.sha256(data.encode()).hexdigest()
            
            return secrets.compare_digest(token_hash, expected_hash)
            
        except Exception:
            return False


class InputValidator:
    """
    Input validation utilities
    Zero-cost: regex-based validation
    """
    
    @staticmethod
    def validate_lesson_id(lesson_id: str) -> bool:
        """Validate lesson ID format"""
        pattern = r'^[a-zA-Z0-9_-]{1,50}$'
        return re.match(pattern, lesson_id) is not None
    
    @staticmethod
    def validate_subject(subject: str) -> bool:
        """Validate subject"""
        valid_subjects = ['matematika', 'ingliz-tili', 'fizika', 'kimyo', 'biologiya']
        return subject.lower() in valid_subjects
    
    @staticmethod
    def validate_difficulty(difficulty: str) -> bool:
        """Validate difficulty level"""
        valid_difficulties = ['boshlangich', 'o-rtacha', 'yuqori', 'ekspert']
        return difficulty.lower() in valid_difficulties
    
    @staticmethod
    def validate_section_number(section: int) -> bool:
        """Validate section number"""
        return isinstance(section, int) and 0 <= section <= 1000
    
    @staticmethod
    def validate_score(score: Optional[float]) -> bool:
        """Validate score"""
        if score is None:
            return True
        return isinstance(score, (int, float)) and 0 <= score <= 100


class ContentFilter:
    """
    Content filtering for user-generated content
    Zero-cost: keyword-based filtering
    """
    
    # Blocked words (example - expand as needed)
    BLOCKED_WORDS = [
        # Profanity (censored for this example)
        # Add actual blocked words in production
    ]
    
    # Suspicious patterns
    SUSPICIOUS_PATTERNS = [
        r"password\s*[:=]",
        r"credit\s*card",
        r"ssn\s*[:=]",
        r"social\s*security",
        r"\d{3}-\d{2}-\d{4}",  # SSN pattern
        r"\d{16}",  # Credit card pattern
    ]
    
    def __init__(self):
        self.blocked_words_set = set(word.lower() for word in self.BLOCKED_WORDS)
    
    def filter_content(self, content: str) -> tuple:
        """
        Filter content for inappropriate material
        Returns: (is_clean, filtered_content, reason)
        """
        if not content:
            return True, content, None
        
        # Check for blocked words
        words = content.lower().split()
        for word in words:
            if word in self.blocked_words_set:
                return False, content, f"Blocked word detected: {word}"
        
        # Check for suspicious patterns
        for pattern in self.SUSPICIOUS_PATTERNS:
            if re.search(pattern, content, re.IGNORECASE):
                return False, content, f"Suspicious pattern detected"
        
        return True, content, None
    
    def sanitize_content(self, content: str) -> str:
        """
        Sanitize content by removing/replacing problematic parts
        """
        if not content:
            return content
        
        sanitized = content
        
        # Remove suspicious patterns
        for pattern in self.SUSPICIOUS_PATTERNS:
            sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)
        
        return sanitized


class AuditLogger:
    """
    Audit logging for security events
    Zero-cost: file-based logging
    """
    
    def __init__(self, log_file: str = "security_audit.log"):
        self.log_file = log_file
    
    def log_event(self, event_type: str, user_id: Optional[int], ip: str, details: Dict):
        """
        Log security event
        """
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "event_type": event_type,
            "user_id": user_id,
            "ip": ip,
            "details": details
        }
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Failed to write audit log: {e}")
    
    def log_login_attempt(self, user_id: Optional[int], ip: str, success: bool):
        """Log login attempt"""
        self.log_event(
            event_type="login_attempt",
            user_id=user_id,
            ip=ip,
            details={"success": success}
        )
    
    def log_security_violation(self, user_id: Optional[int], ip: str, violation_type: str):
        """Log security violation"""
        self.log_event(
            event_type="security_violation",
            user_id=user_id,
            ip=ip,
            details={"violation_type": violation_type}
        )
    
    def log_blocked_request(self, ip: str, reason: str):
        """Log blocked request"""
        self.log_event(
            event_type="blocked_request",
            user_id=None,
            ip=ip,
            details={"reason": reason}
        )


# Singleton instances
_security_instance = None
_input_validator = None
_content_filter = None
_audit_logger = None

def get_security() -> ZeroCostSecurity:
    """Get security instance (singleton)"""
    global _security_instance
    if _security_instance is None:
        _security_instance = ZeroCostSecurity()
    return _security_instance

def get_input_validator() -> InputValidator:
    """Get input validator instance (singleton)"""
    global _input_validator
    if _input_validator is None:
        _input_validator = InputValidator()
    return _input_validator

def get_content_filter() -> ContentFilter:
    """Get content filter instance (singleton)"""
    global _content_filter
    if _content_filter is None:
        _content_filter = ContentFilter()
    return _content_filter

def get_audit_logger() -> AuditLogger:
    """Get audit logger instance (singleton)"""
    global _audit_logger
    if _audit_logger is None:
        _audit_logger = AuditLogger()
    return _audit_logger
