# -*- coding: utf-8 -*-
"""
🚀 Performance Monitor
Lightweight performance monitoring for bot and mini app
"""
import time
import psutil
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from functools import wraps
from collections import deque


logger = logging.getLogger(__name__)


class PerformanceMonitor:
    """Lightweight performance monitoring"""
    
    def __init__(self, max_samples: int = 100):
        self.metrics = deque(maxlen=max_samples)
        self.start_time = time.time()
    
    def record_metric(self, name: str, value: float, unit: str = "ms") -> None:
        """Record a performance metric"""
        self.metrics.append({
            'name': name,
            'value': value,
            'unit': unit,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_average(self, name: str) -> Optional[float]:
        """Get average value for a metric"""
        values = [m['value'] for m in self.metrics if m['name'] == name]
        if not values:
            return None
        return sum(values) / len(values)
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get current system resource usage"""
        try:
            process = psutil.Process()
            return {
                'cpu_percent': process.cpu_percent(),
                'memory_mb': process.memory_info().rss / 1024 / 1024,
                'memory_percent': process.memory_percent(),
                'threads': process.num_threads(),
                'uptime_seconds': time.time() - self.start_time
            }
        except Exception as e:
            logger.error(f"Error getting system stats: {e}")
            return {}
    
    def get_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        metric_names = set(m['name'] for m in self.metrics)
        summary = {}
        
        for name in metric_names:
            values = [m['value'] for m in self.metrics if m['name'] == name]
            if values:
                summary[name] = {
                    'avg': sum(values) / len(values),
                    'min': min(values),
                    'max': max(values),
                    'count': len(values),
                    'unit': self.metrics[-1]['unit'] if self.metrics else 'ms'
                }
        
        return summary


# Global monitor instance
monitor = PerformanceMonitor()


def monitor_performance(metric_name: str):
    """Decorator to monitor function performance"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = (time.time() - start_time) * 1000  # Convert to ms
                monitor.record_metric(metric_name, duration, "ms")
                return result
            except Exception as e:
                duration = (time.time() - start_time) * 1000
                monitor.record_metric(f"{metric_name}_error", duration, "ms")
                raise
        return wrapper
    return decorator


class ResponseTimeTracker:
    """Track API response times"""
    
    def __init__(self):
        self.response_times = deque(maxlen=1000)
    
    def record_response(self, endpoint: str, duration_ms: float) -> None:
        """Record API response time"""
        self.response_times.append({
            'endpoint': endpoint,
            'duration': duration_ms,
            'timestamp': datetime.now().isoformat()
        })
    
    def get_slow_endpoints(self, threshold_ms: float = 500) -> list:
        """Get endpoints slower than threshold"""
        return [
            r for r in self.response_times
            if r['duration'] > threshold_ms
        ]
    
    def get_average_response_time(self, endpoint: Optional[str] = None) -> Optional[float]:
        """Get average response time"""
        if endpoint:
            times = [r['duration'] for r in self.response_times if r['endpoint'] == endpoint]
        else:
            times = [r['duration'] for r in self.response_times]
        
        if not times:
            return None
        return sum(times) / len(times)


response_tracker = ResponseTimeTracker()


def log_performance_summary():
    """Log performance summary"""
    summary = monitor.get_summary()
    system_stats = monitor.get_system_stats()
    
    logger.info("📊 Performance Summary:")
    logger.info(f"  Metrics: {summary}")
    logger.info(f"  System: {system_stats}")
    
    # Log slow endpoints
    slow_endpoints = response_tracker.get_slow_endpoints(500)
    if slow_endpoints:
        logger.warning(f"⚠️  Slow endpoints detected: {len(slow_endpoints)}")
        for ep in slow_endpoints[:5]:  # Log top 5
            logger.warning(f"    {ep['endpoint']}: {ep['duration']:.2f}ms")
