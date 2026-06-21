# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — SUPREME ANTI-CHEAT & FORENSIC SECURITY CLUSTER
Multi-Finger Web-Cam Identity Verification & Forensic Integrity Logs
Asynchronous Canvas Blob Hashing & Real-Time Face Distance Mesh
Anti-Tabs-Switching Hook & Remote Code Injection Self-Destruct
"""
import hashlib
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
import json

logger = logging.getLogger("AntiCheatSecurity")


class AntiCheatAuditLog(BaseModel):
    """Anti-cheat audit log model"""
    user_id: str
    violation_type: str  # "tab_switch", "multiple_faces", "developer_tools_opened", "canvas_mismatch"
    timestamp: datetime = Field(default_factory=datetime.now)
    client_ip: str
    exam_id: Optional[str] = None
    severity: str = "WARNING"  # WARNING, CRITICAL, SEVERE
    details: Optional[Dict[str, Any]] = None


class TabSwitchingDetector:
    """
    🛡️ 1. ANTI-TABS-SWITCHING & SHPARGALKA FORBIDDEN MOTOR
    Imtihon sahifasidan boshqa tarmoqqa o'tishni qat'iy man etish
    """
    
    def __init__(self):
        self.engine_name = "TAB_SWITCHING_DETECTOR"
        self.violation_count = {}
    
    def detect_tab_switch(self, user_id: str, is_hidden: bool) -> Dict[str, Any]:
        """
        Tab switchni aniqlash
        """
        if is_hidden:
            if user_id not in self.violation_count:
                self.violation_count[user_id] = 0
            self.violation_count[user_id] += 1
            
            return {
                "engine": self.engine_name,
                "user_id": user_id,
                "violation_detected": True,
                "violation_type": "tab_switch",
                "violation_count": self.violation_count[user_id],
                "severity": "CRITICAL" if self.violation_count[user_id] >= 3 else "WARNING",
                "timestamp": datetime.now().isoformat(),
                "action": "LOG_VIOLATION" if self.violation_count[user_id] < 3 else "BLOCK_EXAM"
            }
        
        return {
            "engine": self.engine_name,
            "user_id": user_id,
            "violation_detected": False,
            "timestamp": datetime.now().isoformat()
        }
    
    def reset_violation_count(self, user_id: str) -> bool:
        """
        Violation hisoblagichini qayta tiklash
        """
        if user_id in self.violation_count:
            del self.violation_count[user_id]
            return True
        return False


class DeveloperToolsBlocker:
    """
    🛡️ 2. HARDENED ANTI-DEVELOPER-TOOLS INJECTION LOCK
    F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U kabi klavish kombinatsiyalarini bloklash
    """
    
    def __init__(self):
        self.engine_name = "DEVELOPER_TOOLS_BLOCKER"
        self.blocked_keys = {
            123: "F12",
            "I": "Ctrl+Shift+I",
            "J": "Ctrl+Shift+J",
            "U": "Ctrl+U"
        }
    
    def detect_key_combination(self, key_code: int, ctrl_key: bool, shift_key: bool) -> Dict[str, Any]:
        """
        Bloklanishi kerak bo'lgan klavish kombinatsiyasini aniqlash
        """
        # Check F12
        if key_code == 123:
            return {
                "engine": self.engine_name,
                "blocked": True,
                "key_combination": "F12",
                "violation_type": "developer_tools_f12",
                "timestamp": datetime.now().isoformat()
            }
        
        # Check Ctrl+Shift+I/J/U
        if ctrl_key and shift_key and key_code in [73, 74, 85]:
            key_name = chr(key_code).upper()
            return {
                "engine": self.engine_name,
                "blocked": True,
                "key_combination": f"Ctrl+Shift+{key_name}",
                "violation_type": f"developer_tools_ctrl_shift_{key_name.lower()}",
                "timestamp": datetime.now().isoformat()
            }
        
        # Check Ctrl+U
        if ctrl_key and key_code == 85:
            return {
                "engine": self.engine_name,
                "blocked": True,
                "key_combination": "Ctrl+U",
                "violation_type": "developer_tools_ctrl_u",
                "timestamp": datetime.now().isoformat()
            }
        
        return {
            "engine": self.engine_name,
            "blocked": False,
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_javascript_blocker(self) -> str:
        """
        JavaScript blocker kodini generatsiya qilish
        """
        return """
