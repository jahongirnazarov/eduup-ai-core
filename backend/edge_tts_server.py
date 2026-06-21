"""
EduUpAI - Multi-Language Edge-TTS Server
Microsoft Edge-TTS wrapper for high-fidelity neural voice synthesis
Supports: Uzbek (Madina), English (Aria), Russian (Svetlana), German, Korean, Arabic
"""

import asyncio
import edge_tts
import aiofiles
import os
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="EduUpAI TTS Server")

# Voice mapping by language
VOICE_MAP = {
    'uz': {
        'name': 'uz-UZ-MadinaNeural',
        'description': 'Uzbek - Female, Professional Teacher'
    },
    'en': {
        'name': 'en-US-AriaNeural',
        'description': 'English - Female, IELTS/SAT Examiner'
    },
    'ru': {
        'name': 'ru-RU-SvetlanaNeural',
        'description': 'Russian - Female, Professional'
    },
    'de': {
        'name': 'de-DE-KatjaNeural',
        'description': 'German - Female, Professional'
    },
    'ko': {
        'name': 'ko-KR-SunHiNeural',
        'description': 'Korean - Female, Professional'
    },
    'ar': {
        'name': 'ar-SA-ZariyahNeural',
        'description': 'Arabic - Female, Professional'
    }
}

# Cache directory for audio files
CACHE_DIR = "tts_cache"
os.makedirs(CACHE_DIR, exist_ok=True)


class TTSRequest(BaseModel):
    text: str
    language: str = 'en'
    rate: str = '+0%'  # Speech rate
    pitch: str = '+0Hz'  # Pitch adjustment
    volume: str = '+0%'  # Volume


class TTSResponse(BaseModel):
    audio_url: str
    duration: float
    voice_used: str


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "EduUpAI TTS Server",
        "voices_available": list(VOICE_MAP.keys())
    }


@app.get("/voices")
async def get_voices():
    """Get available voices"""
    return VOICE_MAP


@app.post("/generate", response_model=TTSResponse)
async def generate_speech(request: TTSRequest):
    """
    Generate speech from text using Microsoft Edge-TTS
    
    Args:
        request: TTSRequest with text, language, and audio parameters
    
    Returns:
        TTSResponse with audio URL and metadata
    """
    try:
        # Validate language
        if request.language not in VOICE_MAP:
            raise HTTPException(
                status_code=400,
                detail=f"Language '{request.language}' not supported. Available: {list(VOICE_MAP.keys())}"
            )
        
        voice = VOICE_MAP[request.language]['name']
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(CACHE_DIR, filename)
        
        # Configure TTS
        communicate = edge_tts.Communicate(
            text=request.text,
            voice=voice,
            rate=request.rate,
            pitch=request.pitch,
            volume=request.volume
        )
        
        # Save audio to file
        await communicate.save(filepath)
        
        # Get file size for duration estimation (rough estimate)
        file_size = os.path.getsize(filepath)
        # Rough estimate: 1 second ≈ 8KB at 128kbps
        estimated_duration = file_size / 8000
        
        logger.info(f"Generated TTS: {request.text[:50]}... -> {filename}")
        
        return TTSResponse(
            audio_url=f"/audio/{filename}",
            duration=estimated_duration,
            voice_used=voice
        )
        
    except Exception as e:
        logger.error(f"TTS generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve generated audio file"""
    filepath = os.path.join(CACHE_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        filepath,
        media_type="audio/mpeg",
        filename=filename
    )


@app.delete("/cache")
async def clear_cache():
    """Clear all cached audio files"""
    try:
        for filename in os.listdir(CACHE_DIR):
            filepath = os.path.join(CACHE_DIR, filename)
            if os.path.isfile(filepath):
                os.remove(filepath)
        
        logger.info("TTS cache cleared")
        return {"status": "success", "message": "Cache cleared"}
        
    except Exception as e:
        logger.error(f"Failed to clear cache: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting EduUpAI TTS Server...")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )
