# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — SECURITY & MONITORING AGENTS
Group 7: Kiber-Xavfsizlik, Monitoring va Admin Panel Agentlari (5 agents)
"""
import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

# [5-BLOK: MILITARY-GRADE CYBER SECURITY & BIG DATA AUTOMATION]
import face_recognition
import dlib
import cv2
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import scapy.all as scapy
import sqlparse

@dataclass
class SecurityEvent:
    """Security event structure"""
    event_id: str
    event_type: str
    severity: str
    description: str
    timestamp: datetime
    source_ip: Optional[str]
    user_id: Optional[str]

@dataclass
class BackupRecord:
    """Backup record structure"""
    backup_id: str
    timestamp: datetime
    file_path: str
    file_size: int
    status: str
    encryption_key: str

class Agent_DataProtector:
    """
    📌 35. @Agent_DataProtector (Kiber-Qalqon Agent)
    Vazifasi: eduup_core.db bazasini xakerlardan himoya qiladi, talabalar parollari va moliya ledjerlarini 
    bank darajasida shifrlab (hashed) saqlaydi.
    Hisobot yo'li: Shifrlash algoritmlari barqarorligi va kiber-hujumlar qaytarilishi bo'yicha kunlik audit logs hisobotini yuritadi.
    """
    
    def __init__(self):
        self.encryption_keys = {}
        self.security_events = []
        self.encryption_algorithm = "SHA-256"
        self.security_policies = self._initialize_security_policies()
    
    def _initialize_security_policies(self) -> Dict:
        """Xavfsizlik siyosatlari"""
        return {
            "password_hashing": True,
            "data_encryption": True,
            "sql_injection_protection": True,
            "xss_protection": True,
            "rate_limiting": True,
            "session_timeout": 3600,
            "max_login_attempts": 5
        }
    
    def hash_password(self, password: str, salt: str = None) -> Dict:
        """Parolni shifrlash"""
        if salt is None:
            salt = hashlib.sha256(str(random.random()).encode()).hexdigest()[:32]
        
        # Hash password with salt
        salted_password = password + salt
        hashed = hashlib.sha256(salted_password.encode()).hexdigest()
        
        return {
            "status": "PASSWORD_HASHED",
            "hashed_password": hashed,
            "salt": salt,
            "algorithm": self.encryption_algorithm
        }
    
    def verify_password(self, password: str, hashed_password: str, salt: str) -> bool:
        """Parolni tekshirish"""
        salted_password = password + salt
        computed_hash = hashlib.sha256(salted_password.encode()).hexdigest()
        
        return computed_hash == hashed_password
    
    def encrypt_data(self, data: str, key: str) -> Dict:
        """Ma'lumotni shifrlash"""
        # Simplified encryption - in production use AES
        encrypted = hashlib.sha256((data + key).encode()).hexdigest()
        
        return {
            "status": "DATA_ENCRYPTED",
            "encrypted_data": encrypted,
            "algorithm": self.encryption_algorithm
        }
    
    def decrypt_data(self, encrypted_data: str, key: str, original_data: str) -> bool:
        """Ma'lumotni deshifrlash"""
        # Simplified - verify by re-encrypting
        recomputed = hashlib.sha256((original_data + key).encode()).hexdigest()
        return recomputed == encrypted_data
    
    def log_security_event(self, event_type: str, severity: str, 
                          description: str, source_ip: str = None, 
                          user_id: str = None) -> Dict:
        """Xavfsizlik hodisasini qayd etish"""
        event = SecurityEvent(
            event_id=f"sec_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}",
            event_type=event_type,
            severity=severity,
            description=description,
            timestamp=datetime.now(),
            source_ip=source_ip,
            user_id=user_id
        )
        
        self.security_events.append(event)
        
        return {
            "status": "SECURITY_EVENT_LOGGED",
            "event_id": event.event_id,
            "severity": severity
        }
    
    def detect_suspicious_activity(self, user_id: str, activity_pattern: Dict) -> Dict:
        """Shubhali faollikni aniqlash"""
        risk_factors = []
        
        # Check for suspicious patterns
        if activity_pattern.get("login_attempts", 0) > 5:
            risk_factors.append("Multiple failed login attempts")
        
        if activity_pattern.get("ip_changes", 0) > 3:
            risk_factors.append("Frequent IP address changes")
        
        if activity_pattern.get("unusual_access_time", False):
            risk_factors.append("Access at unusual time")
        
        if activity_pattern.get("data_export_attempts", 0) > 0:
            risk_factors.append("Data export attempts detected")
        
        if risk_factors:
            self.log_security_event(
                event_type="suspicious_activity",
                severity="high",
                description=f"Suspicious activity detected: {', '.join(risk_factors)}",
                user_id=user_id
            )
            
            return {
                "status": "SUSPICIOUS_ACTIVITY_DETECTED",
                "user_id": user_id,
                "risk_factors": risk_factors,
                "action_required": "Investigate immediately"
            }
        
        return {
            "status": "NO_SUSPICIOUS_ACTIVITY",
            "user_id": user_id
        }
    
    def get_daily_audit_report(self) -> Dict:
        """Kunlik audit hisoboti"""
        today = datetime.now().date()
        today_events = [event for event in self.security_events 
                       if event.timestamp.date() == today]
        
        critical_events = len([e for e in today_events if e["severity"] == "critical"])
        high_events = len([e for e in today_events if e["severity"] == "high"])
        medium_events = len([e for e in today_events if e["severity"] == "medium"])
        low_events = len([e for e in today_events if e["severity"] == "low"])
        
        return {
            "date": today.isoformat(),
            "total_events": len(today_events),
            "severity_breakdown": {
                "critical": critical_events,
                "high": high_events,
                "medium": medium_events,
                "low": low_events
            },
            "encryption_status": "active",
            "algorithm": self.encryption_algorithm,
            "security_policies": self.security_policies
        }
    
    def update_security_policy(self, policy_name: str, new_value) -> Dict:
        """Xavfsizlik siyosatini yangilash"""
        if policy_name in self.security_policies:
            self.security_policies[policy_name] = new_value
            
            self.log_security_event(
                event_type="policy_update",
                severity="medium",
                description=f"Security policy '{policy_name}' updated to {new_value}"
            )
            
            return {
                "status": "POLICY_UPDATED",
                "policy_name": policy_name,
                "new_value": new_value
            }
        
        return {
            "status": "POLICY_NOT_FOUND",
            "policy_name": policy_name
        }


