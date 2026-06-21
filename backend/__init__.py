# -*- coding: utf-8 -*-
"""
🌌 BACKEND MODULE
The backbone and AI services for EduUp Imperial Modular Architecture.
"""
from .settings import settings
from .security import PostQuantumCryptoLock, FixedPointAccountingGuard, VolatileRAMCacheLedger
from .schemas import EduUpDatabase
from .ai_services import ChatGPTService, WolframAlphaService, ZeroHallucinationEngine

__all__ = [
    "settings",
    "PostQuantumCryptoLock",
    "FixedPointAccountingGuard",
    "VolatileRAMCacheLedger",
    "EduUpDatabase",
    "ChatGPTService",
    "WolframAlphaService",
    "ZeroHallucinationEngine",
]
