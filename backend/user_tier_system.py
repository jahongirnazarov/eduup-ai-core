"""
User Tier System - VIP vs Free User Management
Zero-cost tier system with client-side validation
"""

import json
import os
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import secrets


class TierType(Enum):
    """User tier types"""
    FREE = "free"
    VIP = "vip"


@dataclass
class User:
    """User with tier information"""
    user_id: str
    username: str
    email: str
    tier: str
    tier_expires_at: Optional[str]
    ai_queries_today: int
    last_reset_date: str
    created_at: str


class UserTierSystem:
    """User tier management system"""
    
    def __init__(self):
        self.users: Dict[str, User] = {}
        self.tier_config = self._load_tier_config()
        self.daily_limits = self._get_daily_limits()
    
    def _load_tier_config(self) -> Dict[str, Any]:
        """Load tier configuration from JSON file"""
        try:
            config_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'user_tiers.json')
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
                return config.get('tiers', {})
        except Exception as e:
            print(f"Error loading tier config: {e}")
            return {}
    
    def _get_daily_limits(self) -> Dict[str, int]:
        """Get daily AI query limits for each tier"""
        limits = {}
        for tier_id, tier_config in self.tier_config.items():
            limits[tier_id] = tier_config.get('features', {}).get('ai_queries_per_day', 10)
        return limits
    
    def create_user(self, username: str, email: str, tier: str = "free") -> User:
        """Create new user with specified tier"""
        user_id = secrets.token_hex(16)
        now = datetime.now(timezone.utc).isoformat()
        
        user = User(
            user_id=user_id,
            username=username,
            email=email,
            tier=tier,
            tier_expires_at=None if tier == "free" else self._calculate_vip_expiry(),
            ai_queries_today=0,
            last_reset_date=now.split('T')[0],
            created_at=now
        )
        
        self.users[user_id] = user
        return user
    
    def _calculate_vip_expiry(self) -> str:
        """Calculate VIP expiry date (30 days from now)"""
        from datetime import timedelta
        expiry = datetime.now(timezone.utc) + timedelta(days=30)
        return expiry.isoformat()
    
    def get_user(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.users.get(user_id)
    
    def upgrade_to_vip(self, user_id: str, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Upgrade user to VIP tier"""
        user = self.get_user(user_id)
        if not user:
            return {"error": "User not found"}
        
        if user.tier == "vip":
            return {"error": "User already has VIP tier"}
        
        # Process payment (integration with billing engine)
        payment_result = self._process_payment(payment_data)
        if not payment_result.get("success"):
            return {"error": "Payment failed"}
        
        # Upgrade user
        user.tier = "vip"
        user.tier_expires_at = self._calculate_vip_expiry()
        
        return {
            "success": True,
            "user_id": user_id,
            "new_tier": "vip",
            "expires_at": user.tier_expires_at,
            "payment_id": payment_result.get("payment_id")
        }
    
    def _process_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process payment (stub for integration with billing engine)"""
        # In production, this would integrate with the billing engine
        payment_id = secrets.token_hex(16)
        return {
            "success": True,
            "payment_id": payment_id,
            "amount": payment_data.get("amount", 50000),
            "currency": payment_data.get("currency", "UZS")
        }
    
    def check_ai_query_limit(self, user_id: str) -> Dict[str, Any]:
        """Check if user can make AI query"""
        user = self.get_user(user_id)
        if not user:
            return {"allowed": False, "reason": "User not found"}
        
        # Check if tier is expired
        if user.tier == "vip" and user.tier_expires_at:
            expiry_date = datetime.fromisoformat(user.tier_expires_at)
            if expiry_date < datetime.now(timezone.utc):
                # Downgrade to free
                user.tier = "free"
                user.tier_expires_at = None
        
        # Reset daily counter if new day
        today = datetime.now(timezone.utc).isoformat().split('T')[0]
        if user.last_reset_date != today:
            user.ai_queries_today = 0
            user.last_reset_date = today
        
        # Check limit
        daily_limit = self.daily_limits.get(user.tier, 10)
        if user.ai_queries_today >= daily_limit:
            return {
                "allowed": False,
                "reason": "Daily limit exceeded",
                "tier": user.tier,
                "limit": daily_limit,
                "used": user.ai_queries_today
            }
        
        return {
            "allowed": True,
            "tier": user.tier,
            "limit": daily_limit,
            "used": user.ai_queries_today,
            "remaining": daily_limit - user.ai_queries_today
        }
    
    def record_ai_query(self, user_id: str) -> bool:
        """Record AI query for user"""
        user = self.get_user(user_id)
        if not user:
            return False
        
        user.ai_queries_today += 1
        return True
    
    def get_user_features(self, user_id: str) -> Dict[str, Any]:
        """Get features available to user based on tier"""
        user = self.get_user(user_id)
        if not user:
            return {"error": "User not found"}
        
        tier_config = self.tier_config.get(user.tier, {})
        return {
            "tier": user.tier,
            "features": tier_config.get('features', {}),
            "limitations": tier_config.get('limitations', []),
            "expires_at": user.tier_expires_at
        }
    
    def get_tier_pricing(self) -> Dict[str, Any]:
        """Get pricing information for all tiers"""
        pricing = {}
        for tier_id, tier_config in self.tier_config.items():
            pricing[tier_id] = {
                "name": tier_config.get('name'),
                "price": tier_config.get('price'),
                "currency": tier_config.get('currency'),
                "billing_period": tier_config.get('billing_period', 'monthly'),
                "features": tier_config.get('features', {}),
                "benefits": tier_config.get('benefits', [])
            }
        return pricing


# Singleton instance
_tier_system_instance = None

def get_user_tier_system() -> UserTierSystem:
    """Get user tier system instance"""
    global _tier_system_instance
    if _tier_system_instance is None:
        _tier_system_instance = UserTierSystem()
    return _tier_system_instance
