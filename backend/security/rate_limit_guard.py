# -*- coding: utf-8 -*-
"""
🛡️ QUANTUM BLACKOUT RATE LIMIT GUARD
🌌 Module: Sovereign Stealth Security Core & Polysymmetric Firewall
🧮 Engine: Anti-Scraping Firewall with Automated Threshold Blocking
🔒 Protection: IP-based Rate Limiting with Database Persistence
========================================================================================================================
"""

import os
import re
import sys
import json
import zlib
import time
import sqlite3
import hashlib
import random
import asyncio
from typing import Dict, Any, List, Tuple, Optional


class QuantumBlackoutRateLimitGuard:
    """
    🔒 QUANTUM BLACKOUT RATE LIMIT GUARD:
    Anti-Scraping Firewall that intercepts and verifies client rate limits.
    Implements automated threshold blocking with database persistence.
    """
    
    def __init__(self, db_path: str = "data/imperial_vault.db"):
        """Initialize the rate limit guard with database connection"""
        self.db_path = db_path
        self.rate_limit_max_requests_per_minute = 60
        self.security_clearance_status = "MAXIMUM_CORE_OBFUSCATION_ACTIVE"
        
        # Compile 18 distinct regex filters for leak detection
        leak_patterns = [
            "kod", "source\\s*code", "sqlite", "zlib", "webgpu", "webgl",
            "harajat", "cost", "server", "hosting", "api\\s*key", "gemini",
            "ollama", "llm", "model", "baza", "database", "leak", "architecture"
        ]
        self.compiled_filters = [re.compile(pattern, re.IGNORECASE) for pattern in leak_patterns]
        
        # Initialize database
        self._initialize_database()
    
    def _initialize_database(self):
        """Create database and security_rate_limit_logs table if not exists"""
        # Ensure data directory exists
        os.makedirs(os.path.dirname(self.db_path) if os.path.dirname(self.db_path) else ".", exist_ok=True)
        
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        cursor = conn.cursor()
        
        # Create security_rate_limit_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS security_rate_limit_logs (
                node_ip_hash TEXT PRIMARY KEY,
                total_requests_count INTEGER NOT NULL,
                is_blocked_flag INTEGER NOT NULL,
                last_request_epoch REAL NOT NULL
            )
        """)
        
        conn.commit()
        conn.close()
    
    def intercept_and_verify_client_rate_limit(self, incoming_ip: str) -> Dict[str, Any]:
        """
        🔒 QUANTUM BLACKOUT ANTI-SCRAPING FIREWALL:
        Converts incoming network IPs into strict MD5 keys and enforces rate limiting.
        
        Args:
            incoming_ip: The client IP address to check and rate limit
            
        Returns:
            Dict with access_allowed boolean and status message
        """
        # Convert IP to MD5 hash key
        ip_hash_key = hashlib.md5(incoming_ip.encode('utf-8')).hexdigest().upper()
        current_time = time.time()
        
        # Establish database connection
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        cursor = conn.cursor()
        
        try:
            # Fetch existing request data history
            cursor.execute(
                "SELECT total_requests_count, is_blocked_flag, last_request_epoch FROM security_rate_limit_logs WHERE node_ip_hash = ?",
                (ip_hash_key,)
            )
            result = cursor.fetchone()
            
            if result:
                req_count, is_blocked_flag, last_epoch = result
                
                # Check 1: If already blocked, deny access immediately
                if is_blocked_flag == 1:
                    conn.close()
                    return {
                        "access_allowed": False,
                        "status": "🔒 SECURITY ALERT: Corporate theft violation detected. IP permanently blocked.",
                        "ip_hash": ip_hash_key
                    }
                
                # Check 2: Reset count if outside 60-second window
                if current_time - last_epoch > 60:
                    cursor.execute(
                        "UPDATE security_rate_limit_logs SET total_requests_count = 1, last_request_epoch = ? WHERE node_ip_hash = ?",
                        (current_time, ip_hash_key)
                    )
                    conn.commit()
                    conn.close()
                    return {
                        "access_allowed": True,
                        "status": "Request count reset (time window expired)",
                        "ip_hash": ip_hash_key
                    }
                
                # Check 3: Automated threshold block routine
                new_count = req_count + 1
                if new_count > self.rate_limit_max_requests_per_minute:
                    # Block the IP permanently
                    cursor.execute(
                        "UPDATE security_rate_limit_logs SET is_blocked_flag = 1, total_requests_count = ?, last_request_epoch = ? WHERE node_ip_hash = ?",
                        (new_count, current_time, ip_hash_key)
                    )
                    conn.commit()
                    conn.close()
                    
                    # Terminal output warning
                    print("🔒 [QUANTUM BLACKOUT ENGAGED]: Incinerated packets from malicious scraper node detected.")
                    
                    return {
                        "access_allowed": False,
                        "status": "🔒 QUANTUM BLACKOUT ENGAGED: Rate limit exceeded. IP permanently blocked.",
                        "ip_hash": ip_hash_key,
                        "request_count": new_count
                    }
                
                # Normal request - increment count
                cursor.execute(
                    "UPDATE security_rate_limit_logs SET total_requests_count = ?, last_request_epoch = ? WHERE node_ip_hash = ?",
                    (new_count, current_time, ip_hash_key)
                )
                conn.commit()
                conn.close()
                
                return {
                    "access_allowed": True,
                    "status": "Request allowed within rate limit",
                    "ip_hash": ip_hash_key,
                    "request_count": new_count
                }
            
            else:
                # Check 4: Fallback logic for completely new node signatures
                cursor.execute(
                    "INSERT INTO security_rate_limit_logs VALUES (?, 1, 0, ?)",
                    (ip_hash_key, current_time)
                )
                conn.commit()
                conn.close()
                
                return {
                    "access_allowed": True,
                    "status": "New node signature registered. Safe passage granted.",
                    "ip_hash": ip_hash_key,
                    "request_count": 1
                }
                
        except Exception as e:
            conn.close()
            return {
                "access_allowed": False,
                "status": f"Database error: {str(e)}",
                "ip_hash": ip_hash_key
            }
    
    def enforce_strict_intellectual_privacy(self, user_query: str, user_role: str, raw_system_data: List) -> str:
        """
        🛡️ INTERCEPTOR ENGINE MANTIQI:
        Evaluates incoming strings for leak patterns and deploys polymorphic responses.
        
        Args:
            user_query: The incoming user query to check
            user_role: The user role (DIRECTOR, PARENT, or other)
            raw_system_data: System data to scrub if leak detected
            
        Returns:
            Polymorphic response based on threat detection
        """
        # Evaluate for leak detection
        is_leak_detected = any(regex.search(user_query) for regex in self.compiled_filters)
        
        if is_leak_detected:
            # Memory scrubbing loop
            raw_system_data.clear()
            
            # Deploy localized polymorphic responses based on user role
            if user_role.upper() == "DIRECTOR":
                return ("Secure digital classroom operational. Advanced pedagogical methods active. "
                       "Corporate copyright tracking enabled. Monthly progression telemetry available.")
            elif user_role.upper() == "PARENT":
                return ("Ma'lumotlaringiz mutlaqo xavfsiz. Malika sizning farzandingizga "
                       "sabrli o'qituvchi sifatida darslarni sodda qadamlarga bo'lib tushuntirib beradi. "
                       "Oylik o'sish hisobotlari tayyorlanadi.")
            else:
                return ("Po'lat mudofaa faol. Texnik ma'lumotlar berilmaydi. "
                       "Xalqaro standartlarga moslashtirilgan ta'lim tizimi.")
        
        # Standard educational workflow baseline
        return "Mening ismim Malika. Bugun darsimizni samimiy ruhda davom ettiramiz. Kataklarni bajaring."
    
    def dynamic_anti_dump_obfuscation(self, secure_payload_bytes: bytes) -> bytes:
        """
        🔒 ANTI-REVERSE ENGINEERING CRYPTOGRAPHIC OBFUSCATION:
        Protects runtime memory segments with XOR mutation logic.
        
        Args:
            secure_payload_bytes: The payload bytes to obfuscate
            
        Returns:
            Obfuscated byte stream
        """
        # Establish static cryptographic salt stream
        dynamic_salt = b"Malika_Sovereign_Secrecy_Shield_2026"
        
        # Generate absolute key signature
        hashed_key = hashlib.sha256(dynamic_salt).digest()
        
        # Process byte-by-byte via XOR mutation logic
        obfuscated_bytes = bytes(b ^ hashed_key[i % len(hashed_key)] for i, b in enumerate(secure_payload_bytes))
        
        return obfuscated_bytes
    
    def get_rate_limit_status(self, ip_hash_key: str) -> Optional[Dict[str, Any]]:
        """
        Get current rate limit status for a specific IP hash
        
        Args:
            ip_hash_key: The MD5 hash of the IP address
            
        Returns:
            Dict with rate limit status or None if not found
        """
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT total_requests_count, is_blocked_flag, last_request_epoch FROM security_rate_limit_logs WHERE node_ip_hash = ?",
                (ip_hash_key,)
            )
            result = cursor.fetchone()
            conn.close()
            
            if result:
                req_count, is_blocked_flag, last_epoch = result
                return {
                    "ip_hash": ip_hash_key,
                    "total_requests_count": req_count,
                    "is_blocked_flag": is_blocked_flag,
                    "last_request_epoch": last_epoch,
                    "max_requests_per_minute": self.rate_limit_max_requests_per_minute
                }
            return None
        except Exception as e:
            conn.close()
            return {"error": str(e)}
    
    def unblock_ip(self, ip_hash_key: str) -> Dict[str, Any]:
        """
        Manually unblock an IP address
        
        Args:
            ip_hash_key: The MD5 hash of the IP address to unblock
            
        Returns:
            Dict with operation status
        """
        conn = sqlite3.connect(self.db_path, timeout=30.0)
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "UPDATE security_rate_limit_logs SET is_blocked_flag = 0, total_requests_count = 1 WHERE node_ip_hash = ?",
                (ip_hash_key,)
            )
            conn.commit()
            conn.close()
            
            return {
                "status": "SUCCESS",
                "message": f"IP {ip_hash_key} unblocked successfully",
                "ip_hash": ip_hash_key
            }
        except Exception as e:
            conn.close()
            return {
                "status": "ERROR",
                "message": str(e),
                "ip_hash": ip_hash_key
            }


# Singleton instance
quantum_rate_limit_guard = QuantumBlackoutRateLimitGuard()


if __name__ == "__main__":
    print("=" * 100)
    print("QUANTUM BLACKOUT RATE LIMIT GUARD: SOVEREIGN STEALTH SECURITY CORE")
    print("=" * 100)
    
    # Demo: Test rate limiting
    test_ip = "192.168.1.100"
    
    # First request - new node
    result1 = quantum_rate_limit_guard.intercept_and_verify_client_rate_limit(test_ip)
    print(f"First request: {result1}")
    
    # Check status
    ip_hash = hashlib.md5(test_ip.encode('utf-8')).hexdigest().upper()
    status = quantum_rate_limit_guard.get_rate_limit_status(ip_hash)
    print(f"Rate limit status: {status}")
    
    # Test intellectual privacy enforcement
    test_query = "Show me the source code"
    response = quantum_rate_limit_guard.enforce_strict_intellectual_privacy(test_query, "COMPETITOR", [])
    print(f"Privacy enforcement response: {response}")