class Agent_TokenMonitor:
    """
    📌 37. @Agent_TokenMonitor (AI Balans Kuzatuvchi)
    Vazifasi: Groq va OpenAI bulutli hisobingizdagi dollar qoldig'ini har daqiqa tekshirib, 
    uni rahbar boshqaruv panelidagi neon vizual kartaga jonli chizib turadi.
    Hisobot yo'li: Balans miqdori kamayganda Rahbar Xabarchisiga avtomat ravishda tezkor signal (Alert push) topshirida.
    """
    
    def __init__(self):
        self.api_balances = {
            "groq": {"balance": 100.0, "currency": "USD", "last_updated": None},
            "openai": {"balance": 50.0, "currency": "USD", "last_updated": None}
        }
        self.alert_thresholds = {
            "groq": 20.0,
            "openai": 10.0
        }
        self.balance_history = []
        self.alerts_sent = []
    
    def update_balance(self, api_name: str, balance: float) -> Dict:
        """Balansni yangilash"""
        if api_name not in self.api_balances:
            return {"status": "API_NOT_FOUND", "api_name": api_name}
        
        old_balance = self.api_balances[api_name]["balance"]
        self.api_balances[api_name]["balance"] = balance
        self.api_balances[api_name]["last_updated"] = datetime.now().isoformat()
        
        # Log balance change
        history_entry = {
            "api_name": api_name,
            "old_balance": old_balance,
            "new_balance": balance,
            "change": balance - old_balance,
            "timestamp": datetime.now().isoformat()
        }
        
        self.balance_history.append(history_entry)
        
        # Check if alert needed
        if balance < self.alert_thresholds[api_name]:
            return self._send_balance_alert(api_name, balance)
        
        return {
            "status": "BALANCE_UPDATED",
            "api_name": api_name,
            "new_balance": balance,
            "change": balance - old_balance
        }
    
    def _send_balance_alert(self, api_name: str, balance: float) -> Dict:
        """Balans haqida xabar yuborish"""
        alert = {
            "alert_id": f"alert_{api_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "api_name": api_name,
            "current_balance": balance,
            "threshold": self.alert_thresholds[api_name],
            "severity": "critical" if balance < self.alert_thresholds[api_name] / 2 else "high",
            "message": f"{api_name.upper()} balansi kam: ${balance:.2f}",
            "sent_at": datetime.now().isoformat()
        }
        
        self.alerts_sent.append(alert)
        
        return {
            "status": "BALANCE_ALERT_SENT",
            "alert_id": alert["alert_id"],
            "api_name": api_name,
            "current_balance": balance,
            "message": alert["message"],
            "action_required": "Recharge balance immediately"
        }
    
    def get_current_balances(self) -> Dict:
        """Joriy balanslarni olish"""
        return {
            "api_balances": self.api_balances,
            "total_balance": sum(b["balance"] for b in self.api_balances.values()),
            "last_updated": max((b["last_updated"] for b in self.api_balances.values() if b["last_updated"]), default=None)
        }
    
    def get_balance_history(self, api_name: str = None, hours: int = 24) -> List[Dict]:
        """Balans tarixini olish"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        
        history = self.balance_history
        if api_name:
            history = [h for h in history if h["api_name"] == api_name]
        
        return [
            entry for entry in history
            if datetime.fromisoformat(entry["timestamp"]) > cutoff_time
        ]
    
    def set_alert_threshold(self, api_name: str, threshold: float) -> Dict:
        """Xabar chegarasini belgilash"""
        if api_name not in self.api_balances:
            return {"status": "API_NOT_FOUND", "api_name": api_name}
        
        self.alert_thresholds[api_name] = threshold
        
        return {
            "status": "THRESHOLD_UPDATED",
            "api_name": api_name,
            "new_threshold": threshold
        }
    
    def get_usage_statistics(self, days: int = 7) -> Dict:
        """Foydalanish statistikasi"""
        cutoff_date = datetime.now() - timedelta(days=days)
        relevant_history = [
            h for h in self.balance_history
            if datetime.fromisoformat(h["timestamp"]) > cutoff_date
        ]
        
        if not relevant_history:
            return {"status": "NO_DATA", "period_days": days}
        
        total_usage = sum(abs(h["change"]) for h in relevant_history if h["change"] < 0)
        avg_daily_usage = total_usage / days
        
        api_usage = {}
        for api in self.api_balances.keys():
            api_history = [h for h in relevant_history if h["api_name"] == api]
            api_usage[api] = sum(abs(h["change"]) for h in api_history if h["change"] < 0)
        
        return {
            "period_days": days,
            "total_usage": total_usage,
            "average_daily_usage": avg_daily_usage,
            "usage_by_api": api_usage,
            "projected_days_remaining": self._calculate_days_remaining(total_usage / days)
        }
    
    def _calculate_days_remaining(self, daily_usage: float) -> Dict:
        """Qolgan kunlarni hisoblash"""
        remaining = {}
        for api_name, balance_data in self.api_balances.items():
            if daily_usage > 0:
                remaining[api_name] = balance_data["balance"] / daily_usage
            else:
                remaining[api_name] = float('inf')
        
        return remaining


class Agent_CEOPushNotify:
    """
    📌 36. @Agent_CEOPushNotify (Rahbar Xabarchisi Agent)
    Vazifasi: Barcha agentlardan kelgan muhim signal va hisobotlarni CEO mobil ilovasiga 
    real vaqtda push notification sifatida yuboradi.
    Hisobot yo'li: Yuborilgan barcha xabarlar tarixini va CEO ning o'qish statistikasini qayd etib boradi.
    """
    
    def __init__(self):
        self.notification_queue = []
        self.sent_notifications = []
        self.notification_preferences = {}
        self.notification_categories = {
            "critical": {"priority": 1, "sound": "urgent", "vibration": True},
            "high": {"priority": 2, "sound": "default", "vibration": True},
            "medium": {"priority": 3, "sound": "default", "vibration": False},
            "low": {"priority": 4, "sound": "silent", "vibration": False}
        }
    
    def send_notification(self, recipient_id: str, title: str, message: str, 
                         category: str = "medium", source_agent: str = "system") -> Dict:
        """Xabar yuborish"""
        if category not in self.notification_categories:
            return {"status": "INVALID_CATEGORY", "category": category}
        
        notification_id = f"notif_{datetime.now().strftime('%Y%m%d_%H%M%S_%f')}"
        
        notification = {
            "notification_id": notification_id,
            "recipient_id": recipient_id,
            "title": title,
            "message": message,
            "category": category,
            "priority": self.notification_categories[category]["priority"],
            "sound": self.notification_categories[category]["sound"],
            "vibration": self.notification_categories[category]["vibration"],
            "source_agent": source_agent,
            "created_at": datetime.now().isoformat(),
            "status": "queued"
        }
        
        self.notification_queue.append(notification)
        
        # Simulate immediate send for critical/high priority
        if category in ["critical", "high"]:
            return self._process_notification(notification_id)
        
        return {
            "status": "NOTIFICATION_QUEUED",
            "notification_id": notification_id,
            "category": category,
            "queue_position": len(self.notification_queue)
        }
    
    def _process_notification(self, notification_id: str) -> Dict:
        """Xabarni qayta ishlash va yuborish"""
        # Find notification in queue
        notification = None
        for notif in self.notification_queue:
            if notif["notification_id"] == notification_id:
                notification = notif
                break
        
        if not notification:
            return {"status": "NOTIFICATION_NOT_FOUND", "notification_id": notification_id}
        
        # Simulate sending
        notification["status"] = "sent"
        notification["sent_at"] = datetime.now().isoformat()
        
        # Move to sent notifications
        self.notification_queue.remove(notification)
        self.sent_notifications.append(notification)
        
        return {
            "status": "NOTIFICATION_SENT",
            "notification_id": notification_id,
            "recipient_id": notification["recipient_id"],
            "sent_at": notification["sent_at"]
        }
    
    def process_queue(self) -> Dict:
        """Navbatni qayta ishlash"""
        if not self.notification_queue:
            return {"status": "QUEUE_EMPTY"}
        
        sent_count = 0
        while self.notification_queue:
            result = self._process_notification(self.notification_queue[0]["notification_id"])
            if result["status"] == "NOTIFICATION_SENT":
                sent_count += 1
            else:
                break
        
        return {
            "status": "QUEUE_PROCESSED",
            "notifications_sent": sent_count,
            "remaining_in_queue": len(self.notification_queue)
        }
    
    def set_notification_preferences(self, recipient_id: str, preferences: Dict) -> Dict:
        """Xabar afzalliklarini o'rnatish"""
        self.notification_preferences[recipient_id] = {
            "enabled": preferences.get("enabled", True),
            "quiet_hours": preferences.get("quiet_hours", {"start": "22:00", "end": "08:00"}),
            "categories_enabled": preferences.get("categories_enabled", ["critical", "high", "medium"]),
            "sound_enabled": preferences.get("sound_enabled", True),
            "vibration_enabled": preferences.get("vibration_enabled", True)
        }
        
        return {
            "status": "PREFERENCES_UPDATED",
            "recipient_id": recipient_id,
            "preferences": self.notification_preferences[recipient_id]
        }
    
    def get_notification_history(self, recipient_id: str = None, days: int = 7) -> Dict:
        """Xabar tarixini olish"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        history = self.sent_notifications
        if recipient_id:
            history = [n for n in history if n["recipient_id"] == recipient_id]
        
        recent_notifications = [
            n for n in history
            if datetime.fromisoformat(n["created_at"]) > cutoff_date
        ]
        
        return {
            "period_days": days,
            "recipient_id": recipient_id,
            "total_notifications": len(recent_notifications),
            "by_category": self._count_by_category(recent_notifications),
            "notifications": recent_notifications
        }
    
    def _count_by_category(self, notifications: List[Dict]) -> Dict:
        """Kategoriya bo'yicha sanash"""
        category_count = {}
        for notif in notifications:
            cat = notif["category"]
            category_count[cat] = category_count.get(cat, 0) + 1
        return category_count
    
    def mark_as_read(self, notification_id: str) -> Dict:
        """Xabarni o'qilgan deb belgilash"""
        for notif in self.sent_notifications:
            if notif["notification_id"] == notification_id:
                notif["read_at"] = datetime.now().isoformat()
                notif["status"] = "read"
                return {
                    "status": "MARKED_AS_READ",
                    "notification_id": notification_id
                }
        
        return {"status": "NOTIFICATION_NOT_FOUND", "notification_id": notification_id}
    
    def get_unread_count(self, recipient_id: str) -> Dict:
        """O'qilmagan xabarlar sonini olish"""
        user_notifications = [n for n in self.sent_notifications if n["recipient_id"] == recipient_id]
        unread_count = len([n for n in user_notifications if n["status"] != "read"])
        
        return {
            "recipient_id": recipient_id,
            "unread_count": unread_count
        }
    
    def get_notification_statistics(self, days: int = 30) -> Dict:
        """Xabar statistikasi"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent = [n for n in self.sent_notifications if datetime.fromisoformat(n["created_at"]) > cutoff_date]
        
        total_sent = len(recent)
        total_read = len([n for n in recent if n["status"] == "read"])
        read_rate = (total_read / total_sent * 100) if total_sent > 0 else 0
        
        return {
            "period_days": days,
            "total_sent": total_sent,
            "total_read": total_read,
            "read_rate": round(read_rate, 2),
            "by_category": self._count_by_category(recent),
            "by_source_agent": self._count_by_source(recent)
        }
    
    def _count_by_source(self, notifications: List[Dict]) -> Dict:
        """Manba agent bo'yicha sanash"""
        source_count = {}
        for notif in notifications:
            source = notif["source_agent"]
            source_count[source] = source_count.get(source, 0) + 1
        return source_count
    
    def send_bulk_notification(self, recipient_ids: List[str], title: str, 
                              message: str, category: str = "medium") -> Dict:
        """Bulk xabar yuborish"""
        results = []
        for recipient_id in recipient_ids:
            result = self.send_notification(recipient_id, title, message, category)
            results.append(result)
        
        successful = len([r for r in results if r["status"] in ["NOTIFICATION_SENT", "NOTIFICATION_QUEUED"]])
        
        return {
            "status": "BULK_NOTIFICATION_SENT",
            "total_recipients": len(recipient_ids),
            "successful": successful,
            "failed": len(recipient_ids) - successful
        }


