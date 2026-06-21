"""
Zero-Cost Database Implementation
Uses SQLite (file-based, no server cost) + minimal sync
Keeps costs near zero while providing data persistence
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import os

class ZeroCostDatabase:
    """
    SQLite-based database with zero server cost
    Data stored locally, minimal sync to server
    """
    
    def __init__(self, db_path: str = "eduup_zero_cost.db"):
        self.db_path = db_path
        self.conn = None
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Progress table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                lesson_id TEXT NOT NULL,
                current_section INTEGER DEFAULT 0,
                completed_sections TEXT,  -- JSON array
                score REAL,
                completed_at TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                UNIQUE(user_id, lesson_id)
            )
        """)
        
        # Content metadata table (minimal storage)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_metadata (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                subject TEXT NOT NULL,
                topic TEXT NOT NULL,
                difficulty TEXT NOT NULL,
                language TEXT DEFAULT 'uz',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Sync queue table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                sync_type TEXT NOT NULL,
                data TEXT NOT NULL,  -- JSON
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                synced BOOLEAN DEFAULT FALSE
            )
        """)
        
        # Create indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sync_queue_synced ON sync_queue(synced)")
        
        conn.commit()
        print("[OK] Zero-cost database initialized")
    
    # User operations
    def create_user(self, username: str, email: str, password_hash: str) -> int:
        """Create new user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, password_hash)
            )
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError:
            raise ValueError("Username or email already exists")
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """Get user by username"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Get user by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None
    
    # Progress operations
    def save_progress(self, user_id: int, lesson_id: str, current_section: int, 
                     completed_sections: List[int], score: Optional[float] = None,
                     completed_at: Optional[str] = None) -> bool:
        """Save user progress"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        completed_sections_json = json.dumps(completed_sections)
        
        try:
            cursor.execute("""
                INSERT OR REPLACE INTO progress 
                (user_id, lesson_id, current_section, completed_sections, score, completed_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (user_id, lesson_id, current_section, completed_sections_json, score, completed_at))
            
            conn.commit()
            
            # Queue for sync
            self.queue_sync(user_id, "progress", {
                "lesson_id": lesson_id,
                "current_section": current_section,
                "completed_sections": completed_sections,
                "score": score,
                "completed_at": completed_at
            })
            
            return True
        except Exception as e:
            print(f"Error saving progress: {e}")
            return False
    
    def get_progress(self, user_id: int, lesson_id: str) -> Optional[Dict]:
        """Get user progress for specific lesson"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?",
            (user_id, lesson_id)
        )
        row = cursor.fetchone()
        
        if row:
            progress = dict(row)
            progress['completed_sections'] = json.loads(progress['completed_sections'])
            return progress
        return None
    
    def get_all_progress(self, user_id: int) -> List[Dict]:
        """Get all progress for user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM progress WHERE user_id = ?", (user_id,))
        rows = cursor.fetchall()
        
        progress_list = []
        for row in rows:
            progress = dict(row)
            progress['completed_sections'] = json.loads(progress['completed_sections'])
            progress_list.append(progress)
        
        return progress_list
    
    # Content metadata operations
    def save_content_metadata(self, subject: str, topic: str, difficulty: str, 
                             language: str = 'uz') -> int:
        """Save content metadata (minimal storage)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "INSERT INTO content_metadata (subject, topic, difficulty, language) VALUES (?, ?, ?, ?)",
            (subject, topic, difficulty, language)
        )
        conn.commit()
        
        return cursor.lastrowid
    
    def get_content_metadata(self, subject: str = None, difficulty: str = None) -> List[Dict]:
        """Get content metadata"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = "SELECT * FROM content_metadata"
        params = []
        
        if subject or difficulty:
            conditions = []
            if subject:
                conditions.append("subject = ?")
                params.append(subject)
            if difficulty:
                conditions.append("difficulty = ?")
                params.append(difficulty)
            
            query += " WHERE " + " AND ".join(conditions)
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
    
    # Sync operations
    def queue_sync(self, user_id: int, sync_type: str, data: Dict) -> bool:
        """Queue item for sync"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "INSERT INTO sync_queue (user_id, sync_type, data) VALUES (?, ?, ?)",
                (user_id, sync_type, json.dumps(data))
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error queuing sync: {e}")
            return False
    
    def get_pending_sync(self, user_id: int) -> List[Dict]:
        """Get pending sync items for user"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT * FROM sync_queue WHERE user_id = ? AND synced = FALSE ORDER BY timestamp",
            (user_id,)
        )
        rows = cursor.fetchall()
        
        sync_items = []
        for row in rows:
            item = dict(row)
            item['data'] = json.loads(item['data'])
            sync_items.append(item)
        
        return sync_items
    
    def mark_synced(self, sync_id: int) -> bool:
        """Mark sync item as synced"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("UPDATE sync_queue SET synced = TRUE WHERE id = ?", (sync_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"Error marking synced: {e}")
            return False
    
    def update_user_sync_time(self, user_id: int) -> bool:
        """Update user's last sync time"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "UPDATE users SET last_sync = CURRENT_TIMESTAMP WHERE id = ?",
                (user_id,)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"Error updating sync time: {e}")
            return False
    
    # Statistics
    def get_stats(self) -> Dict:
        """Get database statistics"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        stats = {}
        
        # User count
        cursor.execute("SELECT COUNT(*) FROM users")
        stats['total_users'] = cursor.fetchone()[0]
        
        # Progress count
        cursor.execute("SELECT COUNT(*) FROM progress")
        stats['total_progress'] = cursor.fetchone()[0]
        
        # Content metadata count
        cursor.execute("SELECT COUNT(*) FROM content_metadata")
        stats['total_content'] = cursor.fetchone()[0]
        
        # Pending sync count
        cursor.execute("SELECT COUNT(*) FROM sync_queue WHERE synced = FALSE")
        stats['pending_sync'] = cursor.fetchone()[0]
        
        # Database size
        stats['db_size_bytes'] = os.path.getsize(self.db_path)
        stats['db_size_mb'] = stats['db_size_bytes'] / (1024 * 1024)
        
        return stats
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None

# Singleton instance
_db_instance = None

def get_database(db_path: str = "eduup_zero_cost.db") -> ZeroCostDatabase:
    """Get database instance (singleton)"""
    global _db_instance
    if _db_instance is None:
        _db_instance = ZeroCostDatabase(db_path)
    return _db_instance
