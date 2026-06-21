# -*- coding: utf-8 -*-
"""
🚀 Lightweight Cache Manager
Optimized caching for bot and mini app performance
"""
import time
import hashlib
import json
from typing import Any, Optional, Dict
from functools import wraps
from datetime import datetime, timedelta


class LiteCache:
    """Lightweight in-memory cache with TTL"""
    
    def __init__(self, default_ttl: int = 3600):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.hits = 0
        self.misses = 0
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        key_data = f"{prefix}:{str(args)}:{str(sorted(kwargs.items()))}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if key not in self._cache:
            self.misses += 1
            return None
        
        entry = self._cache[key]
        
        # Check if expired
        if entry['expires_at'] < time.time():
            del self._cache[key]
            self.misses += 1
            return None
        
        self.hits += 1
        return entry['value']
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache"""
        ttl = ttl or self.default_ttl
        self._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl,
            'created_at': time.time()
        }
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache"""
        self._cache.clear()
        self.hits = 0
        self.misses = 0
    
    def cleanup_expired(self) -> int:
        """Remove expired entries"""
        current_time = time.time()
        expired_keys = [
            key for key, entry in self._cache.items()
            if entry['expires_at'] < current_time
        ]
        
        for key in expired_keys:
            del self._cache[key]
        
        return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'size': len(self._cache),
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': f"{hit_rate:.2f}%",
            'memory_usage': f"{len(json.dumps(self._cache, default=str))} bytes"
        }


# Global cache instance
cache = LiteCache(default_ttl=3600)


def cached(ttl: int = 3600, prefix: str = "default"):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = cache._generate_key(prefix, func.__name__, *args, **kwargs)
            
            # Try to get from cache
            result = cache.get(key)
            if result is not None:
                return result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            cache.set(key, result, ttl)
            
            return result
        return wrapper
    return decorator


# Response cache for API endpoints
class ResponseCache:
    """Cache for HTTP responses"""
    
    def __init__(self):
        self.cache = LiteCache(default_ttl=300)  # 5 minutes default
    
    def get_response(self, url: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """Get cached response"""
        key = self.cache._generate_key("response", url, params or {})
        return self.cache.get(key)
    
    def set_response(self, url: str, params: Optional[Dict], response: Dict, ttl: int = 300) -> None:
        """Cache response"""
        key = self.cache._generate_key("response", url, params or {})
        self.cache.set(key, response, ttl)
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern"""
        keys_to_delete = [
            key for key in self.cache._cache.keys()
            if pattern in key
        ]
        
        for key in keys_to_delete:
            self.cache.delete(key)
        
        return len(keys_to_delete)


response_cache = ResponseCache()
