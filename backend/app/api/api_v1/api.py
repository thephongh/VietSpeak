from fastapi import APIRouter
from app.api.api_v1.endpoints import health, tts

api_router = APIRouter()

api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(tts.router, prefix="/tts", tags=["tts"])