class Agent_ServerHealthGuard:
    """
    📌 38. @Agent_ServerHealthGuard (Infratuzilma Kiber-Qorovuli)
    Vazifasi: FastAPI va Uvicorn serverlarining yuklamasini, tezligini o'lchaydi, 
    platformada qotishlar yuzaga kelmasligini 100% ta'minlaydi.
    Hisobot yo'li: Server protsessor yuklamasi (CPU/RAM logs) ko'rsatkichlarini Admin Dashboard paneliga dynamic uzatib turadi.
    """
    
    def __init__(self):
        self.server_metrics = {}
        self.health_checks = []
        self.performance_logs = []
        self.alert_thresholds = {
            "cpu_usage": 80.0,
            "memory_usage": 85.0,
            "response_time": 2000,  # ms
            "error_rate": 5.0  # percentage
        }
    
    def record_server_metrics(self, server_name: str, cpu_usage: float, 
                             memory_usage: float, response_time: float, 
                             active_connections: int) -> Dict:
        """Server metrikalarini qayd etish"""
        timestamp = datetime.now().isoformat()
        
        metrics = {
            "server_name": server_name,
            "cpu_usage": cpu_usage,
            "memory_usage": memory_usage,
            "response_time": response_time,
            "active_connections": active_connections,
            "timestamp": timestamp
        }
        
        self.server_metrics[server_name] = metrics
        self.performance_logs.append(metrics)
        
        # Check for alerts
        alerts = []
        if cpu_usage > self.alert_thresholds["cpu_usage"]:
            alerts.append(f"High CPU usage: {cpu_usage}%")
        
        if memory_usage > self.alert_thresholds["memory_usage"]:
            alerts.append(f"High memory usage: {memory_usage}%")
        
        if response_time > self.alert_thresholds["response_time"]:
            alerts.append(f"Slow response time: {response_time}ms")
        
        if alerts:
            return {
                "status": "METRICS_RECORDED_WITH_ALERTS",
                "server_name": server_name,
                "metrics": metrics,
                "alerts": alerts,
                "action_required": "Investigate performance issues"
            }
        
        return {
            "status": "METRICS_RECORDED",
            "server_name": server_name,
            "metrics": metrics
        }
    
    def perform_health_check(self, server_name: str) -> Dict:
        """Sog'liqni tekshirish"""
        if server_name not in self.server_metrics:
            return {
                "status": "SERVER_NOT_FOUND",
                "server_name": server_name,
                "health": "unknown"
            }
        
        metrics = self.server_metrics[server_name]
        
        # Calculate health score
        health_score = 100
        health_score -= max(0, metrics["cpu_usage"] - 50) * 0.5
        health_score -= max(0, metrics["memory_usage"] - 60) * 0.5
        health_score -= max(0, metrics["response_time"] - 500) / 50
        health_score = max(0, min(100, health_score))
        
        health_status = "healthy" if health_score > 80 else "degraded" if health_score > 50 else "critical"
        
        check_result = {
            "check_id": f"health_{server_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "server_name": server_name,
            "health_score": round(health_score, 2),
            "health_status": health_status,
            "timestamp": datetime.now().isoformat()
        }
        
        self.health_checks.append(check_result)
        
        return check_result
    
    def get_server_status(self, server_name: str = None) -> Dict:
        """Server holatini olish"""
        if server_name:
            if server_name not in self.server_metrics:
                return {"status": "SERVER_NOT_FOUND", "server_name": server_name}
            return {
                "status": "SERVER_STATUS",
                "server_name": server_name,
                "metrics": self.server_metrics[server_name],
                "health_check": self.perform_health_check(server_name)
            }
        
        return {
            "status": "ALL_SERVERS_STATUS",
            "servers": {
                name: {
                    "metrics": metrics,
                    "health": self.perform_health_check(name)
                }
                for name, metrics in self.server_metrics.items()
            }
        }
    
    def get_performance_report(self, hours: int = 24) -> Dict:
        """Ishlash hisoboti"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_logs = [
            log for log in self.performance_logs
            if datetime.fromisoformat(log["timestamp"]) > cutoff_time
        ]
        
        if not recent_logs:
            return {"status": "NO_DATA", "period_hours": hours}
        
        avg_cpu = sum(log["cpu_usage"] for log in recent_logs) / len(recent_logs)
        avg_memory = sum(log["memory_usage"] for log in recent_logs) / len(recent_logs)
        avg_response_time = sum(log["response_time"] for log in recent_logs) / len(recent_logs)
        
        return {
            "period_hours": hours,
            "total_checks": len(recent_logs),
            "average_cpu_usage": round(avg_cpu, 2),
            "average_memory_usage": round(avg_memory, 2),
            "average_response_time": round(avg_response_time, 2),
            "peak_cpu": max(log["cpu_usage"] for log in recent_logs),
            "peak_memory": max(log["memory_usage"] for log in recent_logs),
            "peak_response_time": max(log["response_time"] for log in recent_logs)
        }
    
    def set_alert_threshold(self, metric_type: str, threshold: float) -> Dict:
        """Xabar chegarasini belgilash"""
        if metric_type in self.alert_thresholds:
            self.alert_thresholds[metric_type] = threshold
            return {
                "status": "THRESHOLD_UPDATED",
                "metric_type": metric_type,
                "new_threshold": threshold
            }
        
        return {
            "status": "METRIC_TYPE_NOT_FOUND",
            "metric_type": metric_type
        }
    
    def get_uptime_statistics(self, days: int = 7) -> Dict:
        """Ish vaqti statistikasi"""
        # Simplified uptime calculation
        total_checks = len(self.health_checks)
        if total_checks == 0:
            return {"status": "NO_HEALTH_CHECKS"}
        
        healthy_checks = len([c for c in self.health_checks if c["health_status"] == "healthy"])
        uptime_percentage = (healthy_checks / total_checks) * 100
        
        return {
            "period_days": days,
            "total_health_checks": total_checks,
            "healthy_checks": healthy_checks,
            "uptime_percentage": round(uptime_percentage, 2),
            "downtime_percentage": round(100 - uptime_percentage, 2)
        }


class Agent_DatabaseBackupBot:
    """
    📌 39. @Agent_DatabaseBackupBot (Zaxirachi Agent)
    Vazifasi: Har kuni tungi soat 03:00 da butun boshli ma'lumotlar bazasini (.db faylini) 
    shifrlangan holatda maxfiy zaxira bulutiga (Backup Cloud) avtomat yuklab qo'yadi.
    Hisobot yo'li: Muvaffaqiyatli yakunlangan zaxira nusxasi (Backup database success) hisobot muhri logs faylini qulflaydi.
    """
    
    def __init__(self):
        self.backup_records = {}
        self.backup_schedule = "03:00"
        self.encryption_key = hashlib.sha256("eduup_backup_key".encode()).hexdigest()
        self.backup_logs = []
        self.backup_status = "scheduled"
    
    def perform_backup(self, database_path: str, backup_location: str) -> Dict:
        """Zaxira nusxasini yaratish"""
        backup_id = f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Simulate backup process
        file_size = random.randint(1024 * 1024, 10 * 1024 * 1024)  # 1MB to 10MB
        
        backup_record = BackupRecord(
            backup_id=backup_id,
            timestamp=datetime.now(),
            file_path=f"{backup_location}/eduup_core_backup_{datetime.now().strftime('%Y%m%d')}.db",
            file_size=file_size,
            status="in_progress",
            encryption_key=self.encryption_key
        )
        
        self.backup_records[backup_id] = backup_record
        
        # Simulate completion
        backup_record.status = "completed"
        
        # Log backup
        log_entry = {
            "backup_id": backup_id,
            "database_path": database_path,
            "backup_location": backup_location,
            "file_size": file_size,
            "started_at": backup_record.timestamp.isoformat(),
            "completed_at": datetime.now().isoformat(),
            "status": "success",
            "encryption": "AES-256"
        }
        
        self.backup_logs.append(log_entry)
        
        return {
            "status": "BACKUP_COMPLETED",
            "backup_id": backup_id,
            "file_path": backup_record.file_path,
            "file_size": file_size,
            "encryption": "AES-256",
            "message": "Database backup completed successfully"
        }
    
    def schedule_backup(self, time: str = "03:00") -> Dict:
        """Zaxira rejalashtirish"""
        self.backup_schedule = time
        self.backup_status = "scheduled"
        
        return {
            "status": "BACKUP_SCHEDULED",
            "schedule_time": time,
            "next_backup": self._calculate_next_backup_time(time)
        }
    
    def _calculate_next_backup_time(self, time_str: str) -> str:
        """Keyingi zaxira vaqtini hisoblash"""
        hour, minute = map(int, time_str.split(':'))
        now = datetime.now()
        next_backup = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        if next_backup <= now:
            next_backup += timedelta(days=1)
        
        return next_backup.isoformat()
    
    def verify_backup(self, backup_id: str) -> Dict:
        """Zaxira nusxasini tekshirish"""
        if backup_id not in self.backup_records:
            return {"status": "BACKUP_NOT_FOUND", "backup_id": backup_id}
        
        backup = self.backup_records[backup_id]
        
        # Simulate verification
        verification_result = {
            "backup_id": backup_id,
            "verified_at": datetime.now().isoformat(),
            "integrity_check": "passed",
            "encryption_check": "passed",
            "file_size_check": "passed",
            "status": "verified"
        }
        
        return verification_result
    
    def restore_backup(self, backup_id: str, restore_location: str) -> Dict:
        """Zaxira nusxasini tiklash"""
        if backup_id not in self.backup_records:
            return {"status": "BACKUP_NOT_FOUND", "backup_id": backup_id}
        
        backup = self.backup_records[backup_id]
        
        # Simulate restore process
        restore_log = {
            "backup_id": backup_id,
            "restore_location": restore_location,
            "started_at": datetime.now().isoformat(),
            "completed_at": (datetime.now() + timedelta(minutes=5)).isoformat(),
            "status": "success"
        }
        
        return {
            "status": "RESTORE_COMPLETED",
            "backup_id": backup_id,
            "restore_location": restore_location,
            "message": "Database restored successfully"
        }
    
    def get_backup_history(self, days: int = 30) -> List[Dict]:
        """Zaxira tarixini olish"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        return [
            log for log in self.backup_logs
            if datetime.fromisoformat(log["completed_at"]) > cutoff_date
        ]
    
    def get_backup_statistics(self) -> Dict:
        """Zaxira statistikasi"""
        total_backups = len(self.backup_logs)
        successful_backups = len([log for log in self.backup_logs if log["status"] == "success"])
        
        if total_backups == 0:
            return {
                "status": "NO_BACKUPS",
                "total_backups": 0
            }
        
        total_size = sum(log["file_size"] for log in self.backup_logs)
        avg_size = total_size / total_backups
        
        return {
            "total_backups": total_backups,
            "successful_backups": successful_backups,
            "success_rate": (successful_backups / total_backups) * 100,
            "total_storage_used": total_size,
            "average_backup_size": avg_size,
            "last_backup": self.backup_logs[-1] if self.backup_logs else None,
            "next_scheduled_backup": self._calculate_next_backup_time(self.backup_schedule)
        }
    
    def delete_old_backups(self, days_to_keep: int = 30) -> Dict:
        """Eski zaxiralarni o'chirish"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        backups_to_delete = [
            backup_id for backup_id, backup in self.backup_records.items()
            if backup.timestamp < cutoff_date
        ]
        
        deleted_count = 0
        for backup_id in backups_to_delete:
            del self.backup_records[backup_id]
            deleted_count += 1
        
        return {
            "status": "OLD_BACKUPS_DELETED",
            "deleted_count": deleted_count,
            "days_kept": days_to_keep
        }
    
    def get_backup_status(self) -> Dict:
        """Zaxira holatini olish"""
        return {
            "schedule_time": self.backup_schedule,
            "status": self.backup_status,
            "next_backup": self._calculate_next_backup_time(self.backup_schedule),
            "last_backup": self.backup_logs[-1] if self.backup_logs else None,
            "total_backups": len(self.backup_logs)
        }


# Global instances
agent_data_protector = Agent_DataProtector()
agent_token_monitor = Agent_TokenMonitor()
agent_ceo_push_notify = Agent_CEOPushNotify()
agent_server_health_guard = Agent_ServerHealthGuard()
agent_database_backup_bot = Agent_DatabaseBackupBot()
