# -*- coding: utf-8 -*-
"""
📋 BACKEND SCHEMAS MODULE
Pydantic schemas, database connections, and session management.
"""
from .database import EduUpDatabase
from .common_schemas import *

__all__ = [
    "EduUpDatabase",
]
