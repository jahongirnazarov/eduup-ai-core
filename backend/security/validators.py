# -*- coding: utf-8 -*-
"""
🌌 EDUUP GLOBAL EXAM ACADEMY — INPUT VALIDATION LAYER
Comprehensive Pydantic validators for all API inputs.
"""
from pydantic import BaseModel, Field, validator, EmailStr, constr
from typing import Optional, List
from datetime import datetime
import re

class StudentRegistrationValidator(BaseModel):
    """Enhanced student registration validation"""
    telegram_id: str = Field(..., min_length=5, max_length=50, description="Telegram unique ID")
    full_name: str = Field(..., min_length=2, max_length=100, description="Student full name")
    phone_number: Optional[str] = Field(None, pattern=r'^\+?[0-9]{10,15}$', description="Phone number with country code")
    exam_type: str = Field(default="GENERAL", regex="^(GENERAL|SAT|IELTS|USMLE|ACCA|DTM|TOPIK|GRE|GMAT)$")
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if not re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', v):
            raise ValueError('Full name must contain only letters, spaces, and hyphens')
        return v.strip()
    
    @validator('telegram_id')
    def validate_telegram_id(cls, v):
        if not v.isdigit():
            raise ValueError('Telegram ID must be numeric')
        return v

class OlympiadAnswerValidator(BaseModel):
    """Enhanced olympiad answer validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    question_id: int = Field(..., gt=0, description="Question ID")
    answer: str = Field(..., min_length=1, max_length=1000, description="Student answer")
    subject: str = Field(..., min_length=2, max_length=50, description="Subject name")
    
    @validator('answer')
    def validate_answer(cls, v):
        return v.strip()

class PremiumPaymentValidator(BaseModel):
    """Enhanced payment validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    ip_country: str = Field(default="UZ", min_length=2, max_length=2, description="Country code (ISO 3166-1 alpha-2)")
    payment_method: str = Field(default="CLICK", regex="^(CLICK|PAYME|STRIPE|PAYPAL)$")
    
    @validator('ip_country')
    def validate_country_code(cls, v):
        return v.upper()

class MentalHealthCheckValidator(BaseModel):
    """Enhanced mental health check validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    focus_score: float = Field(..., ge=0.0, le=100.0, description="Focus score (0-100)")
    session_duration_minutes: int = Field(..., gt=0, le=180, description="Session duration in minutes (max 3 hours)")
    subject: str = Field(..., min_length=2, max_length=50, description="Subject name")

class AIQueryValidator(BaseModel):
    """Enhanced AI query validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    subject: str = Field(..., min_length=2, max_length=50, description="Subject name")
    query: str = Field(..., min_length=10, max_length=2000, description="Student question")
    exam_type: str = Field(default="GENERAL", regex="^(GENERAL|SAT|IELTS|USMLE|ACCA|DTM|TOPIK|GRE|GMAT)$")
    
    @validator('query')
    def validate_query(cls, v):
        # Remove excessive whitespace
        query = ' '.join(v.split())
        if len(query) < 10:
            raise ValueError('Query must be at least 10 characters long')
        return query

class OlympiadStartValidator(BaseModel):
    """Enhanced olympiad start validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    subject: str = Field(..., min_length=2, max_length=50, description="Subject name")
    exam_type: str = Field(default="GENERAL", regex="^(GENERAL|SAT|IELTS|USMLE|ACCA|DTM|TOPIK|GRE|GMAT)$")
    tier: str = Field(default="REGIONAL", regex="^(LOCAL|REGIONAL|GLOBAL)$")

class ClanCreateValidator(BaseModel):
    """Enhanced clan creation validation"""
    clan_name: str = Field(..., min_length=3, max_length=50, description="Clan name")
    leader_id: int = Field(..., gt=0, description="Leader student ID")
    
    @validator('clan_name')
    def validate_clan_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\-_]+$', v):
            raise ValueError('Clan name must contain only letters, numbers, spaces, hyphens, and underscores')
        return v.strip()

class ClanJoinValidator(BaseModel):
    """Enhanced clan join validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    clan_id: int = Field(..., gt=0, description="Clan ID")

class EduCoinsValidator(BaseModel):
    """Enhanced EduCoins validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    amount: int = Field(..., gt=0, le=10000, description="Amount to add (max 10000)")

class LoginValidator(BaseModel):
    """Enhanced login validation"""
    telegram_id: str = Field(..., min_length=5, max_length=50, description="Telegram ID")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    
    @validator('password')
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class EmailNotificationValidator(BaseModel):
    """Enhanced email notification validation"""
    to_email: EmailStr = Field(..., description="Recipient email address")
    subject: str = Field(..., min_length=5, max_length=200, description="Email subject")
    template_name: str = Field(..., description="Email template name")
    template_data: dict = Field(default_factory=dict, description="Template variables")

class SMSNotificationValidator(BaseModel):
    """Enhanced SMS notification validation"""
    phone_number: str = Field(..., pattern=r'^\+?[0-9]{10,15}$', description="Phone number")
    message: str = Field(..., min_length=1, max_length=160, description="SMS message")

class ReportGenerationValidator(BaseModel):
    """Enhanced report generation validation"""
    student_id: int = Field(..., gt=0, description="Student ID")
    report_type: str = Field(..., regex="^(PDF|VIDEO|VOICE|CERTIFICATE)$")
    month: Optional[int] = Field(None, ge=1, le=12, description="Month (for monthly reports)")
    year: Optional[int] = Field(None, ge=2020, le=2030, description="Year (for monthly reports)")
