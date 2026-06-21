# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — MIDDLEWARE LAYER
Rate limiting, error handling, request validation, and security middleware.
"""
import time
import json
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from typing import Dict, Optional
from collections import defaultdict
from datetime import datetime, timedelta
import logging
from config import settings

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware to prevent API abuse"""
    
    def __init__(self, app: ASGIApp, requests: int = 100, period: int = 60):
        super().__init__(app)
        self.requests = requests
        self.period = period
        self.requests_dict: Dict[str, list] = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next):
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)
        
        # Get client identifier
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        identifier = f"{client_ip}:{user_agent}"
        
        # Clean old requests
        now = time.time()
        self.requests_dict[identifier] = [
            timestamp for timestamp in self.requests_dict[identifier]
            if now - timestamp < self.period
        ]
        
        # Check rate limit
        if len(self.requests_dict[identifier]) >= self.requests:
            logger.warning(f"Rate limit exceeded for {identifier}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"Too many requests. Maximum {self.requests} requests per {self.period} seconds.",
                    "retry_after": self.period
                }
            )
        
        # Add current request
        self.requests_dict[identifier].append(now)
        
        return await call_next(request)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            logger.error(f"HTTP Exception: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": "HTTP_ERROR",
                    "status_code": e.status_code,
                    "message": e.detail,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except ValueError as e:
            logger.error(f"Validation Error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content={
                    "error": "VALIDATION_ERROR",
                    "message": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
        except Exception as e:
            logger.exception(f"Unhandled Exception: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "error": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred. Please try again later.",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Security headers middleware for enhanced protection"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Request logging middleware for monitoring and debugging"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
        
        response = await call_next(request)
        
        # Calculate duration
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log response
        logger.info(f"Response: {response.status_code} - Processed in {process_time:.4f}s")
        
        return response

class CORSMiddlewareEnhanced(BaseHTTPMiddleware):
    """Enhanced CORS middleware with additional security"""
    
    def __init__(self, app: ASGIApp, allow_origins: list = None):
        super().__init__(app)
        self.allow_origins = allow_origins or ["*"]
    
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        
        response = await call_next(request)
        
        # Check if origin is allowed
        if "*" in self.allow_origins or origin in self.allow_origins:
            response.headers["Access-Control-Allow-Origin"] = origin if origin else "*"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        
        # Handle preflight requests
        if request.method == "OPTIONS":
            response.headers["Access-Control-Max-Age"] = "86400"
        
        return response
