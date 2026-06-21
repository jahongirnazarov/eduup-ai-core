"""
Zero-Cost Monitoring Implementation
Uses file-based logging and in-memory metrics
No external monitoring services or expensive tools
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from collections import defaultdict
import threading

class ZeroCostMonitor:
    """
    Zero-cost monitoring using in-memory metrics and file-based logging
    - Request counting
    - Response time tracking
    - Error tracking
    - Performance metrics
    """
    
    def __init__(self):
        # In-memory metrics (no database cost)
        self.request_count = 0
        self.error_count = 0
        self.response_times = []
        self.endpoint_stats = defaultdict(lambda: {
            "count": 0,
            "errors": 0,
            "total_time": 0,
            "avg_time": 0
        })
        self.user_activity = defaultdict(int)
        self.start_time = datetime.utcnow()
        
        # Thread lock for thread safety
        self.lock = threading.Lock()
    
    def record_request(self, endpoint: str, response_time: float, success: bool = True, user_id: Optional[int] = None):
        """
        Record a request
        """
        with self.lock:
            self.request_count += 1
            
            if not success:
                self.error_count += 1
            
            # Track response time (keep last 1000)
            self.response_times.append(response_time)
            if len(self.response_times) > 1000:
                self.response_times.pop(0)
            
            # Track endpoint stats
            self.endpoint_stats[endpoint]["count"] += 1
            self.endpoint_stats[endpoint]["total_time"] += response_time
            self.endpoint_stats[endpoint]["avg_time"] = (
                self.endpoint_stats[endpoint]["total_time"] / 
                self.endpoint_stats[endpoint]["count"]
            )
            
            if not success:
                self.endpoint_stats[endpoint]["errors"] += 1
            
            # Track user activity
            if user_id:
                self.user_activity[user_id] += 1
    
    def get_metrics(self) -> Dict:
        """
        Get current metrics
        """
        with self.lock:
            uptime = datetime.utcnow() - self.start_time
            
            # Calculate average response time
            avg_response_time = 0
            if self.response_times:
                avg_response_time = sum(self.response_times) / len(self.response_times)
            
            # Calculate error rate
            error_rate = 0
            if self.request_count > 0:
                error_rate = (self.error_count / self.request_count) * 100
            
            return {
                "uptime_seconds": uptime.total_seconds(),
                "total_requests": self.request_count,
                "total_errors": self.error_count,
                "error_rate_percent": round(error_rate, 2),
                "avg_response_time_ms": round(avg_response_time * 1000, 2),
                "active_users": len(self.user_activity),
                "endpoint_stats": dict(self.endpoint_stats),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def get_endpoint_stats(self, endpoint: str) -> Dict:
        """
        Get stats for specific endpoint
        """
        with self.lock:
            if endpoint in self.endpoint_stats:
                return dict(self.endpoint_stats[endpoint])
            return {"count": 0, "errors": 0, "avg_time": 0}
    
    def reset_metrics(self):
        """
        Reset metrics (use with caution)
        """
        with self.lock:
            self.request_count = 0
            self.error_count = 0
            self.response_times = []
            self.endpoint_stats = defaultdict(lambda: {
                "count": 0,
                "errors": 0,
                "total_time": 0,
                "avg_time": 0
            })
            self.user_activity = defaultdict(int)
            self.start_time = datetime.utcnow()


class FileLogger:
    """
    File-based logger (zero-cost, no external logging services)
    """
    
    def __init__(self, log_file: str = "app.log"):
        self.log_file = log_file
        self.log_levels = {"DEBUG": 0, "INFO": 1, "WARNING": 2, "ERROR": 3, "CRITICAL": 4}
        self.min_level = 1  # INFO by default
    
    def set_level(self, level: str):
        """Set minimum log level"""
        if level.upper() in self.log_levels:
            self.min_level = self.log_levels[level.upper()]
    
    def _log(self, level: str, message: str, extra: Optional[Dict] = None):
        """Internal log method"""
        if self.log_levels[level.upper()] < self.min_level:
            return
        
        timestamp = datetime.utcnow().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "level": level,
            "message": message
        }
        
        if extra:
            log_entry["extra"] = extra
        
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
        except Exception as e:
            print(f"Failed to write log: {e}")
    
    def debug(self, message: str, extra: Optional[Dict] = None):
        """Log debug message"""
        self._log("DEBUG", message, extra)
    
    def info(self, message: str, extra: Optional[Dict] = None):
        """Log info message"""
        self._log("INFO", message, extra)
    
    def warning(self, message: str, extra: Optional[Dict] = None):
        """Log warning message"""
        self._log("WARNING", message, extra)
    
    def error(self, message: str, extra: Optional[Dict] = None):
        """Log error message"""
        self._log("ERROR", message, extra)
    
    def critical(self, message: str, extra: Optional[Dict] = None):
        """Log critical message"""
        self._log("CRITICAL", message, extra)
    
    def get_recent_logs(self, count: int = 100) -> List[Dict]:
        """Get recent log entries"""
        try:
            with open(self.log_file, "r", encoding="utf-8") as f:
                lines = f.readlines()
            
            recent_lines = lines[-count:] if len(lines) > count else lines
            return [json.loads(line) for line in recent_lines]
        except Exception:
            return []


class PerformanceTracker:
    """
    Performance tracking for specific operations
    Zero-cost: in-memory timing
    """
    
    def __init__(self):
        self.operations = defaultdict(list)
        self.lock = threading.Lock()
    
    def start_operation(self, operation_name: str) -> float:
        """
        Start timing an operation
        Returns start time
        """
        return time.time()
    
    def end_operation(self, operation_name: str, start_time: float):
        """
        End timing an operation and record duration
        """
        duration = time.time() - start_time
        
        with self.lock:
            self.operations[operation_name].append(duration)
            # Keep only last 100 measurements
            if len(self.operations[operation_name]) > 100:
                self.operations[operation_name].pop(0)
    
    def get_operation_stats(self, operation_name: str) -> Dict:
        """
        Get stats for specific operation
        """
        with self.lock:
            if operation_name not in self.operations or not self.operations[operation_name]:
                return {"count": 0, "avg_time": 0, "min_time": 0, "max_time": 0}
            
            times = self.operations[operation_name]
            return {
                "count": len(times),
                "avg_time": round(sum(times) / len(times), 4),
                "min_time": round(min(times), 4),
                "max_time": round(max(times), 4)
            }
    
    def get_all_stats(self) -> Dict:
        """
        Get stats for all operations
        """
        with self.lock:
            return {
                op: self.get_operation_stats(op)
                for op in self.operations
            }


class HealthChecker:
    """
    Health check for system components
    Zero-cost: simple checks
    """
    
    def __init__(self):
        self.checks = {}
    
    def register_check(self, name: str, check_function):
        """Register a health check"""
        self.checks[name] = check_function
    
    def run_check(self, name: str) -> Dict:
        """Run a specific health check"""
        if name not in self.checks:
            return {"status": "unknown", "message": "Check not found"}
        
        try:
            result = self.checks[name]()
            return {"status": "healthy", "result": result}
        except Exception as e:
            return {"status": "unhealthy", "error": str(e)}
    
    def run_all_checks(self) -> Dict:
        """Run all health checks"""
        results = {}
        all_healthy = True
        
        for name in self.checks:
            result = self.run_check(name)
            results[name] = result
            
            if result["status"] != "healthy":
                all_healthy = False
        
        return {
            "overall_status": "healthy" if all_healthy else "unhealthy",
            "checks": results,
            "timestamp": datetime.utcnow().isoformat()
        }


class AlertManager:
    """
    Alert manager for critical events
    Zero-cost: in-memory alert tracking
    """
    
    def __init__(self):
        self.alerts = []
        self.alert_rules = []
        self.lock = threading.Lock()
    
    def add_alert_rule(self, name: str, condition_function, severity: str = "warning"):
        """
        Add an alert rule
        condition_function should return True if alert should trigger
        """
        self.alert_rules.append({
            "name": name,
            "condition": condition_function,
            "severity": severity
        })
    
    def check_alerts(self, metrics: Dict) -> List[Dict]:
        """
        Check all alert rules against current metrics
        """
        triggered_alerts = []
        
        for rule in self.alert_rules:
            try:
                if rule["condition"](metrics):
                    alert = {
                        "name": rule["name"],
                        "severity": rule["severity"],
                        "timestamp": datetime.utcnow().isoformat(),
                        "metrics": metrics
                    }
                    triggered_alerts.append(alert)
                    
                    with self.lock:
                        self.alerts.append(alert)
            except Exception as e:
                print(f"Error checking alert rule {rule['name']}: {e}")
        
        return triggered_alerts
    
    def get_recent_alerts(self, count: int = 50) -> List[Dict]:
        """Get recent alerts"""
        with self.lock:
            return self.alerts[-count:] if len(self.alerts) > count else self.alerts
    
    def clear_old_alerts(self, max_age_hours: int = 24):
        """Clear alerts older than specified hours"""
        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        with self.lock:
            self.alerts = [
                alert for alert in self.alerts
                if datetime.fromisoformat(alert["timestamp"]) > cutoff
            ]


# Singleton instances
_monitor_instance = None
_logger_instance = None
_performance_tracker = None
_health_checker = None
_alert_manager = None

def get_monitor() -> ZeroCostMonitor:
    """Get monitor instance (singleton)"""
    global _monitor_instance
    if _monitor_instance is None:
        _monitor_instance = ZeroCostMonitor()
    return _monitor_instance

def get_logger(log_file: str = "app.log") -> FileLogger:
    """Get logger instance (singleton)"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = FileLogger(log_file)
    return _logger_instance

def get_performance_tracker() -> PerformanceTracker:
    """Get performance tracker instance (singleton)"""
    global _performance_tracker
    if _performance_tracker is None:
        _performance_tracker = PerformanceTracker()
    return _performance_tracker

def get_health_checker() -> HealthChecker:
    """Get health checker instance (singleton)"""
    global _health_checker
    if _health_checker is None:
        _health_checker = HealthChecker()
    return _health_checker

def get_alert_manager() -> AlertManager:
    """Get alert manager instance (singleton)"""
    global _alert_manager
    if _alert_manager is None:
        _alert_manager = AlertManager()
    return _alert_manager
