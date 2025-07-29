from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
import os

from app.services.tts_service import TTSService
from app.services.local_storage import LocalStorageService

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    language: str = "vi"
    speed: float = 1.0
    voice_id: Optional[str] = None

class TTSResponse(BaseModel):
    audio_id: str
    message: str

@router.post("/synthesize", response_model=TTSResponse)
async def synthesize_text(request: TTSRequest):
    """Convert text to speech"""
    try:
        tts_service = TTSService()
        storage_service = LocalStorageService()
        
        # Synthesize text
        audio_id = await tts_service.synthesize_text(
            text=request.text,
            language=request.language,
            speed=request.speed,
            voice_id=request.voice_id
        )
        
        # Save metadata
        metadata = {
            "text": request.text,
            "language": request.language,
            "speed": request.speed,
            "voice_id": request.voice_id,
            "audio_id": audio_id
        }
        storage_service.save_audio_metadata(audio_id, metadata)
        
        return TTSResponse(
            audio_id=audio_id,
            message="Text synthesized successfully"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/audio/{audio_id}")
async def get_audio(audio_id: str):
    """Download generated audio file"""
    tts_service = TTSService()
    audio_path = tts_service.get_audio_path(audio_id)
    
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename=f"{audio_id}.wav"
    )

@router.get("/voices")
async def get_voices():
    """Get available voices"""
    tts_service = TTSService()
    return tts_service.get_voices()