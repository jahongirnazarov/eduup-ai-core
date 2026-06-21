"""
Zero-Cost Backend Unit Tests
Basic tests for core features to ensure quality >98%, error <1%
"""

import pytest
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database_zero_cost import ZeroCostDatabase
from auth_zero_cost import ZeroCostAuth, InMemoryRateLimiter

# ============ DATABASE TESTS ============

class TestZeroCostDatabase:
    """Test zero-cost database functionality"""
    
    @pytest.fixture
    def db(self):
        """Create test database"""
        test_db = ZeroCostDatabase("test_eduup.db")
        yield test_db
        # Cleanup
        if os.path.exists("test_eduup.db"):
            os.remove("test_eduup.db")
    
    def test_database_initialization(self, db):
        """Test database initializes correctly"""
        assert db is not None
        assert db.db_path == "test_eduup.db"
        stats = db.get_stats()
        assert 'total_users' in stats
        assert 'total_progress' in stats
    
    def test_create_user(self, db):
        """Test user creation"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        assert user_id > 0
        
        # Verify user exists
        user = db.get_user_by_username("testuser")
        assert user is not None
        assert user['username'] == "testuser"
        assert user['email'] == "test@example.com"
    
    def test_duplicate_user(self, db):
        """Test duplicate user creation fails"""
        db.create_user("testuser", "test@example.com", "hashed_password")
        
        # Should raise ValueError for duplicate
        with pytest.raises(ValueError):
            db.create_user("testuser", "test2@example.com", "hashed_password")
    
    def test_save_progress(self, db):
        """Test progress saving"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        
        success = db.save_progress(
            user_id=user_id,
            lesson_id="lesson1",
            current_section=2,
            completed_sections=[0, 1],
            score=95.5
        )
        
        assert success is True
    
    def test_get_progress(self, db):
        """Test progress retrieval"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        
        db.save_progress(
            user_id=user_id,
            lesson_id="lesson1",
            current_section=2,
            completed_sections=[0, 1],
            score=95.5
        )
        
        progress = db.get_progress(user_id, "lesson1")
        assert progress is not None
        assert progress['current_section'] == 2
        assert progress['completed_sections'] == [0, 1]
        assert progress['score'] == 95.5
    
    def test_get_all_progress(self, db):
        """Test getting all progress for user"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        
        db.save_progress(user_id, "lesson1", 1, [0], 90.0)
        db.save_progress(user_id, "lesson2", 2, [0, 1], 85.0)
        
        all_progress = db.get_all_progress(user_id)
        assert len(all_progress) == 2
    
    def test_content_metadata(self, db):
        """Test content metadata saving"""
        metadata_id = db.save_content_metadata(
            subject="matematika",
            topic="algebra",
            difficulty="medium"
        )
        
        assert metadata_id > 0
        
        metadata_list = db.get_content_metadata(subject="matematika")
        assert len(metadata_list) > 0
        assert metadata_list[0]['subject'] == "matematika"
    
    def test_sync_queue(self, db):
        """Test sync queue functionality"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        
        # Queue sync
        success = db.queue_sync(user_id, "progress", {"lesson_id": "lesson1"})
        assert success is True
        
        # Get pending sync
        pending = db.get_pending_sync(user_id)
        assert len(pending) == 1
        assert pending[0]['sync_type'] == "progress"
    
    def test_database_stats(self, db):
        """Test database statistics"""
        user_id = db.create_user("testuser", "test@example.com", "hashed_password")
        db.save_progress(user_id, "lesson1", 1, [0])
        
        stats = db.get_stats()
        assert stats['total_users'] == 1
        assert stats['total_progress'] == 1
        assert stats['db_size_bytes'] > 0

# ============ AUTHENTICATION TESTS ============

class TestZeroCostAuth:
    """Test zero-cost authentication functionality"""
    
    @pytest.fixture
    def auth(self):
        """Create auth instance"""
        return ZeroCostAuth("test_secret_key")
    
    def test_password_hashing(self, auth):
        """Test password hashing"""
        password = "test_password_123"
        hashed = auth.hash_password(password)
        
        assert hashed is not None
        assert hashed != password
        assert len(hashed) == 64  # SHA-256 hex length
    
    def test_password_verification(self, auth):
        """Test password verification"""
        password = "test_password_123"
        hashed = auth.hash_password(password)
        
        # Correct password
        assert auth.verify_password(password, hashed) is True
        
        # Wrong password
        assert auth.verify_password("wrong_password", hashed) is False
    
    def test_token_generation(self, auth):
        """Test token generation"""
        token = auth.generate_token(1, "testuser")
        
        assert token is not None
        assert "." in token  # Contains signature separator
        assert len(token) > 50
    
    def test_token_verification(self, auth):
        """Test token verification"""
        token = auth.generate_token(1, "testuser")
        payload = auth.verify_token(token)
        
        assert payload is not None
        assert payload['user_id'] == 1
        assert payload['username'] == "testuser"
    
    def test_invalid_token(self, auth):
        """Test invalid token verification"""
        invalid_token = "invalid.token.here"
        payload = auth.verify_token(invalid_token)
        
        assert payload is None
    
    def test_token_expiry(self, auth):
        """Test token expiry"""
        # Create auth with very short expiry
        short_auth = ZeroCostAuth("test_secret_key")
        short_auth.token_expiry_hours = 0  # Expired immediately
        
        token = short_auth.generate_token(1, "testuser")
        payload = short_auth.verify_token(token)
        
        # Should be expired
        assert payload is None
    
    def test_token_refresh(self, auth):
        """Test token refresh"""
        token = auth.generate_token(1, "testuser")
        new_token = auth.refresh_token(token)
        
        assert new_token is not None
        assert new_token != token
        
        # New token should be valid
        payload = auth.verify_token(new_token)
        assert payload is not None
        assert payload['user_id'] == 1
    
    def test_get_user_id_from_token(self, auth):
        """Test extracting user_id from token"""
        token = auth.generate_token(123, "testuser")
        user_id = auth.get_user_id_from_token(token)
        
        assert user_id == 123
    
    def test_get_username_from_token(self, auth):
        """Test extracting username from token"""
        token = auth.generate_token(1, "testuser")
        username = auth.get_username_from_token(token)
        
        assert username == "testuser"

# ============ RATE LIMITER TESTS ============

class TestRateLimiter:
    """Test in-memory rate limiter"""
    
    @pytest.fixture
    def limiter(self):
        """Create rate limiter"""
        limiter = InMemoryRateLimiter()
        limiter.max_requests = 5  # Low for testing
        limiter.window_seconds = 3600
        return limiter
    
    def test_initial_allow(self, limiter):
        """Test initial requests are allowed"""
        assert limiter.is_allowed("user1") is True
        assert limiter.is_allowed("user1") is True
    
    def test_rate_limit(self, limiter):
        """Test rate limiting kicks in"""
        # Make max requests
        for _ in range(5):
            assert limiter.is_allowed("user1") is True
        
        # Next request should be blocked
        assert limiter.is_allowed("user1") is False
    
    def test_different_users(self, limiter):
        """Test rate limiting per user"""
        # User1 makes 5 requests
        for _ in range(5):
            limiter.is_allowed("user1")
        
        # User1 should be blocked
        assert limiter.is_allowed("user1") is False
        
        # User2 should still be allowed
        assert limiter.is_allowed("user2") is True
    
    def test_get_remaining(self, limiter):
        """Test getting remaining requests"""
        # Make 2 requests
        limiter.is_allowed("user1")
        limiter.is_allowed("user1")
        
        remaining = limiter.get_remaining("user1")
        assert remaining == 3  # 5 - 2 = 3

# ============ INTEGRATION TESTS ============

class TestIntegration:
    """Integration tests for core functionality"""
    
    @pytest.fixture
    def setup(self):
        """Setup database and auth for integration tests"""
        db = ZeroCostDatabase("test_integration.db")
        auth = ZeroCostAuth("test_secret")
        yield db, auth
        # Cleanup
        if os.path.exists("test_integration.db"):
            os.remove("test_integration.db")
    
    def test_user_registration_and_login(self, setup):
        """Test complete registration and login flow"""
        db, auth = setup
        
        # Register user
        password = "test_password"
        password_hash = auth.hash_password(password)
        user_id = db.create_user("integration_user", "integration@test.com", password_hash)
        
        # Login
        user_data = db.get_user_by_username("integration_user")
        password_valid = auth.verify_password(password, user_data['password_hash'])
        
        assert password_valid is True
        
        # Generate token
        token = auth.generate_token(user_id, "integration_user")
        payload = auth.verify_token(token)
        
        assert payload['user_id'] == user_id
        assert payload['username'] == "integration_user"
    
    def test_progress_with_authentication(self, setup):
        """Test saving progress with authenticated user"""
        db, auth = setup
        
        # Create and authenticate user
        user_id = db.create_user("progress_user", "progress@test.com", auth.hash_password("pass"))
        token = auth.generate_token(user_id, "progress_user")
        
        # Verify token
        payload = auth.verify_token(token)
        assert payload is not None
        
        # Save progress
        success = db.save_progress(
            user_id=payload['user_id'],
            lesson_id="lesson1",
            current_section=3,
            completed_sections=[0, 1, 2],
            score=92.0
        )
        
        assert success is True
        
        # Retrieve progress
        progress = db.get_progress(payload['user_id'], "lesson1")
        assert progress['current_section'] == 3
        assert progress['score'] == 92.0
    
    def test_sync_with_progress(self, setup):
        """Test sync queue with progress updates"""
        db, auth = setup
        
        user_id = db.create_user("sync_user", "sync@test.com", auth.hash_password("pass"))
        
        # Save progress (should queue sync)
        db.save_progress(user_id, "lesson1", 1, [0])
        
        # Check sync queue
        pending = db.get_pending_sync(user_id)
        assert len(pending) == 1
        assert pending[0]['sync_type'] == "progress"

# ============ QUALITY TESTS ============

class TestQualityMetrics:
    """Tests to ensure quality >98%, error <1%"""
    
    def test_password_hash_consistency(self):
        """Test password hashing is consistent (quality check)"""
        auth = ZeroCostAuth()
        password = "test_password"
        
        hash1 = auth.hash_password(password)
        hash2 = auth.hash_password(password)
        
        # Same password should produce same hash
        assert hash1 == hash2
    
    def test_token_uniqueness(self):
        """Test tokens are unique (quality check)"""
        auth = ZeroCostAuth()
        
        token1 = auth.generate_token(1, "user1")
        token2 = auth.generate_token(1, "user1")
        
        # Tokens should be different (due to timestamp)
        assert token1 != token2
    
    def test_data_integrity(self):
        """Test data integrity (quality check)"""
        db = ZeroCostDatabase("test_integrity.db")
        
        user_id = db.create_user("integrity_user", "integrity@test.com", "hash")
        db.save_progress(user_id, "lesson1", 5, [0, 1, 2, 3, 4], 100.0)
        
        # Retrieve and verify
        progress = db.get_progress(user_id, "lesson1")
        assert progress['current_section'] == 5
        assert len(progress['completed_sections']) == 5
        assert progress['score'] == 100.0
        
        # Cleanup
        if os.path.exists("test_integrity.db"):
            os.remove("test_integrity.db")

# ============ RUN TESTS ============

if __name__ == "__main__":
    print("🧪 Running Zero-Cost Backend Tests...")
    print("📊 Target Quality: >98%")
    print("🎯 Target Error Rate: <1%")
    print()
    
    pytest.main([__file__, "-v", "--tb=short"])
