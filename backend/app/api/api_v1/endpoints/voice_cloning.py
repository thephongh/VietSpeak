from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import uuid
import aiofiles
import tempfile

from app.services.voice_cloning_service import VoiceCloningService
from app.services.local_storage import LocalStorageService

router = APIRouter()

class VoiceCloneRequest(BaseModel):
    text: str
    voice_id: str
    language: str = "vi"
    speed: float = 1.0

class VoiceCloneResponse(BaseModel):
    audio_id: str
    message: str
    voice_id: str
    stats: Optional[dict] = None

class VoiceProfileResponse(BaseModel):
    voice_id: str
    name: str
    language: str
    description: Optional[str] = None
    created_at: str
    sample_duration: Optional[float] = None
    quality_score: Optional[float] = None

class VoiceTrainingRequest(BaseModel):
    name: str
    description: Optional[str] = None
    language: str = "vi"

class VoiceTrainingResponse(BaseModel):
    voice_id: str
    message: str
    status: str

@router.post("/upload-sample", response_model=VoiceTrainingResponse)
async def upload_voice_sample(
    audio_file: UploadFile = File(...),
    name: str = Form(...),
    description: Optional[str] = Form(None),
    language: str = Form("vi")
):
    """Upload audio sample and create custom voice profile"""
    try:
        # Validate file format
        if not audio_file.filename.lower().endswith(('.wav', '.mp3', '.flac', '.m4a')):
            raise HTTPException(status_code=400, detail="Unsupported audio format. Use WAV, MP3, FLAC, or M4A")
        
        # Check file size (limit to 50MB)
        content = await audio_file.read()
        if len(content) > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 50MB")
        
        voice_cloning_service = VoiceCloningService()
        storage_service = LocalStorageService()
        
        # Generate unique voice ID
        voice_id = str(uuid.uuid4())
        
        # Save uploaded file temporarily
        temp_file_path = os.path.join(tempfile.gettempdir(), f"{voice_id}_{audio_file.filename}")
        async with aiofiles.open(temp_file_path, 'wb') as f:
            await f.write(content)
        
        try:
            # Process and train voice model
            result = await voice_cloning_service.create_voice_profile(
                voice_id=voice_id,
                name=name,
                description=description,
                language=language,
                audio_file_path=temp_file_path
            )
            
            # Save voice profile metadata
            profile_data = {
                "voice_id": voice_id,
                "name": name,
                "description": description,
                "language": language,
                "created_at": result["created_at"],
                "sample_duration": result["sample_duration"],
                "quality_score": result.get("quality_score"),
                "file_info": result["file_info"]
            }
            storage_service.save_voice_profile(voice_id, profile_data)
            
            return VoiceTrainingResponse(
                voice_id=voice_id,
                message="Voice profile created successfully",
                status="completed"
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clone", response_model=VoiceCloneResponse)
async def clone_voice(request: VoiceCloneRequest):
    """Generate speech using cloned voice"""
    try:
        voice_cloning_service = VoiceCloningService()
        storage_service = LocalStorageService()
        
        # Verify voice profile exists
        voice_profile = storage_service.get_voice_profile(request.voice_id)
        if not voice_profile:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        
        # Generate speech with cloned voice
        result = await voice_cloning_service.synthesize_with_cloned_voice(
            text=request.text,
            voice_id=request.voice_id,
            language=request.language,
            speed=request.speed
        )
        
        # Save generation metadata
        metadata = {
            "text": request.text,
            "voice_id": request.voice_id,
            "language": request.language,
            "speed": request.speed,
            "stats": result["stats"],
            "file_info": result["file_info"]
        }
        storage_service.save_audio_metadata(result["audio_id"], metadata)
        
        return VoiceCloneResponse(
            audio_id=result["audio_id"],
            message="Speech generated successfully with cloned voice",
            voice_id=request.voice_id,
            stats=result["stats"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles", response_model=List[VoiceProfileResponse])
async def get_voice_profiles():
    """Get all available voice profiles"""
    try:
        storage_service = LocalStorageService()
        profiles = storage_service.get_all_voice_profiles()
        
        return [
            VoiceProfileResponse(
                voice_id=profile["voice_id"],
                name=profile["name"],
                language=profile["language"],
                description=profile.get("description"),
                created_at=profile["created_at"],
                sample_duration=profile.get("sample_duration"),
                quality_score=profile.get("quality_score")
            )
            for profile in profiles
        ]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profiles/{voice_id}", response_model=VoiceProfileResponse)
async def get_voice_profile(voice_id: str):
    """Get specific voice profile details"""
    try:
        storage_service = LocalStorageService()
        profile = storage_service.get_voice_profile(voice_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        
        return VoiceProfileResponse(
            voice_id=profile["voice_id"],
            name=profile["name"],
            language=profile["language"],
            description=profile.get("description"),
            created_at=profile["created_at"],
            sample_duration=profile.get("sample_duration"),
            quality_score=profile.get("quality_score")
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profiles/{voice_id}")
async def delete_voice_profile(voice_id: str):
    """Delete voice profile and associated files"""
    try:
        voice_cloning_service = VoiceCloningService()
        storage_service = LocalStorageService()
        
        # Check if profile exists
        profile = storage_service.get_voice_profile(voice_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Voice profile not found")
        
        # Delete voice model and files
        await voice_cloning_service.delete_voice_profile(voice_id)
        
        # Remove from storage
        storage_service.delete_voice_profile(voice_id)
        
        return {"message": "Voice profile deleted successfully"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sample/{voice_id}")
async def get_voice_sample(voice_id: str):
    """Download original voice sample audio"""
    try:
        voice_cloning_service = VoiceCloningService()
        sample_path = voice_cloning_service.get_voice_sample_path(voice_id)
        
        if not os.path.exists(sample_path):
            raise HTTPException(status_code=404, detail="Voice sample not found")
        
        return FileResponse(
            sample_path,
            media_type="audio/wav",
            filename=f"voice_sample_{voice_id}.wav"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))