from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    project_name: str = "Vietnamese TTS API"
    version: str = "1.0.0"
    api_v1_str: str = "/api/v1"
    
    # CORS
    backend_cors_origins: List[str] = ["http://localhost:3000"]
    
    # File storage
    storage_path: str = "storage"
    audio_path: str = "storage/audio"
    voices_path: str = "storage/voices"
    uploads_path: str = "storage/uploads"
    models_path: str = "storage/models"
    cache_path: str = "storage/cache"
    
    # TTS Settings
    default_voice: str = "vietnamese_female_1"
    supported_languages: List[str] = ["vi", "en", "fr"]
    max_text_length: int = 10000
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Create storage directories
os.makedirs(settings.audio_path, exist_ok=True)
os.makedirs(settings.voices_path, exist_ok=True)
os.makedirs(settings.uploads_path, exist_ok=True)
os.makedirs(settings.models_path, exist_ok=True)
os.makedirs(settings.cache_path, exist_ok=True)