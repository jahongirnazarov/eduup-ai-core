# -*- coding: utf-8 -*-
"""
📋 COMMON PYDANTIC SCHEMAS
Shared data models for the entire application.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class StudentBase(BaseModel):
    """Base student schema"""
    full_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., pattern=r'^\+?[0-9]{9,15}$')
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    age: Optional[int] = Field(None, ge=5, le=99)


class StudentCreate(StudentBase):
    """Schema for creating a new student"""
    password: str = Field(..., min_length=6)


class StudentResponse(StudentBase):
    """Schema for student response"""
    student_id: str
    created_at: datetime
    subscription_status: str = "active"
    
    class Config:
        from_attributes = True


class PaymentRequest(BaseModel):
    """Schema for payment requests"""
    amount: float = Field(..., gt=0)
    currency: str = Field(default="UZS")
    payment_method: str = Field(..., pattern=r'^(UZCARD|HUMO|VISA|MASTERCARD|UZUM)$')
    description: Optional[str] = None


class PaymentResponse(BaseModel):
    """Schema for payment responses"""
    payment_id: str
    status: str
    amount: float
    currency: str
    transaction_id: Optional[str] = None
    created_at: datetime


class AIQueryRequest(BaseModel):
    """Schema for AI query requests"""
    query: str = Field(..., min_length=1, max_length=5000)
    context: Optional[Dict[str, Any]] = None
    employee_id: Optional[str] = None


class AIQueryResponse(BaseModel):
    """Schema for AI query responses"""
    response: str
    employee_id: str
    confidence: float
    timestamp: datetime


class OlympiadSession(BaseModel):
    """Schema for Olympiad WebSocket sessions"""
    session_id: str
    student_id: str
    subject: str
    start_time: datetime
    duration_seconds: int = 2400  # 40 minutes
    questions: List[Dict[str, Any]] = []
