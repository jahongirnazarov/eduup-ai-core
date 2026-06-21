# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — CONFIGURATION MANAGEMENT
Environment-based configuration with validation and security.
"""
import os
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "EduUp Global AI Academy"
    APP_VERSION: str = "2.5.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
    
    # Server
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # Database
    DATABASE_PATH: str = Field(default="eduup_core.db", env="DATABASE_PATH")
    DATABASE_POOL_SIZE: int = Field(default=20, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=10, env="DATABASE_MAX_OVERFLOW")
    
    # Redis
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    REDIS_PASSWORD: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    REDIS_TTL: int = Field(default=3600, env="REDIS_TTL")  # 1 hour default
    
    # Security
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production", env="SECRET_KEY")
    ALGORITHM: str = Field(default="HS256", env="ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    ADMIN_PASSWORD: str = Field(default="123456", env="ADMIN_PASSWORD")
    
    # Encryption
    ENCRYPTION_KEY_FILE: str = Field(default="eduup_encryption.key", env="ENCRYPTION_KEY_FILE")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_PERIOD: int = Field(default=60, env="RATE_LIMIT_PERIOD")  # seconds
    
    # CORS
    CORS_ORIGINS: str = Field(default="*", env="CORS_ORIGINS")
    
    # Email
    SMTP_HOST: Optional[str] = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: Optional[str] = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    EMAIL_FROM: Optional[str] = Field(default=None, env="EMAIL_FROM")
    
    # SMS
    SMS_API_KEY: Optional[str] = Field(default=None, env="SMS_API_KEY")
    SMS_SENDER_ID: Optional[str] = Field(default=None, env="SMS_SENDER_ID")
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = Field(default=False, env="PROMETHEUS_ENABLED")
    PROMETHEUS_PORT: int = Field(default=9090, env="PROMETHEUS_PORT")
    
    # Olympiad
    OLYMPIAD_DURATION_SECONDS: int = Field(default=2400, env="OLYMPIAD_DURATION_SECONDS")  # 40 minutes
    OLYMPIAD_WARNING_SECONDS: int = Field(default=300, env="OLYMPIAD_WARNING_SECONDS")  # 5 minutes
    
    # Pricing
    BASE_PRICE_UZS: float = Field(default=149000.0, env="BASE_PRICE_UZS")
    BASE_PRICE_USD: float = Field(default=15.0, env="BASE_PRICE_USD")
    
    # AI API Keys (Multiple for rotation and load balancing)
    GROQ_API_KEYS: str = Field(default="")
    OPENAI_API_KEYS: str = Field(default="")
    GOOGLE_API_KEYS: str = Field(default="")
    TELEGRAM_BOT_TOKENS: str = Field(default="")
    
    @property
    def groq_api_keys_list(self) -> list:
        """Parse GROQ_API_KEYS into list"""
        if isinstance(self.GROQ_API_KEYS, str):
            if self.GROQ_API_KEYS.strip() == "":
                return []
            return [key.strip() for key in self.GROQ_API_KEYS.split(",")]
        return []
    
    @property
    def openai_api_keys_list(self) -> list:
        """Parse OPENAI_API_KEYS into list"""
        if isinstance(self.OPENAI_API_KEYS, str):
            if self.OPENAI_API_KEYS.strip() == "":
                return []
            return [key.strip() for key in self.OPENAI_API_KEYS.split(",")]
        return []
    
    @property
    def google_api_keys_list(self) -> list:
        """Parse GOOGLE_API_KEYS into list"""
        if isinstance(self.GOOGLE_API_KEYS, str):
            if self.GOOGLE_API_KEYS.strip() == "":
                return []
            return [key.strip() for key in self.GOOGLE_API_KEYS.split(",")]
        return []
    
    @property
    def telegram_bot_tokens_list(self) -> list:
        """Parse TELEGRAM_BOT_TOKENS into list"""
        if isinstance(self.TELEGRAM_BOT_TOKENS, str):
            if self.TELEGRAM_BOT_TOKENS.strip() == "":
                return []
            return [token.strip() for token in self.TELEGRAM_BOT_TOKENS.split(",")]
        return []
    
    @property
    def cors_origins_list(self) -> list:
        """Parse CORS_ORIGINS into list"""
        if isinstance(self.CORS_ORIGINS, str):
            if self.CORS_ORIGINS.strip() == "":
                return ["*"]
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
        return self.CORS_ORIGINS or ["*"]
    
    @field_validator("SECRET_KEY")
    @classmethod
    def validate_secret_key(cls, v, info):
        # Only validate in production mode
        env = info.data.get("ENVIRONMENT", "development")
        if env == "production" and v == "your-secret-key-change-in-production":
            raise ValueError("SECRET_KEY must be changed in production")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields from .env file

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()
