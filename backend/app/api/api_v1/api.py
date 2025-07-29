from fastapi import APIRouter
from app.api.api_v1.endpoints import health, tts, voice_cloning

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(tts.router, prefix="/tts", tags=["tts"])
api_router.include_router(voice_cloning.router, prefix="/voice-cloning", tags=["voice-cloning"])