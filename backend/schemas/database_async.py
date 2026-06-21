# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — ASYNC DATABASE LAYER
High-performance async database operations with connection pooling.
"""
import aiosqlite
import sqlite3
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import logging
from config import settings

logger = logging.getLogger(__name__)

class AsyncEduUpDatabase:
    """Async database manager with connection pooling"""
    
    def __init__(self, db_path: str = None):
        self.db_path = db_path or settings.DATABASE_PATH
        self._pool_size = settings.DATABASE_POOL_SIZE
        self._connections: List[aiosqlite.Connection] = []
        self._connection_index = 0
    
    async def initialize(self):
        """Initialize database connection pool"""
        logger.info(f"Initializing async database pool with {self._pool_size} connections")
        for _ in range(self._pool_size):
            conn = await aiosqlite.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            await self._create_tables(conn)
            self._connections.append(conn)
        logger.info("✅ Async database pool initialized successfully")
    
    @asynccontextmanager
    async def get_connection(self):
        """Get connection from pool (round-robin)"""
        conn = self._connections[self._connection_index]
        self._connection_index = (self._connection_index + 1) % len(self._connections)
        try:
            yield conn
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
    
    async def _create_tables(self, conn: aiosqlite.Connection):
        """Create all necessary tables"""
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS student_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                telegram_id TEXT UNIQUE NOT NULL,
                full_name TEXT NOT NULL,
                phone_number TEXT,
                exam_type TEXT DEFAULT 'GENERAL',
                is_premium INTEGER DEFAULT 0,
                premium_expiry_date TIMESTAMP,
                daily_question_count INTEGER DEFAULT 0,
                daily_question_date DATE DEFAULT CURRENT_DATE,
                free_tests_remaining INTEGER DEFAULT 5,
                olympiad_rank INTEGER,
                coupon_status TEXT DEFAULT 'INACTIVE',
                coupon_expiry_date TIMESTAMP,
                educoins_balance INTEGER DEFAULT 0,
                clan_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS financial_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'UZS',
                api_reserve REAL NOT NULL,
                net_profit REAL NOT NULL,
                payment_method TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES student_skills(id)
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS olympiad_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                subject TEXT NOT NULL,
                tier TEXT NOT NULL,
                score REAL NOT NULL,
                rank INTEGER,
                questions_attempted INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                completion_time_seconds INTEGER,
                exam_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES student_skills(id)
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS clan_league (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clan_name TEXT UNIQUE NOT NULL,
                clan_leader_id INTEGER NOT NULL,
                total_members INTEGER DEFAULT 1,
                total_score REAL DEFAULT 0,
                clan_rank INTEGER,
                discount_percentage INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (clan_leader_id) REFERENCES student_skills(id)
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS system_versions_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version TEXT NOT NULL,
                update_reason TEXT,
                code_mutation_log TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS ai_employee_audit (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                employee_name TEXT NOT NULL,
                context_guardrail_violations INTEGER DEFAULT 0,
                api_token_efficiency REAL DEFAULT 100.0,
                user_focus_score REAL DEFAULT 100.0,
                audit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                audit_status TEXT DEFAULT 'PASSED'
            )
        """)
        
        # Create indexes for performance
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_student_telegram ON student_skills(telegram_id)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_olympiad_subject ON olympiad_results(subject)")
        await conn.execute("CREATE INDEX IF NOT EXISTS idx_financial_student ON financial_ledger(student_id)")
        
        await conn.commit()
    
    async def register_student(self, telegram_id: str, full_name: str, 
                             phone_number: str = None, exam_type: str = "GENERAL") -> int:
        """Register a new student"""
        async with self.get_connection() as conn:
            try:
                cursor = await conn.execute("""
                    INSERT INTO student_skills (telegram_id, full_name, phone_number, exam_type)
                    VALUES (?, ?, ?, ?)
                """, (telegram_id, full_name, phone_number, exam_type))
                await conn.commit()
                return cursor.lastrowid
            except sqlite3.IntegrityError:
                cursor = await conn.execute(
                    "SELECT id FROM student_skills WHERE telegram_id = ?", 
                    (telegram_id,)
                )
                result = await cursor.fetchone()
                return result[0] if result else -1
    
    async def get_student_by_id(self, student_id: int) -> Optional[Dict]:
        """Get student by ID"""
        async with self.get_connection() as conn:
            cursor = await conn.execute(
                "SELECT * FROM student_skills WHERE id = ?", 
                (student_id,)
            )
            result = await cursor.fetchone()
            return dict(result) if result else None
    
    async def update_student_premium(self, student_id: int, is_premium: bool = True):
        """Update student premium status"""
        async with self.get_connection() as conn:
            expiry = datetime.now() + timedelta(days=30) if is_premium else None
            await conn.execute("""
                UPDATE student_skills 
                SET is_premium = ?, premium_expiry_date = ?
                WHERE id = ?
            """, (1 if is_premium else 0, expiry, student_id))
            await conn.commit()
    
    async def record_olympiad_result(self, student_id: int, subject: str, tier: str,
                                     score: float, rank: int, questions_attempted: int,
                                     correct_answers: int, completion_time: int) -> int:
        """Record olympiad results"""
        async with self.get_connection() as conn:
            cursor = await conn.execute("""
                INSERT INTO olympiad_results 
                (student_id, subject, tier, score, rank, questions_attempted, 
                 correct_answers, completion_time_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (student_id, subject, tier, score, rank, questions_attempted,
                  correct_answers, completion_time))
            await conn.commit()
            return cursor.lastrowid
    
    async def get_student_leaderboard(self, subject: str = None, limit: int = 100) -> List[Dict]:
        """Get student leaderboard"""
        async with self.get_connection() as conn:
            if subject:
                cursor = await conn.execute("""
                    SELECT ss.full_name, or.score, or.rank, or.subject
                    FROM olympiad_results or
                    JOIN student_skills ss ON or.student_id = ss.id
                    WHERE or.subject = ?
                    ORDER BY or.score DESC
                    LIMIT ?
                """, (subject, limit))
            else:
                cursor = await conn.execute("""
                    SELECT ss.full_name, or.score, or.rank, or.subject
                    FROM olympiad_results or
                    JOIN student_skills ss ON or.student_id = ss.id
                    ORDER BY or.score DESC
                    LIMIT ?
                """, (limit,))
            
            results = await cursor.fetchall()
            return [dict(row) for row in results]
    
    async def get_total_profit(self) -> float:
        """Get total net profit"""
        async with self.get_connection() as conn:
            cursor = await conn.execute("SELECT SUM(net_profit) FROM financial_ledger")
            result = await cursor.fetchone()
            return result[0] if result and result[0] else 0.0
    
    async def get_premium_student_count(self) -> int:
        """Get premium student count"""
        async with self.get_connection() as conn:
            cursor = await conn.execute("""
                SELECT COUNT(*) FROM student_skills 
                WHERE is_premium = 1 AND 
                (premium_expiry_date IS NULL OR premium_expiry_date > datetime('now'))
            """)
            result = await cursor.fetchone()
            return result[0] if result else 0
    
    async def close(self):
        """Close all database connections"""
        for conn in self._connections:
            await conn.close()
        logger.info("✅ All database connections closed")

# Global async database instance
async_db = AsyncEduUpDatabase()