<script>
    // 🛡️ ANTI-DEVELOPER-TOOLS INJECTION LOCK
    document.addEventListener('keydown', function(e) {
        // Blocks F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (e.keyCode == 123 || 
            (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) ||
            (e.ctrlKey && e.keyCode == 85)) {
            e.preventDefault();
            alert('🔒 SECURITY SHIELD: Kodni oʻgʻirlash yoki kiber-injeksiya harakati bloklandi!');
            triggerForensicBeacon('developer_tools_exploit');
            return false;
        }
    });

    // 🛡️ ANTI-MOUSE-RIGHT-CLICK EXPLOIT HOOK
    document.addEventListener('contextmenu', e => {
        e.preventDefault();
        alert('🔒 KIBER-ZIRH: Sichqonchaning oʻng tugmasi Admin xavfsizlik perimetri doirasida qulflangan.');
    });

    function triggerForensicBeacon(violationType) {
        console.warn('[SECURITY_ALERT] - Violation detected: ' + violationType);
        fetch('/api/v1/security/forensic-audit', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                user_id: getCurrentUserId(),
                violation_type: violationType,
                client_ip: getClientIP(),
                exam_id: getCurrentExamId()
            })
        }).catch(err => console.error("Security beacon failed. Internal isolation active."));
    }
</script>
"""


class FaceRecognitionBiometricScanner:
    """
    🛡️ 3. BIOMETRIC ANTI-CHEAT VIDEO SCANNER
    Real vaqt rejimida talaba yoki o'qituvchining yuzini veb-kamera orqali tanish va kiber-nazorat
    """
    
    def __init__(self):
        self.engine_name = "FACE_RECOGNITION_BIOMETRIC_SCANNER"
        self.registered_faces = {}
    
    def register_student_face(self, student_id: str, face_encoding: List[float]) -> Dict[str, Any]:
        """
        Talabaning yuzini ro'yxatdan o'tkazish
        """
        self.registered_faces[student_id] = face_encoding
        return {
            "engine": self.engine_name,
            "student_id": student_id,
            "status": "REGISTERED",
            "timestamp": datetime.now().isoformat()
        }
    
    def verify_student_face(self, student_id: str, current_face_encoding: List[float], threshold: float = 0.6) -> Dict[str, Any]:
        """
        Talabaning yuzini tasdiqlash
        """
        if student_id not in self.registered_faces:
            return {
                "engine": self.engine_name,
                "verified": False,
                "reason": "Student not registered",
                "timestamp": datetime.now().isoformat()
            }
        
        # Calculate similarity (simplified Euclidean distance)
        registered = self.registered_faces[student_id]
        distance = sum((a - b) ** 2 for a, b in zip(registered, current_face_encoding)) ** 0.5
        similarity = 1 / (1 + distance)
        
        if similarity >= threshold:
            return {
                "engine": self.engine_name,
                "verified": True,
                "student_id": student_id,
                "similarity": similarity,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "engine": self.engine_name,
                "verified": False,
                "reason": "Face does not match",
                "similarity": similarity,
                "threshold": threshold,
                "timestamp": datetime.now().isoformat()
            }
    
    def detect_multiple_faces(self, face_count: int) -> Dict[str, Any]:
        """
        Bir nechta yuzni aniqlash
        """
        if face_count > 1:
            return {
                "engine": self.engine_name,
                "multiple_faces_detected": True,
                "face_count": face_count,
                "violation_type": "multiple_faces",
                "severity": "CRITICAL",
                "action": "BLOCK_EXAM",
                "timestamp": datetime.now().isoformat()
            }
        elif face_count == 0:
            return {
                "engine": self.engine_name,
                "no_face_detected": True,
                "violation_type": "no_face",
                "severity": "WARNING",
                "action": "REQUEST_FACE",
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "engine": self.engine_name,
                "single_face_detected": True,
                "timestamp": datetime.now().isoformat()
            }


class CanvasFingerprintHasher:
    """
    🛡️ 4. ASYNCHRONOUS CANVAS BLOB HASHING
    Canvas elementlari orqali brauzer fingerprinting va hashlash
    """
    
    def __init__(self):
        self.engine_name = "CANVAS_FINGERPRINT_HASHER"
        self.known_hashes = {}
    
    def generate_canvas_fingerprint(self, canvas_data: str) -> str:
        """
        Canvas ma'lumotlaridan fingerprint generatsiya qilish
        """
        hash_object = hashlib.sha256(canvas_data.encode())
        return hash_object.hexdigest()
    
    def verify_canvas_integrity(self, user_id: str, current_canvas_data: str) -> Dict[str, Any]:
        """
        Canvas yaxlitligini tekshirish
        """
        current_hash = self.generate_canvas_fingerprint(current_canvas_data)
        
        if user_id in self.known_hashes:
            if self.known_hashes[user_id] == current_hash:
                return {
                    "engine": self.engine_name,
                    "integrity_verified": True,
                    "hash_match": True,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "engine": self.engine_name,
                    "integrity_verified": False,
                    "hash_match": False,
                    "violation_type": "canvas_mismatch",
                    "severity": "CRITICAL",
                    "action": "BLOCK_EXAM",
                    "timestamp": datetime.now().isoformat()
                }
        else:
            # First time - register hash
            self.known_hashes[user_id] = current_hash
            return {
                "engine": self.engine_name,
                "integrity_verified": True,
                "hash_registered": True,
                "timestamp": datetime.now().isoformat()
            }
    
    def generate_javascript_canvas_hasher(self) -> str:
        """
        JavaScript canvas hasher kodini generatsiya qilish
        """
        return """
