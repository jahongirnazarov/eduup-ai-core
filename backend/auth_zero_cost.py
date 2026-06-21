"""
Zero-Cost Authentication Implementation
Uses client-side JWT tokens with minimal server validation
No expensive session storage, stateless authentication
"""

import hashlib
import secrets
import json
from datetime import datetime, timedelta
from typing import Optional, Dict
import base64

class ZeroCostAuth:
    """
    Zero-cost authentication using client-side tokens
    - No server-side session storage
    - Stateless JWT-like tokens
    - Client-side validation
    - Minimal server sync
    """
    
    def __init__(self, secret_key: Optional[str] = None):
        # Generate secret key if not provided
        self.secret_key = secret_key or secrets.token_hex(32)
        self.token_expiry_hours = 24  # Token valid for 24 hours
    
    def hash_password(self, password: str) -> str:
        """
        Hash password using SHA-256 (zero-cost, built-in)
        Note: In production, use bcrypt or argon2
        """
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return self.hash_password(password) == password_hash
    
    def generate_token(self, user_id: int, username: str) -> str:
        """
        Generate client-side token (JWT-like)
        Contains: user_id, username, expiry, signature
        """
        # Create payload
        payload = {
            "user_id": user_id,
            "username": username,
            "exp": (datetime.utcnow() + timedelta(hours=self.token_expiry_hours)).isoformat(),
            "iat": datetime.utcnow().isoformat()
        }
        
        # Encode payload
        payload_json = json.dumps(payload)
        payload_b64 = base64.b64encode(payload_json.encode()).decode()
        
        # Create signature
        signature = self._sign(payload_b64)
        
        # Combine: payload.signature
        token = f"{payload_b64}.{signature}"
        
        return token
    
    def _sign(self, data: str) -> str:
        """Sign data with secret key"""
        signature = hashlib.hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()
        return signature
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verify token and return payload
        Returns None if invalid
        """
        try:
            # Split token
            parts = token.split('.')
            if len(parts) != 2:
                return None
            
            payload_b64, signature = parts
            
            # Verify signature
            expected_signature = self._sign(payload_b64)
            if not secrets.compare_digest(signature, expected_signature):
                return None
            
            # Decode payload
            payload_json = base64.b64decode(payload_b64).decode()
            payload = json.loads(payload_json)
            
            # Check expiry
            exp = datetime.fromisoformat(payload['exp'])
            if datetime.utcnow() > exp:
                return None
            
            return payload
            
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def refresh_token(self, token: str) -> Optional[str]:
        """
        Refresh token if still valid
        Returns new token or None if invalid
        """
        payload = self.verify_token(token)
        if not payload:
            return None
        
        # Generate new token with same user data
        return self.generate_token(payload['user_id'], payload['username'])
    
    def get_user_id_from_token(self, token: str) -> Optional[int]:
        """Extract user_id from token"""
        payload = self.verify_token(token)
        if payload:
            return payload['user_id']
        return None
    
    def get_username_from_token(self, token: str) -> Optional[str]:
        """Extract username from token"""
        payload = self.verify_token(token)
        if payload:
            return payload['username']
        return None


class ClientSideAuth:
    """
    Client-side authentication utilities
    For use in frontend JavaScript
    """
    
    @staticmethod
    def generate_client_token(user_data: Dict, secret: str) -> str:
        """
        Generate token on client-side (for offline use)
        Note: Less secure, use only for offline capability
        """
        payload = {
            "user_data": user_data,
            "exp": (datetime.utcnow() + timedelta(hours=1)).isoformat()
        }
        
        payload_json = json.dumps(payload)
        payload_b64 = base64.b64encode(payload_json.encode()).decode()
        
        # Simple signature
        signature = hashlib.sha256(f"{payload_b64}{secret}".encode()).hexdigest()
        
        return f"{payload_b64}.{signature}"
    
    @staticmethod
    def verify_client_token(token: str, secret: str) -> Optional[Dict]:
        """Verify client-side token"""
        try:
            parts = token.split('.')
            if len(parts) != 2:
                return None
            
            payload_b64, signature = parts
            
            # Verify signature
            expected_signature = hashlib.sha256(f"{payload_b64}{secret}".encode()).hexdigest()
            if signature != expected_signature:
                return None
            
            # Decode payload
            payload_json = base64.b64decode(payload_b64).decode()
            payload = json.loads(payload_json)
            
            # Check expiry
            exp = datetime.fromisoformat(payload['exp'])
            if datetime.utcnow() > exp:
                return None
            
            return payload['user_data']
            
        except Exception:
            return None


# Session management (minimal, in-memory)
class MinimalSessionManager:
    """
    Minimal session management for critical operations
    Only stores active sessions in memory (no database cost)
    """
    
    def __init__(self):
        self.sessions = {}  # {session_id: {user_id, created_at}}
    
    def create_session(self, user_id: int) -> str:
        """Create new session"""
        session_id = secrets.token_hex(16)
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow()
        }
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict]:
        """Get session data"""
        return self.sessions.get(session_id)
    
    def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
    
    def cleanup_old_sessions(self, max_age_hours: int = 24):
        """Clean up old sessions"""
        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        to_delete = []
        
        for session_id, session_data in self.sessions.items():
            if session_data['created_at'] < cutoff:
                to_delete.append(session_id)
        
        for session_id in to_delete:
            del self.sessions[session_id]
        
        return len(to_delete)


# Rate limiting (in-memory, zero-cost)
class InMemoryRateLimiter:
    """
    In-memory rate limiter (no Redis cost)
    Tracks requests per IP/user
    """
    
    def __init__(self):
        self.requests = {}  # {identifier: [(timestamp, count)]}
        self.max_requests = 100  # Per hour
        self.window_seconds = 3600  # 1 hour
    
    def is_allowed(self, identifier: str) -> bool:
        """Check if request is allowed"""
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=self.window_seconds)
        
        # Get or create request history
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Clean old requests
        self.requests[identifier] = [
            (ts, count) for ts, count in self.requests[identifier]
            if ts > cutoff
        ]
        
        # Count requests in window
        total_requests = sum(count for ts, count in self.requests[identifier])
        
        if total_requests >= self.max_requests:
            return False
        
        # Add this request
        self.requests[identifier].append((now, 1))
        return True
    
    def get_remaining(self, identifier: str) -> int:
        """Get remaining requests"""
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=self.window_seconds)
        
        if identifier not in self.requests:
            return self.max_requests
        
        # Clean old requests
        self.requests[identifier] = [
            (ts, count) for ts, count in self.requests[identifier]
            if ts > cutoff
        ]
        
        total_requests = sum(count for ts, count in self.requests[identifier])
        return max(0, self.max_requests - total_requests)


# Singleton instances
_auth_instance = None
_session_manager = None
_rate_limiter = None

def get_auth(secret_key: Optional[str] = None) -> ZeroCostAuth:
    """Get auth instance (singleton)"""
    global _auth_instance
    if _auth_instance is None:
        _auth_instance = ZeroCostAuth(secret_key)
    return _auth_instance

def get_session_manager() -> MinimalSessionManager:
    """Get session manager instance (singleton)"""
    global _session_manager
    if _session_manager is None:
        _session_manager = MinimalSessionManager()
    return _session_manager

def get_rate_limiter() -> InMemoryRateLimiter:
    """Get rate limiter instance (singleton)"""
    global _rate_limiter
    if _rate_limiter is None:
        _rate_limiter = InMemoryRateLimiter()
    return _rate_limiter
