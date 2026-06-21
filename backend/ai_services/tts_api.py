"""
TTS API Service
===============
FastAPI endpoints for multi-language text-to-speech service
Integrates with edge-tts engine for zero-cost speech synthesis
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path to import multimodal TTS engine
sys.path.append(str(Path(__file__).parent.parent.parent))
from business.multimodal.uzbek_tts_engine import multilang_tts_engine

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech"])


class TTSRequest(BaseModel):
    text: str
    language: str = "uz"
    speech_type: Optional[str] = "general"


class TeachingRequest(BaseModel):
    title: str
    explanation: str
    examples: list
    language: str = "uz"


class GreetingRequest(BaseModel):
    name: Optional[str] = None
    language: str = "uz"


@router.post("/synthesize")
async def synthesize_speech(request: TTSRequest):
    """
    Synthesize speech from text using edge-tts
    Returns audio file path and lip-sync data
    """
    try:
        result = await multilang_tts_engine.synthesize_speech(
            text=request.text,
            language=request.language
        )
        
        if result['status'] != 'success':
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
        
        return JSONResponse(content={
            "status": "success",
            "audio_file": result.get('audio_file'),
            "filename": result.get('filename'),
            "language": result['language'],
            "duration": result['duration'],
            "lip_sync_data": result['lip_sync_data'],
            "intonation": result['intonation'],
            "voice": result['voice']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/teaching")
async def generate_teaching_speech(request: TeachingRequest):
    """
    Generate teaching speech with educational content
    Optimized for lesson delivery
    """
    try:
        lesson_content = {
            'title': request.title,
            'explanation': request.explanation,
            'examples': request.examples
        }
        
        result = await multilang_tts_engine.generate_teaching_speech(lesson_content)
        
        if result['status'] != 'success':
            raise HTTPException(status_code=500, detail="Teaching speech generation failed")
        
        return JSONResponse(content={
            "status": "success",
            "audio_file": result.get('audio_file'),
            "filename": result.get('filename'),
            "language": result['language'],
            "duration": result['duration'],
            "lip_sync_data": result['lip_sync_data'],
            "script_parts": result['script_parts'],
            "speech_type": result['speech_type']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/greeting")
async def generate_greeting(request: GreetingRequest):
    """
    Generate natural greeting speech
    """
    try:
        result = await multilang_tts_engine.generate_greeting(request.name)
        
        if result['status'] != 'success':
            raise HTTPException(status_code=500, detail="Greeting generation failed")
        
        return JSONResponse(content={
            "status": "success",
            "audio_file": result.get('audio_file'),
            "filename": result.get('filename'),
            "text": result['text'],
            "language": result['language'],
            "duration": result['duration'],
            "lip_sync_data": result['lip_sync_data'],
            "speech_type": result['speech_type']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/encouragement")
async def generate_encouragement():
    """
    Generate encouraging speech for students
    """
    try:
        result = await multilang_tts_engine.generate_encouragement()
        
        if result['status'] != 'success':
            raise HTTPException(status_code=500, detail="Encouragement generation failed")
        
        return JSONResponse(content={
            "status": "success",
            "audio_file": result.get('audio_file'),
            "filename": result.get('filename'),
            "text": result['text'],
            "language": result['language'],
            "duration": result['duration'],
            "lip_sync_data": result['lip_sync_data'],
            "speech_type": result['speech_type']
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve generated audio files
    """
    try:
        audio_dir = Path(__file__).parent.parent.parent / "frontend" / "audio" / "tts"
        audio_path = audio_dir / filename
        
        if not audio_path.exists():
            raise HTTPException(status_code=404, detail="Audio file not found")
        
        return FileResponse(
            path=audio_path,
            media_type="audio/mpeg",
            filename=filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_available_voices():
    """
    Get list of available voices and languages
    """
    try:
        return JSONResponse(content={
            "languages": multilang_tts_engine.LANGUAGE_VOICE_MAPPING,
            "voices": multilang_tts_engine.get_available_voices()
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """
    Health check endpoint for TTS service
    """
    return JSONResponse(content={
        "status": "healthy",
        "service": "edge-tts",
        "supported_languages": list(multilang_tts_engine.LANGUAGE_VOICE_MAPPING.keys())
    })