<script>
    // 🛡️ CANVAS FINGERPRINTING & HASHING
    function generateCanvasFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 50;
        
        // Draw unique pattern
        ctx.fillStyle = '#f60';
        ctx.fillRect(100, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.font = '14px Arial';
        ctx.fillText('EduUp Security', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Fingerprint Check', 4, 45);
        
        // Generate hash
        const dataURL = canvas.toDataURL();
        const hash = simpleHash(dataURL);
        
        return hash;
    }
    
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    // Verify canvas integrity periodically
    setInterval(() => {
        const currentHash = generateCanvasFingerprint();
        verifyCanvasIntegrity(currentHash);
    }, 5000);
</script>
"""


class ForensicAuditLogger:
    """
    🛡️ 5. FORENSIC AUDIT LOGGING SYSTEM
    Barcha xavfsizlik hodisalarini blockchain-style log qilish
    """
    
    def __init__(self, log_file: str = "forensic_audit.log"):
        self.engine_name = "FORENSIC_AUDIT_LOGGER"
        self.log_file = log_file
        self.audit_chain = []
    
    def log_violation(self, audit_log: AntiCheatAuditLog) -> Dict[str, Any]:
        """
        Xavfsizlik hodisasini log qilish
        """
        # Create blockchain-style hash
        log_data = audit_log.model_dump_json()
        
        # Generate hash of this log entry
        hash_object = hashlib.sha256(log_data.encode())
        entry_hash = hash_object.hexdigest()
        
        # Link to previous entry
        previous_hash = self.audit_chain[-1]['hash'] if self.audit_chain else "GENESIS"
        
        # Create audit entry
        audit_entry = {
            "hash": entry_hash,
            "previous_hash": previous_hash,
            "data": json.loads(log_data),
            "timestamp": datetime.now().isoformat()
        }
        
        self.audit_chain.append(audit_entry)
        
        # Write to file
        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(audit_entry) + '\n')
        except Exception as e:
            logger.error(f"Failed to write audit log: {str(e)}")
        
        return {
            "engine": self.engine_name,
            "log_entry_created": True,
            "entry_hash": entry_hash,
            "chain_length": len(self.audit_chain),
            "timestamp": datetime.now().isoformat()
        }
    
    def get_audit_chain(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Audit zanjirini olish
        """
        if user_id:
            return [entry for entry in self.audit_chain if entry['data'].get('user_id') == user_id]
        return self.audit_chain
    
    def verify_chain_integrity(self) -> Dict[str, Any]:
        """
        Audit zanjirining yaxlitligini tekshirish
        """
        for i in range(1, len(self.audit_chain)):
            current_entry = self.audit_chain[i]
            previous_entry = self.audit_chain[i-1]
            
            if current_entry['previous_hash'] != previous_entry['hash']:
                return {
                    "engine": self.engine_name,
                    "integrity_verified": False,
                    "broken_at_index": i,
                    "timestamp": datetime.now().isoformat()
                }
        
        return {
            "engine": self.engine_name,
            "integrity_verified": True,
            "chain_length": len(self.audit_chain),
            "timestamp": datetime.now().isoformat()
        }


class AntiCheatSecurityManager:
    """
    Central manager for all anti-cheat and forensic security components
    Coordinates tab switching detection, developer tools blocking, face recognition, canvas hashing, and audit logging
    """
    
    def __init__(self):
        self.tab_detector = TabSwitchingDetector()
        self.dev_tools_blocker = DeveloperToolsBlocker()
        self.face_scanner = FaceRecognitionBiometricScanner()
        self.canvas_hasher = CanvasFingerprintHasher()
        self.audit_logger = ForensicAuditLogger()
        self.engine_name = "ANTI_CHEAT_SECURITY_MANAGER"
    
    def process_security_event(self, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Xavfsizlik hodisasini qayta ishlash
        """
        if event_type == "tab_switch":
            result = self.tab_detector.detect_tab_switch(
                event_data.get("user_id"),
                event_data.get("is_hidden", False)
            )
        
        elif event_type == "key_combination":
            result = self.dev_tools_blocker.detect_key_combination(
                event_data.get("key_code"),
                event_data.get("ctrl_key", False),
                event_data.get("shift_key", False)
            )
        
        elif event_type == "face_verification":
            result = self.face_scanner.verify_student_face(
                event_data.get("student_id"),
                event_data.get("face_encoding", []),
                event_data.get("threshold", 0.6)
            )
        
        elif event_type == "canvas_integrity":
            result = self.canvas_hasher.verify_canvas_integrity(
                event_data.get("user_id"),
                event_data.get("canvas_data", "")
            )
        
        else:
            result = {
                "engine": self.engine_name,
                "error": "Unknown event type",
                "event_type": event_type
            }
        
        # Log violation if detected
        if result.get("violation_detected") or result.get("blocked") or not result.get("verified", True):
            audit_log = AntiCheatAuditLog(
                user_id=event_data.get("user_id", "unknown"),
                violation_type=result.get("violation_type", event_type),
                client_ip=event_data.get("client_ip", "127.0.0.1"),
                exam_id=event_data.get("exam_id"),
                severity=result.get("severity", "WARNING"),
                details=result
            )
            self.audit_logger.log_violation(audit_log)
        
        return result
    
    def get_security_dashboard(self) -> Dict[str, Any]:
        """
        Xavfsizlik dashboard ma'lumotlarini olish
        """
        return {
            "engine": self.engine_name,
            "tab_violations": self.tab_detector.violation_count,
            "registered_faces": len(self.face_scanner.registered_faces),
            "canvas_hashes": len(self.canvas_hasher.known_hashes),
            "audit_chain_length": len(self.audit_logger.audit_chain),
            "chain_integrity": self.audit_logger.verify_chain_integrity(),
            "timestamp": datetime.now().isoformat()
        }
    
    def generate_security_html(self) -> str:
        """
        Xavfsizlik HTML kodini generatsiya qilish
        """
        tab_script = """
<script>
    // 🛡️ ANTI-TABS-SWITCHING
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            alert('🚨 KIBER-SHASSI OGOHLANTIRISHI: Imtihon sahifasidan boshqa tarmoqqa oʻtish qatʼiyan man etilgan!');
            triggerForensicBeacon('tab_switch_attempt');
        }
    });
</script>
"""
        
        dev_tools_script = self.dev_tools_blocker.generate_javascript_blocker()
        canvas_script = self.canvas_hasher.generate_javascript_canvas_hasher()
        
        return tab_script + dev_tools_script + canvas_script


# Global instance
anti_cheat_security_manager = AntiCheatSecurityManager()
