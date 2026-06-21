# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — API KEY MANAGER
Intelligent API key rotation and load balancing for high availability.
"""
import random
import time
import logging
from typing import List, Optional, Dict
from collections import defaultdict
from dataclasses import dataclass
from config import settings

logger = logging.getLogger(__name__)

@dataclass
class APIKeyStats:
    """Track API key usage statistics"""
    key: str
    requests_count: int = 0
    errors_count: int = 0
    last_used: float = 0
    last_error: float = 0
    is_healthy: bool = True

class APIKeyManager:
    """Intelligent API key manager with rotation and health monitoring"""
    
    def __init__(self):
        self.groq_keys: List[APIKeyStats] = []
        self.openai_keys: List[APIKeyStats] = []
        self.google_keys: List[APIKeyStats] = []
        self.telegram_tokens: List[APIKeyStats] = []
        
        self._initialize_keys()
    
    def _initialize_keys(self):
        """Initialize API keys from settings"""
        # Initialize Groq keys
        for key in settings.GROQ_API_KEYS:
            if key:
                self.groq_keys.append(APIKeyStats(key=key))
        
        # Initialize OpenAI keys
        for key in settings.OPENAI_API_KEYS:
            if key:
                self.openai_keys.append(APIKeyStats(key=key))
        
        # Initialize Google keys
        for key in settings.GOOGLE_API_KEYS:
            if key:
                self.google_keys.append(APIKeyStats(key=key))
        
        # Initialize Telegram tokens
        for token in settings.TELEGRAM_BOT_TOKENS:
            if token:
                self.telegram_tokens.append(APIKeyStats(key=token))
        
        logger.info(f"✅ API Key Manager initialized:")
        logger.info(f"   - Groq keys: {len(self.groq_keys)}")
        logger.info(f"   - OpenAI keys: {len(self.openai_keys)}")
        logger.info(f"   - Google keys: {len(self.google_keys)}")
        logger.info(f"   - Telegram tokens: {len(self.telegram_tokens)}")
    
    def get_groq_key(self) -> Optional[str]:
        """Get next healthy Groq API key with intelligent rotation"""
        return self._get_healthy_key(self.groq_keys, "Groq")
    
    def get_openai_key(self) -> Optional[str]:
        """Get next healthy OpenAI API key with intelligent rotation"""
        return self._get_healthy_key(self.openai_keys, "OpenAI")
    
    def get_google_key(self) -> Optional[str]:
        """Get next healthy Google API key with intelligent rotation"""
        return self._get_healthy_key(self.google_keys, "Google")
    
    def get_telegram_token(self) -> Optional[str]:
        """Get next healthy Telegram bot token with intelligent rotation"""
        return self._get_healthy_key(self.telegram_tokens, "Telegram")
    
    def _get_healthy_key(self, keys: List[APIKeyStats], provider: str) -> Optional[str]:
        """Get next healthy API key using intelligent selection"""
        if not keys:
            logger.warning(f"No {provider} keys available")
            return None
        
        # Filter healthy keys
        healthy_keys = [k for k in keys if k.is_healthy]
        
        if not healthy_keys:
            logger.warning(f"All {provider} keys are unhealthy, resetting...")
            # Reset all keys to healthy
            for k in keys:
                k.is_healthy = True
                k.errors_count = 0
            healthy_keys = keys
        
        # Select key with least usage (load balancing)
        selected_key = min(healthy_keys, key=lambda k: k.requests_count)
        
        # Update stats
        selected_key.requests_count += 1
        selected_key.last_used = time.time()
        
        logger.debug(f"Selected {provider} key (total requests: {selected_key.requests_count})")
        return selected_key.key
    
    def report_error(self, provider: str, api_key: str):
        """Report API key error for health monitoring"""
        key_list = None
        if provider.lower() == "groq":
            key_list = self.groq_keys
        elif provider.lower() == "openai":
            key_list = self.openai_keys
        elif provider.lower() == "google":
            key_list = self.google_keys
        elif provider.lower() == "telegram":
            key_list = self.telegram_tokens
        
        if key_list:
            for key_stat in key_list:
                if key_stat.key == api_key:
                    key_stat.errors_count += 1
                    key_stat.last_error = time.time()
                    
                    # Mark as unhealthy if error rate is high
                    if key_stat.errors_count >= 5:
                        key_stat.is_healthy = False
                        logger.warning(f"{provider} key marked as unhealthy (errors: {key_stat.errors_count})")
                    
                    break
    
    def report_success(self, provider: str, api_key: str):
        """Report successful API call"""
        key_list = None
        if provider.lower() == "groq":
            key_list = self.groq_keys
        elif provider.lower() == "openai":
            key_list = self.openai_keys
        elif provider.lower() == "google":
            key_list = self.google_keys
        elif provider.lower() == "telegram":
            key_list = self.telegram_tokens
        
        if key_list:
            for key_stat in key_list:
                if key_stat.key == api_key:
                    # Gradually recover error count
                    if key_stat.errors_count > 0:
                        key_stat.errors_count = max(0, key_stat.errors_count - 1)
                    break
    
    def get_stats(self) -> Dict:
        """Get API key usage statistics"""
        return {
            "groq": {
                "total_keys": len(self.groq_keys),
                "healthy_keys": len([k for k in self.groq_keys if k.is_healthy]),
                "total_requests": sum(k.requests_count for k in self.groq_keys),
                "total_errors": sum(k.errors_count for k in self.groq_keys)
            },
            "openai": {
                "total_keys": len(self.openai_keys),
                "healthy_keys": len([k for k in self.openai_keys if k.is_healthy]),
                "total_requests": sum(k.requests_count for k in self.openai_keys),
                "total_errors": sum(k.errors_count for k in self.openai_keys)
            },
            "google": {
                "total_keys": len(self.google_keys),
                "healthy_keys": len([k for k in self.google_keys if k.is_healthy]),
                "total_requests": sum(k.requests_count for k in self.google_keys),
                "total_errors": sum(k.errors_count for k in self.google_keys)
            },
            "telegram": {
                "total_keys": len(self.telegram_tokens),
                "healthy_keys": len([k for k in self.telegram_tokens if k.is_healthy]),
                "total_requests": sum(k.requests_count for k in self.telegram_tokens),
                "total_errors": sum(k.errors_count for k in self.telegram_tokens)
            }
        }
    
    def reset_all_keys(self):
        """Reset all keys to healthy state"""
        for key_list in [self.groq_keys, self.openai_keys, self.google_keys, self.telegram_tokens]:
            for key_stat in key_list:
                key_stat.is_healthy = True
                key_stat.errors_count = 0
        logger.info("All API keys reset to healthy state")

# Global API key manager instance
api_key_manager = APIKeyManager()
