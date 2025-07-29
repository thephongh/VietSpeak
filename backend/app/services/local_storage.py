import os
import json
import shutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from app.core.config import settings

class LocalStorageService:
    def __init__(self):
        self.ensure_directories()
    
    def ensure_directories(self):
        """Ensure all storage directories exist"""
        directories = [
            settings.audio_path,
            settings.voices_path,
            settings.uploads_path,
            settings.models_path,
            settings.cache_path
        ]
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
    
    def save_audio_metadata(self, audio_id: str, metadata: Dict) -> None:
        """Save metadata for generated audio"""
        metadata_path = os.path.join(settings.audio_path, f"{audio_id}.json")
        metadata["created_at"] = datetime.now().isoformat()
        metadata["file_path"] = f"{audio_id}.wav"
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
    
    def get_audio_metadata(self, audio_id: str) -> Optional[Dict]:
        """Get metadata for audio file"""
        metadata_path = os.path.join(settings.audio_path, f"{audio_id}.json")
        if os.path.exists(metadata_path):
            with open(metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def save_voice_profile(self, voice_id: str, profile_data: Dict) -> None:
        """Save voice profile metadata"""
        voice_dir = os.path.join(settings.voices_path, voice_id)
        os.makedirs(voice_dir, exist_ok=True)
        
        profile_path = os.path.join(voice_dir, "profile.json")
        profile_data["created_at"] = datetime.now().isoformat()
        profile_data["voice_id"] = voice_id
        
        with open(profile_path, 'w', encoding='utf-8') as f:
            json.dump(profile_data, f, ensure_ascii=False, indent=2)
    
    def get_voice_profile(self, voice_id: str) -> Optional[Dict]:
        """Get voice profile metadata"""
        profile_path = os.path.join(settings.voices_path, voice_id, "profile.json")
        if os.path.exists(profile_path):
            with open(profile_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def get_all_voice_profiles(self) -> List[Dict]:
        """Get all voice profiles"""
        profiles = []
        if os.path.exists(settings.voices_path):
            for voice_id in os.listdir(settings.voices_path):
                voice_dir = os.path.join(settings.voices_path, voice_id)
                if os.path.isdir(voice_dir):
                    profile = self.get_voice_profile(voice_id)
                    if profile:
                        profiles.append(profile)
        return profiles
    
    def list_voice_profiles(self) -> List[Dict]:
        """List all voice profiles (alias for get_all_voice_profiles)"""
        return self.get_all_voice_profiles()
    
    def delete_voice_profile(self, voice_id: str) -> None:
        """Delete voice profile metadata and directory"""
        voice_dir = os.path.join(settings.voices_path, voice_id)
        if os.path.exists(voice_dir):
            shutil.rmtree(voice_dir)
    
    def cleanup_old_files(self, max_age_hours: int = 24) -> None:
        """Clean up old temporary files"""
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        
        # Clean up old audio files
        self._cleanup_directory(settings.audio_path, cutoff_time)
        
        # Clean up uploads
        self._cleanup_directory(settings.uploads_path, cutoff_time)
        
        # Clean up cache
        self._cleanup_directory(settings.cache_path, cutoff_time)
    
    def _cleanup_directory(self, directory: str, cutoff_time: datetime) -> None:
        """Clean up files older than cutoff time in directory"""
        if not os.path.exists(directory):
            return
        
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                if file_time < cutoff_time:
                    try:
                        os.remove(file_path)
                    except OSError:
                        pass  # File might be in use
    
    def get_storage_stats(self) -> Dict:
        """Get storage usage statistics"""
        stats = {}
        directories = {
            "audio": settings.audio_path,
            "voices": settings.voices_path,
            "uploads": settings.uploads_path,
            "models": settings.models_path,
            "cache": settings.cache_path
        }
        
        for name, path in directories.items():
            if os.path.exists(path):
                total_size = 0
                file_count = 0
                for root, dirs, files in os.walk(path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        try:
                            total_size += os.path.getsize(file_path)
                            file_count += 1
                        except OSError:
                            pass
                
                stats[name] = {
                    "size_bytes": total_size,
                    "size_mb": round(total_size / 1024 / 1024, 2),
                    "file_count": file_count
                }
            else:
                stats[name] = {"size_bytes": 0, "size_mb": 0, "file_count": 0}
        
        return stats