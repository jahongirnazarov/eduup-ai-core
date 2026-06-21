# -*- coding: utf-8 -*-
"""
⚙️ BACKEND SETTINGS MODULE
Global settings, environment variables, and API keys.
"""
from .config import Settings, get_settings, settings

__all__ = [
    "Settings",
    "get_settings",
    "settings",
]
