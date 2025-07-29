from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.version,
        "project": settings.project_name
    }